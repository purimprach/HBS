import React, { useState } from 'react';
import './LoginPage.css'; // ใช้ CSS เดิม
import { Link } from 'react-router-dom'; // Import Link

function ForgotPassword() {
  const [email, setEmail] = useState('');

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* ส่วนซ้าย: รูปภาพ (ใช้รูปเดิม) */}
        <div className="login-image-section" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop')`
        }}>
        </div>

        {/* ส่วนขวา: ฟอร์ม */}
        <div className="login-form-section">
          <div className="form-container">
            <div className="form-header">
              <div className="logo-icon">🏢</div>
              <h2>Forget Password</h2> {/* 1. แก้ Title */}
            </div>

            <form>
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

              {/* (ลบช่อง Password ออกไป) */}

              <button type="submit" className="login-button" style={{marginTop: '20px'}}>
                Send Resend Link {/* 2. แก้ข้อความปุ่ม */}
              </button>

              <div className="signup-link">
                 {/* 3. แก้ Link ให้กลับไปหน้า Login */}
                <Link to="/login">Back to Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;