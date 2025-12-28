import React, { useState } from 'react';
import { getIELTSFeedback } from './geminiService';
import ScoreChart from './components/ScoreChart';
import LoadingScreen from './components/LoadingScreen';

const App = () => {
  const [question, setQuestion] = useState('');
  const [writing, setWriting] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!question || !writing) return alert("Vui lòng nhập đủ đề bài và bài viết!");
    setLoading(true);
    setError('');
    try {
      const data = await getIELTSFeedback(question, writing);
      setFeedback(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-rose-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-rose-100">
        <div className="bg-rose-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider">For Myself - IELTS Master Feedback</h1>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-rose-800 font-bold mb-2">Đề bài (Task 2 Question):</label>
            <textarea 
              className="w-full p-4 border-2 border-rose-100 rounded-2xl focus:border-rose-400 outline-none transition"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Dán đề bài vào đây..."
            />
          </div>

          <div>
            <label className="block text-rose-800 font-bold mb-2">Bài viết của bạn:</label>
            <textarea 
              className="w-full p-4 border-2 border-rose-100 rounded-2xl focus:border-rose-400 outline-none transition"
              rows={10}
              value={writing}
              onChange={(e) => setWriting(e.target.value)}
              placeholder="Dán bài viết vào đây..."
            />
          </div>

          <button 
            onClick={handleAnalyze}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-2xl transition shadow-lg transform hover:scale-[1.01]"
          >
            CHẤM BÀI NGAY
          </button>

          {error && <div className="p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>}

          {feedback && (
            <div className="mt-8 space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-rose-600 text-white p-6 rounded-3xl text-center">
                  <p className="text-sm uppercase font-bold opacity-80">Overall Band Score</p>
                  <p className="text-6xl font-black mt-2">{feedback.estimatedScore?.total || 'N/A'}</p>
                </div>
                <ScoreChart scores={feedback.estimatedScore} />
              </div>
              
              <div className="bg-white border-2 border-rose-100 p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-rose-800 mb-4">Nhận xét chi tiết:</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {feedback.estimatedScore?.overallFeedback}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
