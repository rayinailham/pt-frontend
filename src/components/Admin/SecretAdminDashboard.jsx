import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminProvider, useAdmin } from './AdminContext';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import AdminProfile from './AdminProfile';
import AdminRegistration from './AdminRegistration';
import AdminProtectedRoute from './AdminProtectedRoute';

const SecretAdminDashboard = () => {
  return (
    <AdminProvider>
      <SecretAdminDashboardContent />
    </AdminProvider>
  );
};

const SecretAdminDashboardContent = () => {
  const { isAuthenticated, isLoading } = useAdmin();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && !location.pathname.endsWith('/login')) {
    return <Navigate to="/secretdashboard/login" replace />;
  }

  // If authenticated and on login page, redirect to dashboard
  if (isAuthenticated && location.pathname.endsWith('/login')) {
    return <Navigate to="/secretdashboard" replace />;
  }

  return (
    <Routes>
      {/* Login route - accessible without authentication */}
      <Route
        path="/login"
        element={<AdminLogin />}
      />
      
      {/* Protected admin routes with enhanced security */}
      <Route path="/*" element={
        isAuthenticated ? (
          <AdminProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/profile" element={<AdminProfile />} />
                <Route path="/register" element={
                  <AdminProtectedRoute requiredRole="superadmin">
                    <AdminRegistration />
                  </AdminProtectedRoute>
                } />

                {/* Catch all route for admin area */}
                <Route path="*" element={<Navigate to="/admin-secure-portal" replace />} />
              </Routes>
            </AdminLayout>
          </AdminProtectedRoute>
        ) : (
          <Navigate to="/admin-secure-portal/login" replace />
        )
      } />
    </Routes>
  );
};

export default SecretAdminDashboard;
