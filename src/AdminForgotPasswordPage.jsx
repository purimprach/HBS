import React, { useState } from "react";
import "./AdminForgotPasswordPage.css";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, KeyRound } from "lucide-react";

export default function AdminForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSend = (e) => {
    e.preventDefault();

    // TODO: ต่อ API ส่งลิงก์ reset สำหรับ admin
    console.log("Send admin reset link to:", email);

    // ✅ ไปหน้า AdminResetPasswordPage.jsx (ตาม route: /admin/reset-password)
    // ส่ง email ไปด้วย เผื่อหน้า reset ใช้ต่อ
    navigate("/admin/reset-password", { state: { email } });
  };

  return (
    <div className="admin-forgot-shell">
      <div className="admin-forgot-left" />

      <div className="admin-forgot-right">
        <button
          className="admin-forgot-back"
          type="button"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>

        <div className="admin-forgot-wrap">
          <div className="admin-forgot-header">
            <div className="admin-forgot-badge">
              <KeyRound size={18} />
            </div>

            {/* ✅ แก้ข้อความให้ถูก */}
            <h1 className="admin-forgot-title">Forgot Password</h1>
          </div>

          <form className="admin-forgot-form" onSubmit={handleSend}>
            <div className="admin-forgot-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* ✅ แก้ข้อความปุ่มให้ตรง */}
            <button type="submit" className="admin-forgot-submit">
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
