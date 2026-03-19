import React, { useState } from 'react';
import { ArrowLeft, Hotel, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LoginPlayerPage.css';

const PLAYER_SESSION_KEY = "hbs_current_player";

const LoginPlayerPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/player-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      sessionStorage.setItem(
        PLAYER_SESSION_KEY,
        JSON.stringify({
          id: data.player.id,
          name: data.player.username,
          email: data.player.email,
          loginAt: new Date().toISOString(),
        })
      );

      navigate("/account");
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="player-login-container">

      {/* ฝั่งซ้าย */}
      <div
        className="login-image-section"
        style={{
          backgroundImage:
            `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />

      {/* ฝั่งขวา */}
      <div className="login-form-section">

        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="form-wrapper">
          <div className="form-header">
            <div className="icon-box">
              <Hotel size={32} />
            </div>
            <h2>Player Login</h2>
          </div>

          <form className="login-form" onSubmit={handleLogin}>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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

            {error && (
              <div style={{ color: "red", fontSize: "0.85rem", marginBottom: 10 }}>
                {error}
              </div>
            )}

            <button type="submit" className="submit-btn">
              Login
            </button>
          </form>

          <div className="signup-link">
            <p>
              Don't have an account?
              <span
                style={{ cursor: 'pointer', color: '#2E8B57', fontWeight: 600, marginLeft: 5 }}
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
