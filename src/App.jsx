import React from 'react';
import { Routes, Route } from 'react-router-dom';

import FirstLoginPage from './FirstLoginPage';
import LoginPlayerPage from './LoginPlayerPage';
import CreateAccountPage from './CreateAccountPage';
import ForgotPassword from './ForgotPassword';
import AccountPage from './AccountPage'; // ✅ Import มาใหม่

function App() {
  return (
    <Routes>
      <Route path="/" element={<FirstLoginPage />} />
      <Route path="/login" element={<LoginPlayerPage />} />
      <Route path="/signup" element={<CreateAccountPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/account" element={<AccountPage />} />
    </Routes>
  );
}

export default App;