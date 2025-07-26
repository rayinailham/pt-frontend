import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import NotificationContainer from './components/Layout/NotificationContainer';
import Footer from './components/Layout/Footer';
import AuthPage from './components/Auth/AuthPage';
import Dashboard from './components/Dashboard/Dashboard';
import AssessmentFlow from './components/Assessment/AssessmentFlow';
import AssessmentStatus from './components/Assessment/AssessmentStatus';
import ResultsPage from './components/Results/ResultsPage';
import ProfilePage from './components/Profile/ProfilePage';
import HealthCheck from './components/Admin/HealthCheck';
import SecretAdminDashboard from './components/Admin/SecretAdminDashboard';
import axios from 'axios';
import { API_CONFIG } from './config/api';

// Configure axios defaults
axios.defaults.baseURL = API_CONFIG.BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = API_CONFIG.TIMEOUT;

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Component to handle footer visibility based on route and loading state
const AppContent = () => {
  const location = useLocation();
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    // Small delay to ensure page content is rendered before showing footer
    const timer = setTimeout(() => {
      // Don't show footer on auth page or admin dashboard
      const hideFooterRoutes = ['/auth', '/secretdashboard'];
      const shouldHideFooter = hideFooterRoutes.some(route =>
        location.pathname.startsWith(route)
      );
      setShowFooter(!shouldHideFooter);
    }, 500); // 500ms delay to ensure content is loaded

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <div className="App">
        <NotificationContainer />
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/assessment" element={
            <ProtectedRoute>
              <AssessmentFlow />
            </ProtectedRoute>
          } />

          <Route path="/assessment/status/:jobId" element={
            <ProtectedRoute>
              <AssessmentStatus />
            </ProtectedRoute>
          } />

          <Route path="/results/:resultId" element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/health" element={
            <ProtectedRoute>
              <HealthCheck />
            </ProtectedRoute>
          } />

          {/* Secret Admin Dashboard - Hidden route, no navigation links */}
          <Route path="/secretdashboard/*" element={<SecretAdminDashboard />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>

      {/* Footer positioned outside App div, only shown when content is loaded */}
      {showFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <AppContent />
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
