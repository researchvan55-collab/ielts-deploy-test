import React from 'react';
const ScoreChart = ({ scores }: any) => (
  <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
    <p className="text-rose-800 font-bold">Biểu đồ điểm chi tiết</p>
    <div className="flex justify-around mt-2">
        <div>TR: {scores.taskResponse}</div>
        <div>CC: {scores.coherenceCohesion}</div>
        <div>LR: {scores.lexicalResource}</div>
        <div>GRA: {scores.grammaticalRange}</div>
    </div>
  </div>
);
export default ScoreChart;
