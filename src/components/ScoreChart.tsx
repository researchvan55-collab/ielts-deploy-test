import React from 'react';

const ScoreChart = ({ scores }: any) => {
  // Nếu chưa có dữ liệu, hiện thông báo trống thay vì làm sập app
  if (!scores) return <div className="text-rose-400 italic">Đang cập nhật điểm...</div>;

  return (
    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
      <p className="text-rose-800 font-bold text-center mb-3">Chi tiết tiêu chí</p>
      <div className="grid grid-cols-2 gap-2 text-sm text-rose-900">
        <div className="bg-white p-2 rounded-lg shadow-sm">TR: <span className="font-bold">{scores.taskResponse || 0}</span></div>
        <div className="bg-white p-2 rounded-lg shadow-sm">CC: <span className="font-bold">{scores.coherenceCohesion || 0}</span></div>
        <div className="bg-white p-2 rounded-lg shadow-sm">LR: <span className="font-bold">{scores.lexicalResource || 0}</span></div>
        <div className="bg-white p-2 rounded-lg shadow-sm">GRA: <span className="font-bold">{scores.grammaticalRange || 0}</span></div>
      </div>
    </div>
  );
};

export default ScoreChart;
