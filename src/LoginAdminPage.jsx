import React, { useState } from "react";
import "./LoginAdminPage.css";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";

export default function LoginAdminPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: เช็ค auth จริงภายหลัง
    navigate("/admin/game-settings");
  };

  return (
    <div className="admin-login-shell">
      {/* Left image */}
      <div className="admin-login-left" />

      {/* Right form */}
      <div className="admin-login-right">
        <button
          className="admin-back"
          type="button"
          onClick={() => navigate("/")}
        >
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
              <input type="email" placeholder="Enter your email" required />
            </div>

            <div className="admin-field">
              <label>Password</label>
              <div className="admin-password">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
                onClick={() => navigate("/admin-forgot-password")}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="admin-submit">
              Login
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
