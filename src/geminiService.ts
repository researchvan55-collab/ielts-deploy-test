export const getIELTSFeedback = async (question: string, writing: string) => {
  const response = await fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, content: writing })
  });
  
  if (!response.ok) {
    throw new Error('Không thể kết nối với server AI');
  }
  
  return await response.json();
};
