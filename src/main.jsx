import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

// ⭐ เพิ่มบรรทัดนี้
import { makeScopedStorage } from './devStorage'

// ⭐ อ่าน client id จาก dev-client.html
const clientId = window.__DEV_CLIENT_ID__

// ⭐ ถ้ามี client id → ใช้ storage แบบแยก client
if (clientId) {
  window.localStorage = makeScopedStorage(clientId)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)