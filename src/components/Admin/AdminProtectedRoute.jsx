import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from './AdminContext';

/**
 * Enhanced Admin Protected Route with additional security measures
 * Provides multiple layers of security for admin panel access
 */
const AdminProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  const { isAuthenticated, isLoading, adminUser } = useAdmin();
  const location = useLocation();
  const [securityChecks, setSecurityChecks] = useState({
    rateLimitPassed: true,
    sessionValid: true,
    roleAuthorized: true,
    timeBasedAccess: true
  });
  const [isPerformingSecurityChecks, setIsPerformingSecurityChecks] = useState(true);

  // Security check: Rate limiting for admin access attempts
  useEffect(() => {
    const checkRateLimit = () => {
      const now = Date.now();
      const attempts = JSON.parse(localStorage.getItem('adminAccessAttempts') || '[]');
      
      // Remove attempts older than 15 minutes
      const recentAttempts = attempts.filter(attempt => now - attempt < 15 * 60 * 1000);
      
      // Allow max 10 attempts per 15 minutes
      if (recentAttempts.length >= 10) {
        setSecurityChecks(prev => ({ ...prev, rateLimitPassed: false }));
        return false;
      }
      
      // Record this access attempt
      recentAttempts.push(now);
      localStorage.setItem('adminAccessAttempts', JSON.stringify(recentAttempts));
      
      return true;
    };

    checkRateLimit();
  }, [location.pathname]);

  // Security check: Session validation
  useEffect(() => {
    const validateSession = () => {
      if (!isAuthenticated || !adminUser) {
        setSecurityChecks(prev => ({ ...prev, sessionValid: false }));
        return false;
      }

      // Check if session is not too old (max 8 hours for admin)
      const sessionStart = localStorage.getItem('adminSessionStart');
      if (sessionStart) {
        const sessionAge = Date.now() - parseInt(sessionStart);
        const maxSessionAge = 8 * 60 * 60 * 1000; // 8 hours
        
        if (sessionAge > maxSessionAge) {
          setSecurityChecks(prev => ({ ...prev, sessionValid: false }));
          return false;
        }
      } else {
        // Set session start time if not exists
        localStorage.setItem('adminSessionStart', Date.now().toString());
      }

      return true;
    };

    if (!isLoading) {
      validateSession();
    }
  }, [isAuthenticated, adminUser, isLoading]);

  // Security check: Role-based authorization
  useEffect(() => {
    const checkRoleAuthorization = () => {
      if (!adminUser) return false;

      const roleHierarchy = {
        'moderator': 1,
        'admin': 2,
        'superadmin': 3
      };

      const userLevel = roleHierarchy[adminUser.role] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;

      const authorized = userLevel >= requiredLevel;
      setSecurityChecks(prev => ({ ...prev, roleAuthorized: authorized }));
      
      return authorized;
    };

    if (adminUser) {
      checkRoleAuthorization();
    }
  }, [adminUser, requiredRole]);

  // Security check: Time-based access (optional - can be configured)
  useEffect(() => {
    const checkTimeBasedAccess = () => {
      // Allow admin access only during business hours (optional security measure)
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday
      
      // For high-security environments, uncomment this to restrict access to business hours
      // const isBusinessHours = hour >= 8 && hour <= 18 && day >= 1 && day <= 5;
      // if (!isBusinessHours) {
      //   setSecurityChecks(prev => ({ ...prev, timeBasedAccess: false }));
      //   return false;
      // }

      return true;
    };

    checkTimeBasedAccess();
  }, []);

  // Complete security checks
  useEffect(() => {
    if (!isLoading) {
      setIsPerformingSecurityChecks(false);
    }
  }, [isLoading, securityChecks]);

  // Show loading while performing security checks
  if (isLoading || isPerformingSecurityChecks) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Check rate limiting
  if (!securityChecks.rateLimitPassed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Temporarily Restricted</h1>
          <p className="text-gray-400 mb-6">
            Too many access attempts detected. Please wait 15 minutes before trying again.
          </p>
          <p className="text-sm text-gray-500">
            This security measure helps protect against unauthorized access attempts.
          </p>
        </div>
      </div>
    );
  }

  // Check session validity
  if (!securityChecks.sessionValid) {
    localStorage.removeItem('adminSessionStart');
    return <Navigate to="/admin-secure-portal/login" replace />;
  }

  // Check role authorization
  if (!securityChecks.roleAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Insufficient Privileges</h1>
          <p className="text-gray-400 mb-6">
            Your account does not have the required permissions to access this area.
          </p>
          <p className="text-sm text-gray-500">
            Required role: {requiredRole} | Your role: {adminUser?.role || 'unknown'}
          </p>
        </div>
      </div>
    );
  }

  // Check time-based access
  if (!securityChecks.timeBasedAccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-blue-500 text-6xl mb-4">🕐</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Outside Business Hours</h1>
          <p className="text-gray-400 mb-6">
            Admin panel access is restricted to business hours (8 AM - 6 PM, Monday-Friday).
          </p>
          <p className="text-sm text-gray-500">
            For emergency access, please contact the system administrator.
          </p>
        </div>
      </div>
    );
  }

  // All security checks passed
  return children;
};

export default AdminProtectedRoute;
