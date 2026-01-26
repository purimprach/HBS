import React, { useEffect, useState } from "react";
import "./VerifyAdminCodePage.css";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, KeyRound } from "lucide-react";

export default function VerifyAdminCodePage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    // TODO: verify จริง
    setShowVerifyPopup(true);
  };

  // ESC ปิด popup ได้ทั้งสองอัน
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowVerifyPopup(false);
        setShowContactPopup(false);
      }
    };
    const anyOpen = showVerifyPopup || showContactPopup;
    if (anyOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showVerifyPopup, showContactPopup]);

  const closeAllPopups = () => {
    setShowVerifyPopup(false);
    setShowContactPopup(false);
  };

  return (
    <div className="verify-shell">
      <div className="verify-left" />

      <div className="verify-right">
        <button className="verify-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>

        <div className="verify-wrap">
          <div className="verify-header">
            <div className="verify-badge">
              <KeyRound size={18} />
            </div>
            <h1 className="verify-title">Verify code</h1>
            <p className="verify-subtitle">Verify code to create admin account</p>
          </div>

          <form className="verify-form" onSubmit={handleVerify}>
            <div className="verify-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="verify-field">
              <label>Invite code</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter your invite code"
                required
              />
            </div>

            <button type="submit" className="verify-submit">
              Verify Code
            </button>

            {/* ✅ No code? -> เปิด Contact popup */}
            <div className="verify-footer">
              <span>No code?</span>
              <button
                type="button"
                className="verify-link"
                onClick={() => setShowContactPopup(true)}
              >
                Contact System
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ===================== */}
      {/* ✅ Popup: Verify complete */}
      {/* ===================== */}
      {showVerifyPopup && (
        <div className="verify-modal-overlay" onClick={closeAllPopups}>
          <div className="verify-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="verify-check-circle">✓</div>
            <div className="verify-modal-text">Verify complete</div>
            <button
              className="verify-modal-btn"
              onClick={() => {
                closeAllPopups();
                navigate("/admin/create-account");
              }}
            >
              Go to create account
            </button>
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* ✅ Popup: Contact Information */}
      {/* ===================== */}
      {showContactPopup && (
        <div className="verify-modal-overlay" onClick={closeAllPopups}>
          <div
            className="contact-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header เขียว */}
            <div className="contact-modal-header">
              <div className="contact-title-row">
                <div className="contact-lock">🔒</div>
                <div className="contact-title">Contact Information</div>
              </div>

              <button
                type="button"
                className="contact-close-btn"
                onClick={closeAllPopups}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="contact-modal-body">
              <div className="contact-alert">
                <span className="contact-alert-icon">⚠️</span>
                <span>Your Account need to verify</span>
              </div>

              <div className="contact-text">Please contact :</div>

              <div className="contact-box">
                <div className="contact-row">
                    <span className="contact-name">K. Purimprach : </span>
                    <a
                    href="mailto:purimprach.san@gmail.com"
                    className="contact-email"
                    >
                    purimprach.san@gmail.com
                    </a>
                </div>

                <div className="contact-row">
                    <span className="contact-name">K. Supakit : </span>
                    <a
                    href="mailto:supakit.gtt@gmail.com"
                    className="contact-email"
                    >
                    supagit.gtt@gmail.com
                    </a>
                </div>
                </div>

              <div className="contact-footer">GT Technologies&nbsp; Co., Ltd.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
