import React from 'react';
import { Hotel } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. เพิ่ม import นี้
import './FirstLoginPage.css';

const FirstLoginPage = () => {
  const navigate = useNavigate(); // 2. สร้างตัวสั่งเปลี่ยนหน้า

  // ฟังก์ชันสำหรับกดปุ่ม
  const handlePlayerLogin = () => {
    navigate('/login'); // 3. สั่งให้ไปที่หน้า /login
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>

      <div className="login-card">
        <div className="icon-wrapper">
          <Hotel size={40} strokeWidth={2} color="#333" />
        </div>

        <h1 className="login-title">Welcome to HBS</h1>
        <p className="login-subtitle">HOTEL BUSINESS SIMULATOR</p>

        <div className="login-actions">
          {/* 4. เรียกใช้ฟังก์ชันใน onClick */}
          <button 
          className="player-login-btn" 
           onClick={() => navigate('/login')}
          >
            Login as a player
          </button>

          <button 
            className="admin-login-link" 
            onClick={() => console.log('Login as Admin clicked')}
          >
            Login as an admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstLoginPage;