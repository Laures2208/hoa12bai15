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
  )
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

  app.get("/api/admin/results", (req, res) => {
    try {
      const results = db.prepare("SELECT * FROM exam_results ORDER BY timestamp DESC").all();
      res.json(results);
    } catch (err) {
      console.error("Database error during fetch:", err);
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
