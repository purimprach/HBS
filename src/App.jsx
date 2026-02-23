import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom"; // ✅ เพิ่ม useNavigate
import DevMultiClientPage from "./DevMultiClientPage";

/* Utils */
import ScrollToTop from "./ScrollToTop";

/* ===== Layouts ===== */
import DashboardLayout from "./DashboardLayout";
import AdminDashboardLayout from "./AdminDashboardLayout";

/* ===== Public / Auth Pages ===== */
import FirstLoginPage from "./FirstLoginPage";

/* Player Auth */
import LoginPlayerPage from "./LoginPlayerPage";
import CreateAccountPage from "./CreateAccountPage";
import ForgotPassword from "./ForgotPassword";

/* Admin Auth */
import AdminLoginPage from "./AdminLoginPage";
import VerifyAdminCodePage from "./VerifyAdminCodePage";
import CreateAdminAccountPage from "./CreateAdminAccountPage";
import AdminForgotPasswordPage from "./AdminForgotPasswordPage";
import AdminResetPasswordPage from "./AdminResetPasswordPage";

/* ===== Player Pages ===== */
import HomePage from "./HomePage";
import EventPage from "./EventPage";
import SettingPageGame from "./SettingPageGame";
import DecisionPage from "./DecisionPage";
import PricingPage from "./PricingPage";
import MarketingPage from "./MarketingPage";
import PersonnelPage from "./PersonnelPage";
import MaintenancePage from "./MaintenancePage";
import OtherInvestmentsPage from "./OtherInvestmentsPage";
import AccountPage from "./AccountPage";
import WaitingListPage from "./WaitingListPage";
import SettingsPage from "./SettingsPage";

/* ===== Admin Pages ===== */
import AdminGameSettingsPage from "./AdminGameSettingsPage";
import AdminLobbyPage from "./AdminLobbyPage";
import AdminActiveGamesPage from "./AdminActiveGamesPage";

// ✅ 1. สร้าง Component สำหรับ Redirect ไปยังเกมล่าสุด
const AdminLiveRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // ดึงข้อมูลเกมทั้งหมดจาก LocalStorage
    const savedGames = JSON.parse(localStorage.getItem("hbs_games") || "[]");
    
    if (savedGames.length > 0) {
      // ถ้ามีเกม ให้ไปที่ห้องล่าสุด
      const lastGame = savedGames[savedGames.length - 1];
      navigate(`/admin/lobby/${lastGame.code}`, { replace: true });
    } else {
      // ถ้าไม่มีเกมเลย ให้เด้งไปหน้าสร้างเกม
      navigate("/admin/game-settings", { replace: true });
    }
  }, [navigate]);

  return <div style={{padding: 20}}>กำลังค้นหาเกมที่ใช้งานอยู่...</div>;
};

function App() {
  /* ===== Timer (สำหรับ Player เท่านั้น) ===== */
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* ================= PUBLIC / AUTH ================= */}
        <Route path="/" element={<FirstLoginPage />} />
        <Route path="/dev-multi" element={<DevMultiClientPage />} />

        {/* ----- Player Auth ----- */}
        <Route path="/login" element={<LoginPlayerPage />} />
        <Route path="/signup" element={<CreateAccountPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ----- Admin Auth ----- */}
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin/verify" element={<VerifyAdminCodePage />} />
        <Route path="/admin/create-account" element={<CreateAdminAccountPage />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
        <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />

        <Route path="/account" element={<AccountPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/waiting-room" element={<WaitingListPage />} />

        {/* ================= PLAYER AREA ================= */}
        <Route element={<DashboardLayout timeLeft={timeLeft} />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/next-step" element={<EventPage />} />
          <Route path="/game-settings" element={<SettingPageGame />} />
          <Route path="/decision" element={<DecisionPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/personnel" element={<PersonnelPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/other" element={<OtherInvestmentsPage />} />
        </Route>

        {/* ================= ADMIN AREA ================= */}
        <Route element={<AdminDashboardLayout />}>
          <Route path="/admin/game-settings" element={<AdminGameSettingsPage />} />
          <Route path="/admin/lobby/:gameCode" element={<AdminLobbyPage />} />
          <Route path="/admin/active-games" element={<AdminActiveGamesPage />} />

          {/* placeholder admin pages */}
          <Route path="/admin/players" element={<div>Admin Players / Teams (TODO)</div>} />
          <Route path="/admin/schedule" element={<div>Admin Schedule (TODO)</div>} />
          <Route path="/admin/overview" element={<div>Admin Overview (TODO)</div>} />
          <Route path="/admin/logs" element={<div>Admin Logs (TODO)</div>} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<FirstLoginPage />} />
      </Routes>
    </>
  );
}

export default App;