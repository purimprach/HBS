import React, { useState } from 'react';
import './LoginPage.css'; 
import { Link } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* ส่วนซ้าย: รูปภาพ (ใช้รูปเดิม) */}
        <div className="login-image-section" style={{
            // *** คุณสามารถเปลี่ยน URL รูปภาพตรงนี้ได้ถ้าต้องการ ***
            backgroundImage: `url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop')`
        }}>
        </div>

        {/* ส่วนขวา: ฟอร์ม */}
        <div className="login-form-section">
          <div className="form-container">
            <div className="form-header">
              <div className="logo-icon">🏢</div>
              <h2>Create Account</h2> {/* <-- 1. แก้ไข Title */}
            </div>

            <form>
              {/* --- เพิ่มฟิลด์ Username --- */}
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* --- ฟิลด์ Email (เหมือนเดิม) --- */}
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* --- ฟิลด์ Password (เหมือนเดิม) --- */}
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="toggle-password" onClick={togglePasswordVisibility}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </div>
              </div>
              
              {/* ไม่มี "Forgot Password" ในหน้านี้ */}

              <button type="submit" className="login-button" style={{marginTop: '20px'}}>
                Create Account {/* <-- 2. แก้ไขข้อความปุ่ม */}
              </button>

              <div className="signup-link">
                Already have an account? <Link to="/login">Login</Link> 
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;