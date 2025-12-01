import React from 'react';
import './FirstLoginPage.css';
import { useNavigate } from 'react-router-dom';

function FirstLoginPage() {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    console.log("Selected Role:", role); // เช็คใน Console ว่าค่ามาถูกไหม

    if (role === 'admin') {
      navigate('/admin-login'); // ถ้าเป็น admin ให้ไปหน้าใหม่ (Split Screen)
    } else {
      navigate('/login');       // ถ้าเป็น player ให้ไปหน้าเดิม (Login ปกติ)
    }
  };

  return (
    <div className="first-login-container">
      <div className="first-login-card">
        
        <div className="hb-icon">🏨</div>

        <h1>Welcome to HBS</h1>
        <p className="subtitle">Hotel Business Simulator</p>

        <div className="button-group">
            {/* ปุ่ม Player: ส่งค่า 'player' */}
            <button className="btn-role-login" onClick={() => handleLogin('player')}>
                Login as a player
            </button>
            
            {/* ปุ่ม Admin: ส่งค่า 'admin' */}
            <button className="btn-role-login" onClick={() => handleLogin('admin')}>
                Login as a admin
            </button>
        </div>

      </div>
    </div>
  );
}

export default FirstLoginPage;