import React, { useState } from 'react';
import './LoginPage.css'; // ใช้ CSS ของ Player
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // ล็อกอินผู้เล่น ไปหน้า Account (เพื่อ Join/Create Team)
    navigate('/account'); 
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        
        {/* ส่วนซ้าย: รูปภาพ (วิวโรงแรม/ทะเล) */}
        <div className="login-image-section" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000&auto=format&fit=crop')`
        }}>
        </div>

        {/* ส่วนขวา: ฟอร์ม */}
        <div className="login-form-section">
            
          {/* ปุ่ม Back กลับไปหน้าเลือก Role */}
          <button 
            className="btn-back-link" 
            style={{top: '20px', left: '20px', position: 'absolute', border:'none', background:'none', cursor:'pointer', fontWeight:'bold', color:'#555'}}
            onClick={() => navigate('/')}
          >
             &lt; Back
          </button>

          <div className="form-container">
            <div className="form-header">
              <div className="logo-icon">🏨</div>
              <h2>Login Player</h2>
              <p style={{color:'#666', fontSize:'0.9rem'}}>Sign in to start your simulation</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" placeholder="Enter your email" required />
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    required 
                  />
                  <span 
                    className="toggle-password" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </div>
              </div>

              <div className="forgot-password">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <button type="submit" className="login-button">
                Login
              </button>

              <div className="signup-link">
                Don't have an account? <Link to="/register">Signup Here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;