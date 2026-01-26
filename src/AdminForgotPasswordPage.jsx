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

    // ถ้าจะให้มี popup success ค่อยเพิ่มได้
    // ตอนนี้ให้กลับไปหน้า admin login ก่อน
    navigate("/admin-reset-password");

  };

  return (
    <div className="admin-forgot-shell">
      <div className="admin-forgot-left" />

      <div className="admin-forgot-right">
        <button className="admin-forgot-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>

        <div className="admin-forgot-wrap">
          <div className="admin-forgot-header">
            <div className="admin-forgot-badge">
              <KeyRound size={18} />
            </div>
            <h1 className="admin-forgot-title">Forget Password</h1>
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

            <button type="submit" className="admin-forgot-submit">
              Send Resend Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
