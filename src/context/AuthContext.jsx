import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getUserData,
  setUserData,
  removeUserData,
  migrateFromLocalStorage
} from '../utils/cookieUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Migrate existing localStorage data to cookies
    migrateFromLocalStorage('token', setAuthToken);
    migrateFromLocalStorage('user', (userData) => {
      try {
        const parsedUser = JSON.parse(userData);
        return setUserData(parsedUser);
      } catch (error) {
        console.error('Failed to migrate user data:', error);
        return false;
      }
    });

    // Check for existing token on app start from cookies
    const savedToken = getAuthToken();
    const savedUser = getUserData();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }

    setIsLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);

    // Store in secure cookies instead of localStorage
    setAuthToken(newToken);
    setUserData(newUser);

    // Also clear any remaining localStorage data
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    // Remove from cookies
    removeAuthToken();
    removeUserData();

    // Also clear any remaining localStorage data
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);

    // Update in cookies
    setUserData(updatedUser);

    // Also clear any remaining localStorage data
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
