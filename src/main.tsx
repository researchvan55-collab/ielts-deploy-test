import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// File này sẽ tìm cái thẻ <div id="root"> trong index.html để đổ code vào
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
