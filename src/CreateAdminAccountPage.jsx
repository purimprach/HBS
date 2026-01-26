import React, { useState } from "react";
import "./CreateAdminAccountPage.css";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";

export default function CreateAdminAccountPage() {
  const navigate = useNavigate();
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    // TODO: ยิง API create account จริง
    navigate("/admin-login");
  };

  return (
    <div className="create-shell">
      <div className="create-left" />

      <div className="create-right">
        <button className="create-back" type="button" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>

        <div className="create-wrap">
          <div className="create-header">
            <div className="create-badge">
              <Lock size={18} />
            </div>
            <h1 className="create-title">Create Account Admin</h1>
            <p className="create-subtitle">Create account to access admin</p>
          </div>

          <form className="create-form" onSubmit={handleCreate}>
            <div className="create-field">
              <label>Username</label>
              <input type="text" placeholder="Enter your username" required />
            </div>

            <div className="create-field">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" required />
            </div>

            <div className="create-field">
              <label>Password</label>
              <div className="create-password">
                <input
                  type={showPw1 ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                />
                <button type="button" className="create-eye" onClick={() => setShowPw1(v => !v)}>
                  {showPw1 ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="create-field">
              <label>Re-Password</label>
              <div className="create-password">
                <input
                  type={showPw2 ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                />
                <button type="button" className="create-eye" onClick={() => setShowPw2(v => !v)}>
                  {showPw2 ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button type="submit" className="create-submit">
              Create Account
            </button>

            <div className="create-footer">
              <span>Already have an account?</span>
              <button type="button" className="create-link" onClick={() => navigate("/admin-login")}>
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
