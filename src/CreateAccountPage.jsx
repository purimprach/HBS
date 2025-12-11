import React, { useState } from 'react';
import { ArrowLeft, Hotel, Eye, EyeOff } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import './LoginPlayerPage.css';

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="player-login-container">
      
      {/* ฝั่งซ้าย: รูปภาพ */}
      <div className="login-image-section" style={{
         backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')`
      }}>
      </div>

      {/* ฝั่งขวา: ฟอร์มสมัครสมาชิก */}
      <div className="login-form-section">
        
        {/* ปุ่ม Back (พากลับหน้า Login) */}
        <button className="back-btn" onClick={() => navigate('/login')}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="form-wrapper">
          <div className="form-header">
            <div className="icon-box">
              <Hotel size={32} color="#1a1a1a" strokeWidth={2} />
            </div>
            <h2>Create Account</h2>
          </div>

          <form className="login-form" onSubmit={(e) => e.preventDefault()}>
            
            <div className="input-group">
              <label>Username</label>
              <input type="text" placeholder="Enter your username" className="input-field" />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" className="input-field" />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  className="input-field"
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

            <div className="input-group">
              <label>Re-Password</label>
              <div className="password-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm your password" 
                  className="input-field"
                />
                <button 
                  type="button"
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ปุ่ม Create Account */}
            <button type="submit" className="submit-btn" style={{marginTop: '1.5rem'}}>
              Create Account
            </button>

            {/* ❌ ลบส่วน Already have an account? ออกไปแล้วครับ */}
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;