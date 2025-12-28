export const getIELTSFeedback = async (question: string, writing: string) => {
  try {
    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, content: writing })
    });

    const contentType = response.headers.get("content-type");
    
    // Kiểm tra nếu server trả về TEXT thay vì JSON
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Server returned non-JSON:", text);
      throw new Error("Server bị lỗi hệ thống (không phải JSON). Vui lòng kiểm tra Vercel Logs.");
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Lỗi kết nối.");
  }
};
