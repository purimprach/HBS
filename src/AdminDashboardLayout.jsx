import React, { useEffect, useMemo } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import "./AdminDashboardLayout.css";
import {
  PlusCircle,
  MonitorPlay,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Building2,
  Globe,
} from "lucide-react";

/* =========================
   LocalStorage Keys
   ========================= */
const ADMIN_SESSION_KEY = "hbs_current_admin_v1";

function safeParse(raw, fallback) {
  try {
    const x = JSON.parse(raw);
    return x == null ? fallback : x;
  } catch {
    return fallback;
  }
}

export default function AdminDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ อ่าน session ครั้งแรก
  const admin = useMemo(() => {
    return safeParse(localStorage.getItem(ADMIN_SESSION_KEY), null);
  }, []);

  // ✅ Guard: ถ้าไม่มี session -> เด้งกลับ login
  useEffect(() => {
    if (!admin) {
      navigate("/admin-login", { replace: true });
    }
  }, [admin, navigate]);

  // ✅ กัน flash: ถ้าไม่มี admin อย่า render layout
  if (!admin) return null;

  const adminName = admin?.username || "Admin";
  const avatarText = (adminName || "AD").slice(0, 2).toUpperCase();

  const isHostActive =
    location.pathname.startsWith("/admin/active-games") ||
    location.pathname.startsWith("/admin/lobby");

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    navigate("/admin-login", { replace: true });
  };

  return (
    <div className="adl-shell">
      {/* Sidebar */}
      <aside className="adl-sidebar">
        <div className="adl-side-header">
          <div className="adl-app">
            <div className="adl-app-icon">
              <Building2 size={18} />
            </div>
            <div className="adl-app-text">
              <div className="adl-app-title">จำลองธุรกิจโรงแรม</div>
            </div>
          </div>
        </div>

        <nav className="adl-nav">
          <NavLink to="/admin/game-settings" className="adl-item">
            <PlusCircle size={18} />
            <span>สร้างการตั้งค่าเกม</span>
          </NavLink>

          <NavLink
            to="/admin/active-games"
            className={`adl-item ${isHostActive ? "active" : ""}`}
          >
            <MonitorPlay size={18} />
            <span>เกมที่กำลังดำเนินอยู่</span>
          </NavLink>

          <NavLink to="/admin/overview" className="adl-item">
            <BarChart3 size={18} />
            <span>ประวัติและสถิติ</span>
          </NavLink>

          <NavLink to="/admin/players" className="adl-item">
            <Users size={18} />
            <span>ผู้เล่น/ทีม</span>
          </NavLink>

          <div className="adl-divider" />

          <NavLink to="/admin/settings" className="adl-item">
            <Settings size={18} />
            <span>การตั้งค่า</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <main className="adl-main">
        {/* Topbar */}
        <header className="adl-topbar">
          <div className="adl-top-left">Host / Active Game</div>

          <div className="adl-top-right">
            <button className="adl-lang" type="button">
              <Globe size={16} />
              <span>TH</span>
            </button>

            <div className="adl-user">
              <div className="adl-avatar">{avatarText}</div>
              <div className="adl-user-text">
                <div className="adl-user-name">{adminName}</div>
                <div className="adl-user-role">Game Host</div>
              </div>
            </div>

            <button className="adl-logout" type="button" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="adl-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
