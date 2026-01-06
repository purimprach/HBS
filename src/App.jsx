import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// ✅ Import Layout ที่สร้างไว้ (ถ้ายังไม่สร้าง ต้องสร้างไฟล์ DashboardLayout.jsx ก่อนนะครับ)
import DashboardLayout from './DashboardLayout';

import FirstLoginPage from './FirstLoginPage';
import LoginPlayerPage from './LoginPlayerPage';
import CreateAccountPage from './CreateAccountPage';
import ForgotPassword from './ForgotPassword';
import AccountPage from './AccountPage';
import WaitingListPage from './WaitingListPage';
import HomePage from './HomePage';
import SettingsPage from './SettingsPage';
import LoginAdminPage from './LoginAdminPage';
import EventPage from './EventPage'; 
import SettingPageGame from './SettingPageGame';

function App() {
  // 1. สร้าง State เวลาที่นี่ (จุดศูนย์กลาง)
  const [timeLeft, setTimeLeft] = useState(900); // 15 นาที = 900 วินาที

  // 2. สั่งให้เวลานับถอยหลังที่นี่ (ทำงานตลอดเวลา)
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft]);

  return (
    <Routes>
      {/* --- กลุ่มหน้าที่ "ไม่มี" Sidebar/Header (Login, Register ฯลฯ) --- */}
      <Route path="/" element={<FirstLoginPage />} />
      <Route path="/login" element={<LoginPlayerPage />} />
      <Route path="/signup" element={<CreateAccountPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/waiting-room" element={<WaitingListPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/admin-login" element={<LoginAdminPage />} />

      {/* --- ✅✅ กลุ่มหน้าที่ "ใช้" DashboardLayout ร่วมกัน (Sidebar/Header จะนิ่ง) --- */}
      {/* ส่ง timeLeft ให้ Layout จัดการแสดงผลที่ Header ครั้งเดียวจบ */}
      <Route element={<DashboardLayout timeLeft={timeLeft} />}>
        
        {/* หน้าลูกๆ ไม่ต้องรับ timeLeft แล้ว และให้ลบ Sidebar/Header ในไฟล์ลูกออกด้วย */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/next-step" element={<EventPage />} />
        <Route path="/game-settings" element={<SettingPageGame />} />
        
      </Route>

    </Routes>
  );
}

export default App;