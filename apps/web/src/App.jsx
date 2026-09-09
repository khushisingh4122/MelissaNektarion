import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToTop from './components/ScrollToTop.jsx';
import { ThemeProvider } from './components/ThemeProvider.jsx';
import { LanguageProvider } from './i18n/useTranslation.jsx';

import DashboardOverview from './pages/DashboardOverview.jsx';
import FarmMap from './pages/FarmMap.jsx';
import AIChatbot from './pages/AIChatbot.jsx';
import AIAnalysis from './pages/AIAnalysis.jsx';
import DroneMonitoring from './pages/DroneMonitoring.jsx';
import CropHealthAnalysis from './pages/CropHealthAnalysis.jsx';
import PollinationMonitoring from './pages/PollinationMonitoring.jsx';
import YieldPrediction from './pages/YieldPrediction.jsx';
import GovernmentSchemes from './pages/GovernmentSchemes.jsx';
import AlertsNotifications from './pages/AlertsNotifications.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import FarmerSupportPage from './pages/FarmerSupportPage.jsx';
import MissionPlanning from './pages/MissionPlanning.jsx';
import DroneSimulation from './pages/DroneSimulation.jsx';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <ScrollToTop />

          <Toaster
            richColors
            position="top-right"
          />

          <Routes>

            <Route
              path="/"
              element={<DashboardOverview />}
            />

            <Route
              path="/farm-map"
              element={<FarmMap />}
            />

            <Route
              path="/ai-chatbot"
              element={<AIChatbot />}
            />

            <Route
              path="/ai-analysis"
              element={<AIAnalysis />}
            />

            <Route
              path="/drone-monitoring"
              element={<DroneMonitoring />}
            />

            <Route
              path="/mission-planning"
              element={<MissionPlanning />}
            />

            <Route
              path="/drone-simulation"
              element={<DroneSimulation />}
            />

            <Route
              path="/crop-health"
              element={<CropHealthAnalysis />}
            />

            <Route
              path="/pollination"
              element={<PollinationMonitoring />}
            />

            <Route
              path="/yield-prediction"
              element={<YieldPrediction />}
            />

            <Route
              path="/schemes"
              element={<GovernmentSchemes />}
            />

            <Route
              path="/alerts"
              element={<AlertsNotifications />}
            />

            <Route
              path="/profile"
              element={<ProfilePage />}
            />

            <Route
              path="/settings"
              element={<SettingsPage />}
            />

            <Route
              path="/farmer-support"
              element={<FarmerSupportPage />}
            />

          </Routes>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;