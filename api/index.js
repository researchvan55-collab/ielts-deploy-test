const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Cấu hình Header cho phép giao diện gọi API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(200).send("Server đang chạy, chờ dữ liệu...");

  try {
    const { question, content } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Thiếu API Key trong Vercel Settings!" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Bạn là chuyên gia IELTS. Chấm bài: 
    Đề: ${question} 
    Bài: ${content}. 
    CHỈ TRẢ VỀ JSON, không có Markdown (như \`\`\`json), theo đúng mẫu: 
    {
      "estimatedScore": {"total": 6.5, "taskResponse": 7, "coherenceCohesion": 6, "lexicalResource": 7, "grammaticalRange": 6, "overallFeedback": "Good job"},
      "criteriaFeedback": {"taskResponse": "", "coherenceCohesion": "", "lexicalResource": "", "grammaticalRange": ""},
      "grammarAndVocabIssues": [],
      "sentenceComparisons": [],
      "advancedVocabulary": [],
      "scoringStructures": [],
      "modelAnswer": "..."
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Làm sạch dữ liệu nếu AI lỡ trả về text kèm JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const jsonData = JSON.parse(text);
    res.status(200).json(jsonData);

  } catch (error) {
    console.error("Lỗi Server:", error);
    res.status(500).json({ error: "Server AI lỗi: " + error.message });
  }
};
