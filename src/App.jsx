import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import NotificationContainer from './components/Layout/NotificationContainer';
import GlobalNotificationHandler from './components/Layout/GlobalNotificationHandler';
import AuthPage from './components/Auth/AuthPage';
import Dashboard from './components/Dashboard/Dashboard';
import Assessment from './components/Assessment/Assessment';
import AssessmentStatus from './components/Assessment/AssessmentStatus';
import ResultsPage from './components/Results/ResultsPage';
import ResultOverview from './components/Results/ResultOverview';
import ResultViaIs from './components/Results/ResultViaIs';
import ResultRiasec from './components/Results/ResultRiasec';
import ResultOcean from './components/Results/ResultOcean';
import ResultPersona from './components/Results/ResultPersona';
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

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <div className="App">
            <NotificationContainer />
            <GlobalNotificationHandler />
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
                <Assessment />
              </ProtectedRoute>
            } />

            <Route path="/assessment/status/:jobId" element={
              <ProtectedRoute>
                <AssessmentStatus />
              </ProtectedRoute>
            } />

            <Route path="/results/:resultId" element={
              <ProtectedRoute>
                <ResultOverview />
              </ProtectedRoute>
            } />

            <Route path="/results/:resultId/via-is" element={
              <ProtectedRoute>
                <ResultViaIs />
              </ProtectedRoute>
            } />

            <Route path="/results/:resultId/riasec" element={
              <ProtectedRoute>
                <ResultRiasec />
              </ProtectedRoute>
            } />

            <Route path="/results/:resultId/ocean" element={
              <ProtectedRoute>
                <ResultOcean />
              </ProtectedRoute>
            } />

            <Route path="/results/:resultId/persona" element={
              <ProtectedRoute>
                <ResultPersona />
              </ProtectedRoute>
            } />

            <Route path="/results/:resultId/legacy" element={
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
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
