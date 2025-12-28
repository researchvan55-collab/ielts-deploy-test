const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(200).send("API Ready");

  try {
    const { question, content } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Bạn là giám khảo IELTS. Chấm bài này:
    Đề bài: ${question}
    Bài làm: ${content}
    
    TRẢ VỀ DUY NHẤT 1 KHỐI JSON (không kèm chữ khác) theo cấu trúc:
    {
      "estimatedScore": {"total": 0, "taskResponse": 0, "coherenceCohesion": 0, "lexicalResource": 0, "grammaticalRange": 0, "overallFeedback": ""},
      "criteriaFeedback": {"taskResponse": "", "coherenceCohesion": "", "lexicalResource": "", "grammaticalRange": ""},
      "grammarAndVocabIssues": [],
      "sentenceComparisons": [],
      "advancedVocabulary": [],
      "scoringStructures": [],
      "modelAnswer": ""
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Tìm và lấy đúng phần JSON từ phản hồi của AI
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonData = JSON.parse(text.substring(jsonStart, jsonEnd));
    
    res.status(200).json(jsonData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi AI: " + error.message });
  }
};
