import React, { useState } from 'react';
import { ArrowLeft, Hotel, Eye, EyeOff } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import './LoginPlayerPage.css';

const PLAYERS_KEY = "hbs_players";

const CreateAccountPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleCreateAccount = (e) => {
    e.preventDefault();
    setError("");

    // 1️⃣ ตรวจกรอกครบ
    if (!username || !email || !password || !confirmPassword) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    // 2️⃣ ตรวจ password ตรงกัน
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    const players = JSON.parse(localStorage.getItem(PLAYERS_KEY) || "[]");

    // 3️⃣ ตรวจ email ซ้ำ
    const exists = players.some((p) => p.email === email);
    if (exists) {
      setError("อีเมลนี้ถูกใช้งานแล้ว");
      return;
    }

    // 4️⃣ สร้าง account
    const newPlayer = {
      id: crypto.randomUUID(),
      name: username,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      PLAYERS_KEY,
      JSON.stringify([...players, newPlayer])
    );

    alert("สมัครสมาชิกสำเร็จ 🎉");
    navigate("/login");
  };

  return (
    <div className="player-login-container">

      {/* ฝั่งซ้าย */}
      <div
        className="login-image-section"
        style={{
          backgroundImage:
            `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />

      {/* ฝั่งขวา */}
      <div className="login-form-section">

        <button className="back-btn" onClick={() => navigate('/login')}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="form-wrapper">
          <div className="form-header">
            <div className="icon-box">
              <Hotel size={32} />
            </div>
            <h2>Create Account</h2>
          </div>

          <form className="login-form" onSubmit={handleCreateAccount}>

            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

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

            <div className="input-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

            {error && (
              <div style={{ color: "red", fontSize: "0.85rem", marginBottom: 10 }}>
                {error}
              </div>
            )}

            <button type="submit" className="submit-btn" style={{ marginTop: '1.5rem' }}>
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;
