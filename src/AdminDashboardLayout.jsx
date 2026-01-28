import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
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

export default function AdminDashboardLayout() {
  const navigate = useNavigate();

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
              <div className="adl-app-sub">Admin / Host</div>
            </div>
          </div>
        </div>

        <nav className="adl-nav">
          <NavLink to="/admin/game-settings" className="adl-item">
            <PlusCircle size={18} />
            <span>สร้างการตั้งค่าเกม</span>
          </NavLink>

          <NavLink to="/admin/live" className="adl-item">
            <MonitorPlay size={18} />
            <span>ไลฟ์ / เกมที่ใช้งานอยู่</span>
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
              <div className="adl-avatar">AD</div>
              <div className="adl-user-text">
                <div className="adl-user-name">Admin</div>
                <div className="adl-user-role">Game Host</div>
              </div>
            </div>

            <button
              className="adl-logout"
              type="button"
              onClick={() => navigate("/admin-login")}
            >
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
