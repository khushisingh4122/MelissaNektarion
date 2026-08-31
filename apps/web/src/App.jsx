import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import { ThemeProvider } from './components/ThemeProvider.jsx';
import { LanguageProvider } from './i18n/useTranslation.jsx';

import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

import DashboardOverview from './pages/DashboardOverview.jsx';
import FarmMap from './pages/FarmMap.jsx';
import AIChatbot from './pages/AIChatbot.jsx';
import DroneMonitoring from './pages/DroneMonitoring.jsx';
import CropHealthAnalysis from './pages/CropHealthAnalysis.jsx';
import PollinationMonitoring from './pages/PollinationMonitoring.jsx';
import YieldPrediction from './pages/YieldPrediction.jsx';
import GovernmentSchemes from './pages/GovernmentSchemes.jsx';
import AlertsNotifications from './pages/AlertsNotifications.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import FarmerSupportPage from './pages/FarmerSupportPage.jsx';

// ✅ AUTH CHECK
const isAuth = () => {
  return localStorage.getItem("agri_user") || sessionStorage.getItem("agri_user");
};

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <Routes>

            {/* ✅ LOGIN SYSTEM */}
            <Route
              path="/"
              element={isAuth() ? <DashboardOverview /> : <Login />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* ✅ ALL OTHER PAGES */}
            <Route path="/farm-map" element={<FarmMap />} />
            <Route path="/ai-chatbot" element={<AIChatbot />} />
            <Route path="/drone-monitoring" element={<DroneMonitoring />} />
            <Route path="/crop-health" element={<CropHealthAnalysis />} />
            <Route path="/pollination" element={<PollinationMonitoring />} />
            <Route path="/yield-prediction" element={<YieldPrediction />} />
            <Route path="/schemes" element={<GovernmentSchemes />} />
            <Route path="/alerts" element={<AlertsNotifications />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/farmer-support" element={<FarmerSupportPage />} />

          </Routes>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;