import React, { useState } from 'react';
import './LoginAdminPage.css';
import { Link, useNavigate } from 'react-router-dom';

function LoginAdminPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Admin Login Submitted");
    navigate('/game-dashboard');
  };

  // ฟังก์ชันย้อนกลับ
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="admin-login-container">
      
      {/* ฝั่งซ้าย: รูปภาพ */}
      <div className="admin-left-panel"></div>

      {/* ฝั่งขวา: ฟอร์ม */}
      <div className="admin-right-panel">
        
        {/* 🔥 (1) ใส่ปุ่ม Back ตรงนี้ครับ 🔥 */}
        <button className="btn-back-link" onClick={handleBack}>
            &lt; Back
        </button>

        <div className="admin-login-box">
          
          <div className="icon-header">
            🛡️
          </div>
          <h1>Login Admin</h1>
          <p className="subtitle">Sign in to access admin</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  required 
                />
                <span 
                  className="eye-icon" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
            </div>

            <div className="forgot-password-link">
              <a href="#forgot">Forgot Password?</a>
            </div>

            <button type="submit" className="btn-admin-login">Login</button>
          </form>

          <div className="signup-link">
            Don't have an account? <a href="#signup">Signup Here</a>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginAdminPage;