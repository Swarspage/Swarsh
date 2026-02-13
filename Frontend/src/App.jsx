import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
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

      {/* Onboarding - Standalone Flow */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Protected Routes Wrapped in Layout */}
      <Route element={<Layout />}>
        <Route path="/explore" element={<Explore />} />
        <Route path="/soulmate" element={<Soulmate />} />
        <Route path="/profile" element={<UserProfileSetting />} />
        <Route path="/settings" element={<AccountSetting />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;