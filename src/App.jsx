import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

/* Utils */
import ScrollToTop from "./ScrollToTop";

/* ===== Layouts ===== */
import DashboardLayout from "./DashboardLayout";          // Player layout
import AdminDashboardLayout from "./AdminDashboardLayout"; // Admin layout

/* ===== Public / Auth Pages ===== */
import FirstLoginPage from "./FirstLoginPage";

/* Player Auth */
import LoginPlayerPage from "./LoginPlayerPage";
import CreateAccountPage from "./CreateAccountPage";
import ForgotPassword from "./ForgotPassword";

/* Admin Auth */
import LoginAdminPage from "./LoginAdminPage";
import VerifyAdminCodePage from "./VerifyAdminCodePage";
import CreateAdminAccountPage from "./CreateAdminAccountPage";
import AdminForgotPasswordPage from "./AdminForgotPasswordPage";
import AdminResetPasswordPage from "./AdminResetPasswordPage";

/* ===== Player Pages (ใช้ DashboardLayout) ===== */
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

/* ===== Admin Pages (ใช้ AdminDashboardLayout) ===== */
import AdminGameSettingsPage from "./AdminGameSettingsPage";

function App() {
  /* ===== Timer (สำหรับ Player เท่านั้น) ===== */
  const [timeLeft, setTimeLeft] = useState(900); // 15 นาที

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

        {/* ----- Player Auth ----- */}
        <Route path="/login" element={<LoginPlayerPage />} />
        <Route path="/signup" element={<CreateAccountPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ----- Admin Auth ----- */}
        <Route path="/admin-login" element={<LoginAdminPage />} />
        <Route path="/admin/verify" element={<VerifyAdminCodePage />} />
        <Route path="/admin/create-account" element={<CreateAdminAccountPage />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
        <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />

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

          {/* Player misc */}
          <Route path="/account" element={<AccountPage />} />
          <Route path="/waiting-room" element={<WaitingListPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* ================= ADMIN AREA ================= */}
        <Route element={<AdminDashboardLayout />}>
          <Route path="/admin/game-settings" element={<AdminGameSettingsPage />} />

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
