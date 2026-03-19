import React, { useState } from "react";
import "./AdminLoginPage.css";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    sessionStorage.removeItem("hbs_admin_token");
    sessionStorage.removeItem("hbs_current_admin");

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || "Login failed");
        return;
      }

      sessionStorage.setItem("hbs_admin_token", data.token);
      sessionStorage.setItem("hbs_current_admin", JSON.stringify(data.admin));

      const savedGames = JSON.parse(localStorage.getItem("hbs_games") || "[]");

      if (savedGames.length > 0) {
        window.location.href = "/admin/active-games";
      } else {
        window.location.href = "/admin/game-settings";
      }

    } catch (err) {
      console.error(err);
      setErrorMsg("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-login-left" />

      <div className="admin-login-right">
        <button className="admin-back" type="button" onClick={() => navigate("/")}>
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>

        <div className="admin-form-wrap">
          <div className="admin-form-header">
            <div className="admin-badge">
              <Lock size={18} />
            </div>

            <h1 className="admin-title">Admin Login</h1>
            <p className="admin-subtitle">Sign in to access admin</p>
          </div>

          <form className="admin-form" onSubmit={handleLogin}>
            <div className="admin-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                required
              />
            </div>

            <div className="admin-field">
              <label>Password</label>
              <div className="admin-password">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  required
                />
                <button
                  type="button"
                  className="admin-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="admin-actions-row">
              <button
                type="button"
                className="admin-link"
                onClick={() => navigate("/admin/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>

            {errorMsg && <div className="admin-error">{errorMsg}</div>}

            <button type="submit" className="admin-submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="admin-footer">
              <span>Don&apos;t have an account?</span>
              <button
                type="button"
                className="admin-link"
                onClick={() => navigate("/admin/verify")}
              >
                Signup Here
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}