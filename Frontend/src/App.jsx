
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import SignupAndLogin from './Pages/SignupAndLogin';
import Explore from './Pages/Explore';
import Onboarding from './Pages/Onboarding';
import Soulmate from './Pages/Soulmate';
import UserProfileSetting from './Pages/UserProfileSetting';
import AccountSetting from './Pages/AccountSetting';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupAndLogin />} />
      <Route path="/login" element={<SignupAndLogin />} />

      {/* Protected Routes (Placeholder) */}
      <Route path="/explore" element={<Explore />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/soulmate" element={<Soulmate />} />
      <Route path="/profile" element={<UserProfileSetting />} />
      <Route path="/settings" element={<AccountSetting />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;