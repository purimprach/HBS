import React, { useEffect, useMemo, useState } from "react";
import "./CreateAdminAccountPage.css";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";

/* =========================
   LocalStorage Keys
   ========================= */
const VERIFIED_EMAIL_KEY = "hbs_admin_verified_email_v1";
const ADMINS_KEY = "hbs_admin_accounts_v1";

function safeParse(raw, fallback) {
  try {
    const x = JSON.parse(raw);
    return x == null ? fallback : x;
  } catch {
    return fallback;
  }
}

function normalizeEmail(s) {
  return (s || "").trim().toLowerCase();
}

function readAdmins() {
  const data = safeParse(localStorage.getItem(ADMINS_KEY), []);
  return Array.isArray(data) ? data : []; // ✅ บังคับให้เป็น array เสมอ
}

function writeAdmins(list) {
  localStorage.setItem(ADMINS_KEY, JSON.stringify(list));
}

export default function CreateAdminAccountPage() {
  const navigate = useNavigate();
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const verifiedEmail = useMemo(() => {
    return normalizeEmail(localStorage.getItem(VERIFIED_EMAIL_KEY));
  }, []);

  useEffect(() => {
    if (!verifiedEmail) {
      navigate("/admin/verify-code", { replace: true });
      return;
    }
    setEmail(verifiedEmail);
  }, [verifiedEmail, navigate]);

  const handleCreate = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const finalEmail = normalizeEmail(email);
    const finalUsername = (username || "").trim();

    if (!finalEmail) {
      setErrorMsg("Missing verified email. Please verify again.");
      navigate("/admin/verify-code");
      return;
    }
    if (!finalUsername) {
      setErrorMsg("Please enter username.");
      return;
    }
    if (pw1.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (pw1 !== pw2) {
      setErrorMsg("Password and Re-Password do not match.");
      return;
    }

    // ✅ อ่าน admins ให้ชัวร์ว่าเป็น array
    const admins = readAdmins();

    // ✅ กัน email ซ้ำแบบ normalize
    const emailExists = admins.some((a) => normalizeEmail(a?.email) === finalEmail);
    if (emailExists) {
      setErrorMsg("This email is already used for an admin account.");
      return;
    }

    // ✅ create account (email เก็บแบบ normalize เสมอ)
    const newAdmin = {
      id: `admin_${Date.now()}`,
      username: finalUsername,
      email: finalEmail,
      password: pw1, // demo only
      createdAt: new Date().toISOString(),
    };

    writeAdmins([newAdmin, ...admins]);

    // ✅ ล้าง token verify กันสร้างซ้ำ
    localStorage.removeItem(VERIFIED_EMAIL_KEY);

    navigate("/admin-login", { replace: true });
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
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="create-field">
              <label>Email Address (Verified)</label>
              <input type="email" value={email} readOnly disabled required />
            </div>

            <div className="create-field">
              <label>Password</label>
              <div className="create-password">
                <input
                  type={showPw1 ? "text" : "password"}
                  placeholder="Enter your password"
                  value={pw1}
                  onChange={(e) => setPw1(e.target.value)}
                  required
                />
                <button type="button" className="create-eye" onClick={() => setShowPw1((v) => !v)}>
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
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  required
                />
                <button type="button" className="create-eye" onClick={() => setShowPw2((v) => !v)}>
                  {showPw2 ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {errorMsg && <div className="create-error">{errorMsg}</div>}

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
