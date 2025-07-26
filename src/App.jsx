import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import NotificationContainer from './components/Layout/NotificationContainer';
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

    // Log request details in development
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Log error details in development
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }

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
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
