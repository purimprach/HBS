import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import หน้าทั้งหมด
import FirstLoginPage from './FirstLoginPage';
import LoginPage from './LoginPage';
import LoginAdminPage from './LoginAdminPage';
import AccountPage from './AccountPage';
import SettingsPage from './SettingsPage';
import WaitingListPage from './WaitingListPage'; 
import HotelOverviewPage from './HotelOverviewPage';

function App() {
  return (
    <Routes>
      {/* หน้าแรกสุด (Landing) */}
      <Route path="/" element={<FirstLoginPage />} />

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />      
      <Route path="/admin-login" element={<LoginAdminPage />} />

      {/* ระบบหลัก */}
      <Route path="/account" element={<AccountPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/waiting-list" element={<WaitingListPage />} />
      
      {/* 🔥 ต้องมีบรรทัดนี้ เพื่อให้ WaitingList เด้งมาที่นี่ได้ */}
      <Route path="/game-dashboard" element={<HotelOverviewPage />} />
    </Routes>
  );
}

export default App;