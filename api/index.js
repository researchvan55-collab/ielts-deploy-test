const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Cấu hình để nhận dữ liệu từ giao diện (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // Kiểm tra nếu không phải phương thức POST
  if (req.method !== 'POST') {
    return res.status(200).json({ message: "Backend IELTSTask2 đã sẵn sàng!" });
  }

  const { content } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = "Hãy đóng vai chuyên gia IELTS, chấm điểm và sửa lỗi chi tiết cho bài viết này: " + content;
    const result = await model.generateContent(prompt);
    
    res.status(200).json({ reply: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối AI: " + error.message });
  }
};
