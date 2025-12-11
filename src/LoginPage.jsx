import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FirstLoginPage.css';

const FirstLoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      {/* Overlay: เพิ่มความเข้มเพื่อให้ตัวหนังสือชัด */}
      <div className="login-overlay"></div>

      <div className="login-card">
        
        {/* ส่วนไอคอน (ใช้ SVG วาดสด ตัดปัญหา Import Error) */}
        <div className="icon-wrapper">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="M8 11h8" /> {/* ปรับแต่งให้ดูเหมือนช่องมองหรือลายโล่ */}
            <circle cx="12" cy="11" r="3" /> {/* หัวคน */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" opacity="0" /> {/* Frame หลอก */}
          </svg>
        </div>

        <h1 className="login-title">Welcome to HBS</h1>
        <p className="login-subtitle">HOTEL BUSINESS SIMULATOR</p>

        {/* ปุ่ม Login สีเขียว */}
        <button 
          className="login-btn" 
          onClick={() => navigate('/player-login')}
        >
          Login as a player
        </button>

        {/* ลิงก์ Admin อยู่ด้านล่างขวา */}
        <div className="admin-link-wrapper">
          <button 
            className="admin-link"
            onClick={() => console.log('Admin Login clicked')}
          >
            Login as a admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstLoginPage;