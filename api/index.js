import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Cấu hình Header
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(200).json({ status: "API is live" });

  try {
    const { question, content } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Grade this IELTS Task 2 essay. 
    Question: ${question}
    Essay: ${content}
    Return ONLY a JSON object. No markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Làm sạch dữ liệu JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const jsonData = JSON.parse(text);
    return res.status(200).json(jsonData);

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
