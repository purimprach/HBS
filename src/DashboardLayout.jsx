// src/DashboardLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './EventPage.css'; // ใช้ CSS เดิม
import {
  Building2, LayoutDashboard, FileText, Target, TrendingUp,
  FileBarChart, Users, BookOpen, Settings, LogOut, Clock, User
} from 'lucide-react';

// รับ timeLeft มาจาก App.js เพื่อแสดงผลที่ Header
function DashboardLayout({ timeLeft }) {
  const location = useLocation(); // เช็คว่าอยู่หน้าไหนเพื่อทำเมนู Active

  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getTimerStatus = () => {
      if (timeLeft <= 60) return 'critical'; 
      if (timeLeft <= 180) return 'warning'; 
      return 'normal';                       
  };

  // ฟังก์ชันเช็คว่าเมนูไหน Active
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="dashboard-layout">
      
      {/* --- Sidebar (ส่วนกลาง) --- */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Building2 size={24} className="logo-icon" />
          <span>เกมจำลองธุรกิจโรงแรม</span>
        </div>

        <nav className="sidebar-menu desktop-menu">
          <div className="menu-group">
            <Link to="/home" className={`menu-item ${isActive('/home')}`}>
              <LayoutDashboard size={20} /> <span>หน้าภาพรวมข้อมูล</span>
            </Link>

            <Link to="/next-step" className={`menu-item ${isActive('/next-step')}`}>
              <FileText size={20} /> <span>บทวิเคราะห์</span>
            </Link>
            <Link to="/decision" className={`menu-item ${isActive('/decision')}`}>
                <Target size={20} /> <span>การตัดสินใจ</span>
            </Link>
            <a href="#" className="menu-item">
              <TrendingUp size={20} /> <span>ตลาดและคู่แข่ง</span>
            </a>
            <a href="#" className="menu-item">
              <FileBarChart size={20} /> <span>รายงานผล</span>
            </a>
            <a href="#" className="menu-item">
              <Users size={20} /> <span>จัดการทีม</span>
            </a>
          </div>

          <div className="menu-group bottom-group">
            <a href="#" className="menu-item">
              <BookOpen size={20} /> <span>คำศัพท์และคู่มือ</span>
            </a>
            
            <Link to="/game-settings" className={`menu-item ${isActive('/game-settings')}`}>
                <Settings size={20} /> <span>การตั้งค่า</span>
            </Link>

            <Link to="/" className="menu-item logout">
              <LogOut size={20} /> <span>ออกจากระบบ</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* --- Main Content Wrapper --- */}
      <main className="main-content-area bg-gray-soft">
        
        {/* --- Header (ส่วนกลาง) --- */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <span style={{ fontWeight: '500', color: '#333' }}>รอบ : <span style={{ color: '#2E7D32', fontWeight: 'bold' }}>1 / 12</span></span>
            <div className="divider-line"></div>
            <span style={{ color: '#333' }}>ไตรมาสที่ 1 ช่วงเดือน มกราคม-มีนาคม พ.ศ. 2569</span>
          </div>
          
          <div className="topbar-right">
            <div className={`timer-capsule ${getTimerStatus()}`}>
                <Clock size={20} className="timer-icon" />
                <span className="timer-label">เวลาที่เหลือ :</span>
                <span className="timer-countdown">{formatTime(timeLeft)}</span>
            </div>
            
            <div className="profile-separator"></div>

            <div className="user-profile-compact">
                 <div className="profile-icon-box">
                     <User size={20} color="#D4A017" strokeWidth={2.5} /> 
                 </div>
                 <div className="profile-text-box">
                    <span className="profile-name">Jane Doe</span>
                    <span className="profile-role">ผู้เล่น</span>
                 </div>
            </div>
          </div>
        </header>

        {/* ✅✅ Outlet คือจุดที่จะเปลี่ยนเนื้อหาตาม Route ✅✅ */}
        <Outlet />

      </main>
    </div>
  );
}

export default DashboardLayout;