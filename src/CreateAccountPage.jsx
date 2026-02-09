import React, { useEffect, useState } from "react";
import { ArrowLeft, Hotel, Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginPlayerPage.css";

// ✅ ให้ตรงกับ AccountPage (ตอนนี้คุณใช้ hbs_players)
const USERS_KEY = "hbs_players";
const PLAYER_SESSION_KEY = "hbs_current_player";

function normalizeEmail(s) {
  return (s || "").trim().toLowerCase();
}

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  // ✅ ดึง email จาก query string (เช่น /signup?email=xxx)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromInvite = params.get("email");
    if (emailFromInvite) setEmail(emailFromInvite);
  }, [location.search]);

  const handleCreateAccount = (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    const emailNorm = normalizeEmail(email);

    let users = [];
    try {
      users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      if (!Array.isArray(users)) users = [];
    } catch {
      users = [];
    }

    const exists = users.some((u) => normalizeEmail(u?.email) === emailNorm);
    if (exists) {
      setError("อีเมลนี้ถูกใช้งานแล้ว");
      return;
    }

    const newUser = {
      id: crypto?.randomUUID ? crypto.randomUUID() : `u-${Date.now()}`,
      name: username.trim(),
      email: emailNorm,
      password,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));

    // ✅ ตั้ง session ให้เลย
    localStorage.setItem(
      PLAYER_SESSION_KEY,
      JSON.stringify({
        id: newUser.id, // ใช้ id เดียวกันไปเลย
        name: newUser.name,
        email: newUser.email,
      })
    );

    alert("สมัครสมาชิกสำเร็จ 🎉");
    navigate("/account", { replace: true });
  };

  return (
    <div className="player-login-container">
      <div
        className="login-image-section"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')",
        }}
      />

      <div className="login-form-section">
        <button className="back-btn" onClick={() => navigate("/login")}>
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
                  onClick={() => setShowPassword((v) => !v)}
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
                  onClick={() => setShowConfirmPassword((v) => !v)}
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

            <button type="submit" className="submit-btn" style={{ marginTop: "1.5rem" }}>
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
