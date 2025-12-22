import React from 'react';
import { Routes, Route } from 'react-router-dom';

import FirstLoginPage from './FirstLoginPage';
import LoginPlayerPage from './LoginPlayerPage';
import CreateAccountPage from './CreateAccountPage';
import ForgotPassword from './ForgotPassword';
import AccountPage from './AccountPage';
import WaitingListPage from './WaitingListPage';
import HomePage from './HomePage';
import SettingsPage from './SettingsPage';
import LoginAdminPage from './LoginAdminPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<FirstLoginPage />} />
      <Route path="/login" element={<LoginPlayerPage />} />
      <Route path="/signup" element={<CreateAccountPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/waiting-room" element={<WaitingListPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/admin-login" element={<LoginAdminPage />} />
    </Routes>
  );
}

export default App;