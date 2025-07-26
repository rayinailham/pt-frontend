import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Remove loading screen - let components handle their own loading states
  if (isLoading) {
    // Return null or a minimal loading indicator
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
