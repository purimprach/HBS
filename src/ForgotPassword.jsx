import React, { useState } from 'react';
import { ArrowLeft, Hotel, KeyRound } from 'lucide-react'; // เพิ่มไอคอน KeyRound
import { useNavigate } from 'react-router-dom';
import './LoginPlayerPage.css'; // ✅ ใช้ CSS ตัวเดิมเพื่อความสวยงาม

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  return (
    <div className="player-login-container">
      
      {/* ฝั่งซ้าย: รูปภาพ (เปลี่ยนรูปได้ตามต้องการ) */}
      <div className="login-image-section" style={{
         backgroundImage: `url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop')`
      }}>
      </div>

      {/* ฝั่งขวา: ฟอร์ม */}
      <div className="login-form-section">
        
        {/* ปุ่มย้อนกลับ */}
        <button className="back-btn" onClick={() => navigate('/login')}>
          <ArrowLeft size={20} />
          <span>Back to Login</span>
        </button>

        <div className="form-wrapper">
          <div className="form-header">
            <div className="icon-box">
               {/* ใช้ไอคอนกุญแจสื่อถึงรหัสผ่าน */}
              <KeyRound size={32} color="#1a1a1a" strokeWidth={2} />
            </div>
            <h2>Forgot Password</h2>
            <p style={{marginTop: '0.5rem', color: '#666', fontSize: '0.9rem'}}>
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="login-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-btn" style={{marginTop: '1rem'}}>
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;