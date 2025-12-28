const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // 1. Headers để tránh lỗi chặn kết nối (CORS)
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(200).json({ status: "API is live" });

  try {
    const { question, content } = req.body;

    // 2. Kiểm tra API Key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY in Vercel Environment Variables");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Prompt cực kỳ nghiêm ngặt
    const prompt = `Grade this IELTS Task 2 essay. 
    Question: ${question}
    Essay: ${content}
    
    IMPORTANT: You must return ONLY a JSON object. No intro, no outro, no markdown code blocks.
    Structure:
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
    let text = response.text();
    
    // 4. Làm sạch dữ liệu (Xóa bỏ ```json ... ``` nếu AI lỡ tay thêm vào)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // 5. Cố gắng parse JSON
    try {
      const jsonData = JSON.parse(text);
      return res.status(200).json(jsonData);
    } catch (parseError) {
      console.error("AI returned non-JSON:", text);
      return res.status(500).json({ 
        error: "AI Response was not valid JSON",
        debug: text.substring(0, 100) 
      });
    }

  } catch (error) {
    console.error("Critical Error:", error.message);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
};
