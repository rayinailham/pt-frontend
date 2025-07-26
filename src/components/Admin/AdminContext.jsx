import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Initialize admin state
  useEffect(() => {
    initializeAdmin();
  }, []);

  const initializeAdmin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Check if admin token exists
      if (!adminService.isAuthenticated()) {
        setIsAuthenticated(false);
        setAdminUser(null);
        return;
      }

      // Verify token is still valid by making a profile request
      const response = await adminService.getProfile();
      setAdminUser(response.data.admin);
      setIsAuthenticated(true);
      
      // Update localStorage with fresh data
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
    } catch (error) {
      // Check if it's a network error (backend not available)
      if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
        // For network errors, don't clear session - backend might be temporarily down
        setIsAuthenticated(false);
        setAdminUser(null);
        setError('Backend server is not available. Please try again later.');
      } else {
        // Token is invalid or expired
        setIsAuthenticated(false);
        setAdminUser(null);
        adminService.logout(); // Clear invalid session
        setError('Session expired. Please login again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    setIsLoading(true);
    setError('');

    try {
      const { admin, token } = await adminService.login(username, password);
      setAdminUser(admin);
      setIsAuthenticated(true);
      return { success: true, admin, token };
    } catch (error) {
      setError(error.message);
      setIsAuthenticated(false);
      setAdminUser(null);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await adminService.logout();
    } catch (error) {
      // Silently handle logout errors
    } finally {
      setIsAuthenticated(false);
      setAdminUser(null);
      setError('');
      setIsLoading(false);
      navigate('/secretdashboard/login', { replace: true });
    }
  };

  const updateAdminProfile = (updatedAdmin) => {
    setAdminUser(updatedAdmin);
    localStorage.setItem('adminUser', JSON.stringify(updatedAdmin));
  };

  const refreshAdminProfile = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await adminService.getProfile();
      setAdminUser(response.data.admin);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
    } catch (error) {
      // Don't logout on refresh failure, silently handle error
    }
  };

  const value = {
    adminUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateAdminProfile,
    refreshAdminProfile,
    initializeAdmin
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export { AdminContext as default };
