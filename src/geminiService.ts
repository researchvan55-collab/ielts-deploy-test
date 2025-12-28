export const getIELTSFeedback = async (question: string, writing: string) => {
  const response = await fetch('/api', { // Đảm bảo có dấu gạch chéo trước api
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, content: writing })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Lỗi server AI');
  }
  
  return await response.json();
};
