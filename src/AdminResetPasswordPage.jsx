import React, { useState } from "react";
import "./AdminResetPasswordPage.css";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, KeyRound } from "lucide-react";

export default function AdminResetPasswordPage() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Password does not match");
      return;
    }

    // TODO: ต่อ API reset password สำหรับ admin (พร้อม token)
    console.log("Reset admin password:", newPassword);

    // reset เสร็จจ → กลับไปหน้า admin login
    navigate("/admin-login");
  };

  return (
    <div className="admin-reset-shell">
      {/* LEFT IMAGE */}
      <div className="admin-reset-left" />

      {/* RIGHT */}
      <div className="admin-reset-right">
        <button className="admin-reset-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>

        <div className="admin-reset-wrap">
          <div className="admin-reset-header">
            <div className="admin-reset-badge">
              <KeyRound size={18} />
            </div>
            <h1 className="admin-reset-title">Forget Password</h1>
          </div>

          <form className="admin-reset-form" onSubmit={handleReset}>
            <div className="admin-reset-field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="admin-reset-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Reenter New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="admin-reset-submit">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
