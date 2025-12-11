import React, { useState } from 'react';
import { ArrowLeft, Hotel, Eye, EyeOff } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import './LoginPlayerPage.css';

const LoginPlayerPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // ฟังก์ชันเมื่อกด Login
  const handleLogin = (e) => {
    e.preventDefault(); // ป้องกันหน้าเว็บรีโหลด
    
    // ตรงนี้ในอนาคตจะใส่โค้ดตรวจสอบ Username/Password
    // ตอนนี้สั่งให้ข้ามไปหน้า AccountPage เลย
    navigate('/account');
  };

  return (
    <div className="player-login-container">
      
      {/* ฝั่งซ้าย: รูปภาพ */}
      <div className="login-image-section" style={{
         backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop')`
      }}>
      </div>

      {/* ฝั่งขวา: ฟอร์ม Login */}
      <div className="login-form-section">
        
        {/* ปุ่ม Back กลับไปหน้าแรก */}
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="form-wrapper">
          <div className="form-header">
            <div className="icon-box">
              <Hotel size={32} color="#1a1a1a" strokeWidth={2} />
            </div>
            <h2>Player Login</h2>
          </div>

          {/* ✅ เรียกใช้ handleLogin เมื่อกดปุ่มหรือกด Enter */}
          <form className="login-form" onSubmit={handleLogin}>
            
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" className="input-field" required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  className="input-field"
                  required
                />
                <button 
                  type="button"
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="forgot-password">
              <span 
                style={{ cursor: 'pointer', color: '#2E8B57', fontWeight: '600', fontSize: '0.8rem' }}
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </span>
            </div>

            <button type="submit" className="submit-btn">
              Login
            </button>
          </form>

          <div className="signup-link">
            <p>Don't have an account? 
              <span 
                style={{ cursor: 'pointer', color: '#2E8B57', fontWeight: '600', marginLeft: '5px' }}
                onClick={() => navigate('/signup')}
              >
                 Signup Here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPlayerPage;