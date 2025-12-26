import React from 'react';
import './FirstLoginPage.css';
import { useNavigate } from 'react-router-dom';

function FirstLoginPage() {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    if (role === 'admin') {
      navigate('/admin-login'); // ถ้าเป็น Admin ไปหน้า Login ใหม่ที่เพิ่งทำ
    } else {
      navigate('/login');       // ถ้าเป็น Player ไปหน้า Login เดิมที่เคยทำไว้
    }
  };

  return (
    <div className="first-login-container">
      <div className="first-login-card">
        
        <div className="hb-icon">
            🏨
        </div>

        <h1>Welcome to HBS</h1>
        <p className="subtitle">Hotel Business Simulator</p>

        <div className="button-group">
            {/* ปุ่ม Player: ส่งค่า 'player' เพื่อไปหน้า /login */}
            <button className="btn-role-login" onClick={() => handleLogin('player')}>
                Login as a player
            </button>
            
            {/* ปุ่ม Admin: ส่งค่า 'admin' เพื่อไปหน้า /admin-login */}
            <button className="btn-role-login" onClick={() => handleLogin('admin')}>
                Login as a admin
            </button>
        </div>

      </div>
    </div>
  );
}

export default FirstLoginPage;