import React, { useMemo, useState } from "react";
import "./AdminLoginPage.css";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";

/* =========================
   LocalStorage Keys
   ========================= */
const ADMINS_KEY = "hbs_admin_accounts_v1";
const ADMIN_SESSION_KEY = "hbs_current_admin_v1"; // { id, username, email, createdAt, loginAt }

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

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // ✅ form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ error
  const [errorMsg, setErrorMsg] = useState("");

  const admins = useMemo(() => {
    const data = safeParse(localStorage.getItem(ADMINS_KEY), []);
    return Array.isArray(data) ? data : [];
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const eNorm = normalizeEmail(email);
    const pw = password || "";

    if (!eNorm) {
      setErrorMsg("Please enter a valid email.");
      return;
    }
    if (!pw) {
      setErrorMsg("Please enter password.");
      return;
    }

    // ✅ find admin
    const found = admins.find((a) => normalizeEmail(a?.email) === eNorm);

    if (!found) {
      setErrorMsg("Account not found. Please signup first.");
      return;
    }

    // ✅ demo check: password plain text (โปรเจกต์จริงควรใช้ hash)
    if ((found.password || "") !== pw) {
      setErrorMsg("Incorrect password.");
      return;
    }

    // ✅ create session
    const session = {
      id: found.id,
      username: found.username,
      email: normalizeEmail(found.email),
      createdAt: found.createdAt,
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));

    navigate("/admin/game-settings");
  };

  return (
    <div className="admin-login-shell">
      {/* Left image */}
      <div className="admin-login-left" />

      {/* Right form */}
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

            {/* ✅ error message */}
            {errorMsg && <div className="admin-error">{errorMsg}</div>}

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
