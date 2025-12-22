import React from 'react';
import { Hotel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FirstLoginPage.css'; // Import CSS ที่เราจะเขียนใหม่

const FirstLoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* 1. พื้นหลังรูปภาพ (ใส่ URL รูปจริง หรือ path รูปใน project) */}
      <div className="background-image"></div>
      
      {/* 2. Overlay สีดำจางๆ เพื่อให้ข้อความเด่นขึ้น (ถ้าต้องการ) */}
      <div className="overlay"></div>

      {/* 3. กล่อง Login Card ตรงกลาง */}
      <div className="login-card-centered">
        
        {/* Icon โรงแรม */}
        <div className="icon-wrapper">
          <Hotel size={48} strokeWidth={2.5} color="#1a1a1a" />
        </div>

        {/* ข้อความหัวข้อ */}
        <h1 className="main-title">HOTEL BUSINESS SIMULATOR</h1>
        <p className="sub-title">WELCOME TO HBS</p>

        {/* ปุ่ม Login */}
        <div className="action-buttons">
          <button 
            className="btn-login-player" 
            onClick={() => navigate('/login')}
          >
            Login as a player
          </button>

          {/* ลิงก์ Admin เล็กๆ ด้านล่างขวา */}
          <button 
            className="link-login-admin"
            onClick={() => console.log('Go to Admin Login')}
          >
            Login as a admin
          </button>
        </div>

      </div>
    </div>
  );
};

export default FirstLoginPage;