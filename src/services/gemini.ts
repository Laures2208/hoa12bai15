import { GoogleGenAI } from "@google/genai";
import { ORES, QUIZ_QUESTIONS } from "../constants";
import { KNOWLEDGE_BASE } from "../document";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function getGeminiApiKey(): Promise<string | null> {
  try {
    const settingsDoc = await getDoc(doc(db, 'system_settings', 'config'));
    if (settingsDoc.exists() && settingsDoc.data().geminiApiKey) {
      return settingsDoc.data().geminiApiKey;
    }
  } catch (e) {
    console.error("Error fetching API key from settings:", e);
  }

  const envKey = import.meta.env.VITE_GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (envKey) return envKey;

  return null;
}

export async function askGemini(prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set');
    return null;
  }

  const genAI = new GoogleGenAI({ apiKey });
  
  // Ensure history starts with 'user' as required by some Gemini API versions
  let validHistory = [...history];
  if (validHistory.length > 0 && validHistory[0].role === 'model') {
    validHistory = validHistory.slice(1);
  }

  const chat = genAI.chats.create({
    model: "gemini-3.1-pro-preview",
    history: validHistory,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `Bạn là "Giáo sư Luyện Kim", một chuyên gia về hóa học vô cơ và luyện kim. 
      Nhiệm vụ của bạn là giải đáp các thắc mắc của học sinh về 3 phương pháp tách kim loại: Nhiệt luyện, Thủy luyện và Điện phân, cũng như Tái chế kim loại.
      
      Dưới đây là tài liệu chuyên sâu bạn CẦN SỬ DỤNG để trả lời các câu hỏi:
      ---
      ${KNOWLEDGE_BASE}
      ---
      
      Dưới đây là thông tin về các loại quặng trong ứng dụng:
      ${ORES.map(o => `- ${o.name} (${o.formula}): ${o.description}`).join('\n')}
      
      Dưới đây là một số câu hỏi kiến thức quan trọng:
      ${QUIZ_QUESTIONS.map(q => `- ${q.text} (Giải thích: ${q.insight})`).join('\n')}
      
      Hãy trả lời một cách chuyên nghiệp, dễ hiểu, sử dụng Markdown và LaTeX cho các công thức hóa học (ví dụ: $Fe_2O_3$).
      Sử dụng công cụ Google Search nếu cần thông tin cập nhật hoặc chi tiết hơn về các quy trình công nghiệp.
      Nếu học sinh hỏi ngoài chủ đề, hãy khéo léo dẫn dắt quay lại chủ đề luyện kim.`,
    },
  });

  const response = await chat.sendMessage({ message: prompt });
  return response.text;
}
