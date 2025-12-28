import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(200).json({ status: "Ready" });

  try {
    const { question, content } = req.body;
    if (!process.env.GEMINI_API_KEY) throw new Error("API Key chưa có trên Vercel");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // THAY ĐỔI: Dùng model 'gemini-pro' thay vì 'gemini-1.5-flash' để ổn định hơn
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Bạn là giám khảo IELTS. Chấm bài Task 2 này và trả về JSON duy nhất.
    Đề bài: ${question}
    Bài làm: ${content}
    
    JSON format:
    {
      "estimatedScore": {
        "total": 6.5,
        "taskResponse": 7.0,
        "coherenceCohesion": 6.0,
        "lexicalResource": 7.0,
        "grammaticalRange": 6.0,
        "overallFeedback": "Your feedback here"
      }
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    const cleanJson = text.substring(start, end);
    
    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Lỗi:", error.message);
    return res.status(200).json({ // Trả về 200 nhưng chứa nội dung lỗi để app không sập
      estimatedScore: { 
        total: "Lỗi", 
        taskResponse: 0, 
        coherenceCohesion: 0, 
        lexicalResource: 0, 
        grammaticalRange: 0, 
        overallFeedback: "Vui lòng kiểm tra lại API Key hoặc vùng quốc gia. Lỗi: " + error.message 
      }
    });
  }
}
