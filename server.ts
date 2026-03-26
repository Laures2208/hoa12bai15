import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "exam_results.db");
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    student_class TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', 'admin123');
`);

// Add column if it doesn't exist (for existing databases)
try {
  const tableInfo = db.prepare("PRAGMA table_info(exam_results)").all() as any[];
  const hasAnswersJson = tableInfo.some(col => col.name === 'answers_json');
  if (!hasAnswersJson) {
    db.exec("ALTER TABLE exam_results ADD COLUMN answers_json TEXT");
  }
} catch (e) {
  console.error("Error checking/altering table:", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", dbPath });
  });

  // API Routes
  app.post("/api/exam/submit", (req, res) => {
    console.log("Received submission:", req.body);
    const { name, studentClass, score, total, answers } = req.body;
    
    if (!name || !studentClass || score === undefined || !total) {
      console.log("Validation failed:", { name, studentClass, score, total });
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const stmt = db.prepare(
        "INSERT INTO exam_results (student_name, student_class, score, total_questions, answers_json) VALUES (?, ?, ?, ?, ?)"
      );
      stmt.run(name, studentClass, score, total, JSON.stringify(answers || []));
      console.log("Submission saved successfully");
      res.json({ success: true });
    } catch (err) {
      console.error("Database error during submission:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/leaderboard", (req, res) => {
    try {
      // Get top 10 results, sorted by score (desc) and then by timestamp (asc)
      const results = db.prepare("SELECT student_name, student_class, score, total_questions, timestamp FROM exam_results ORDER BY score DESC, timestamp ASC LIMIT 10").all();
      res.json(results);
    } catch (err) {
      console.error("Database error during fetch leaderboard:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/leaderboard/stats", (req, res) => {
    try {
      const stats = db.prepare(`
        SELECT 
          student_name, 
          student_class, 
          COUNT(*) as total_exams, 
          AVG(score) as avg_score,
          MAX(score) as max_score
        FROM exam_results
        GROUP BY student_name, student_class
      `).all();
      
      const mostExams = [...stats].sort((a: any, b: any) => b.total_exams - a.total_exams || b.avg_score - a.avg_score).slice(0, 10);
      const highestAvg = [...stats].sort((a: any, b: any) => b.avg_score - a.avg_score || a.total_exams - b.total_exams).slice(0, 10);
      
      res.json({ mostExams, highestAvg });
    } catch (err) {
      console.error("Database error during fetch leaderboard stats:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/student/results/:name/:class", (req, res) => {
    const { name, class: studentClass } = req.params;
    try {
      const results = db.prepare(`
        SELECT * FROM exam_results
        WHERE student_name = ? AND student_class = ?
        ORDER BY timestamp DESC
      `).all(name, studentClass);
      
      res.json(results);
    } catch (err) {
      console.error("Database error during fetch student results:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/student/stats/:name/:class", (req, res) => {
    const { name, class: studentClass } = req.params;
    try {
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total_exams, 
          AVG(score) as avg_score,
          MAX(score) as max_score,
          SUM(total_questions) as total_questions,
          SUM(score) as total_score
        FROM exam_results
        WHERE student_name = ? AND student_class = ?
      `).get(name, studentClass) as any;
      
      res.json(stats || { total_exams: 0, avg_score: 0, max_score: 0, total_questions: 0, total_score: 0 });
    } catch (err) {
      console.error("Database error during fetch student stats:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/admin/results", (req, res) => {
    try {
      const results = db.prepare("SELECT * FROM exam_results ORDER BY timestamp DESC").all();
      res.json(results);
    } catch (err) {
      console.error("Database error during fetch:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    try {
      const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get() as any;
      if (row && row.value === password) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid password" });
      }
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/admin/change-password", (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
      const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get() as any;
      if (row && row.value === oldPassword) {
        db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_password'").run(newPassword);
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid old password" });
      }
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.delete("/api/admin/students/:name/:class", (req, res) => {
    const { name, class: studentClass } = req.params;
    try {
      db.prepare("DELETE FROM exam_results WHERE student_name = ? AND student_class = ?").run(name, studentClass);
      res.json({ success: true });
    } catch (err) {
      console.error("Database error during delete student:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/admin/clear-data", (req, res) => {
    const { password } = req.body;
    try {
      const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get() as any;
      if (row && row.value === password) {
        db.prepare("DELETE FROM exam_results").run();
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid password" });
      }
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
