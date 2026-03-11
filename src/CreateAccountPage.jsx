import React, { useEffect, useState } from "react";
import { ArrowLeft, Hotel, Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginPlayerPage.css";

const PLAYER_SESSION_KEY = "hbs_current_player";

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

  const handleCreateAccount = async (e) => {
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

    try {
      const res = await fetch("http://localhost:5000/player-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "สมัครสมาชิกไม่สำเร็จ");
        return;
      }

      localStorage.setItem(
        PLAYER_SESSION_KEY,
        JSON.stringify({
          id: data.player.id,
          name: data.player.username,
          email: data.player.email,
          loginAt: new Date().toISOString(),
        })
      );

      alert("สมัครสมาชิกสำเร็จ 🎉");
      navigate("/account", { replace: true });
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
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
