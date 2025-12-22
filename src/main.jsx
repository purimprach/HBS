import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' // ✅ ต้อง Import

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ ต้องหุ้ม App ด้วยตัวนี้ */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)