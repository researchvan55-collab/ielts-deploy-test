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
    if (!process.env.GEMINI_API_KEY) throw new Error("Key bị trống trên Vercel");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Bạn là giám khảo IELTS. Chấm bài này và TRẢ VỀ JSON DUY NHẤT. 
    Đề: ${question}
    Bài làm: ${content}
    
    Định dạng JSON bắt buộc:
    {
      "estimatedScore": {
        "total": 6.5,
        "taskResponse": 7.0,
        "coherenceCohesion": 6.0,
        "lexicalResource": 7.0,
        "grammaticalRange": 6.0,
        "overallFeedback": "Nhận xét tổng quát của bạn ở đây."
      }
    }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // MẸO: Chỉ lấy những gì nằm giữa dấu { và } để tránh rác văn bản
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    const cleanJson = text.substring(start, end);
    
    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Lỗi:", error.message);
    return res.status(500).json({ 
      error: "Server Error", 
      estimatedScore: { total: 0, taskResponse: 0, coherenceCohesion: 0, lexicalResource: 0, grammaticalRange: 0, overallFeedback: "Lỗi kết nối AI: " + error.message }
    });
  }
}
