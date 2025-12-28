import React from 'react';
const LoadingScreen = () => (
  <div className="p-20 text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
    <p className="mt-4 text-rose-600 font-bold">Đang phân tích bài viết...</p>
  </div>
);
export default LoadingScreen;
