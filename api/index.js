const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Cấu hình Header quan trọng
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // Nếu không phải POST, vẫn trả về JSON để tránh lỗi "Unexpected token"
  if (req.method !== 'POST') {
    return res.status(200).json({ message: "Server is ready" });
  }

  try {
    const { question, content } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt siêu chi tiết để ép AI không nói nhảm, chỉ trả về JSON
    const prompt = `You are an IELTS examiner. Grade this essay.
    Task: ${question}
    Essay: ${content}
    
    IMPORTANT: Return ONLY a raw JSON object. No markdown, no "json" word.
    Structure:
    {
      "estimatedScore": {"total": 6.5, "taskResponse": 7, "coherenceCohesion": 6, "lexicalResource": 7, "grammaticalRange": 6, "overallFeedback": "Feedback here"},
      "criteriaFeedback": {"taskResponse": "...", "coherenceCohesion": "...", "lexicalResource": "...", "grammaticalRange": "..."},
      "grammarAndVocabIssues": [],
      "sentenceComparisons": [],
      "advancedVocabulary": [],
      "scoringStructures": [],
      "modelAnswer": "..."
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Kiểm tra xem có phải JSON không trước khi gửi về
    try {
      const jsonData = JSON.parse(text);
      res.status(200).json(jsonData);
    } catch (e) {
      // Nếu AI trả về text thường, mình sẽ bọc nó vào JSON
      res.status(500).json({ error: "AI returned invalid format", detail: text });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
