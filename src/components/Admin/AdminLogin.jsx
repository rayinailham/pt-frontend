import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAdmin } from './AdminContext';
import { performAdminSecurityCheck } from '../../utils/adminSecurity';

const AdminLogin = () => {
  const { login, isLoading, error } = useAdmin();
  const navigate = useNavigate();
  const [securityCheck, setSecurityCheck] = useState({ passed: true, failures: [] });
  const [isPerformingSecurityCheck, setIsPerformingSecurityCheck] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Perform security checks on component mount
  useEffect(() => {
    const checkSecurity = async () => {
      try {
        const result = await performAdminSecurityCheck({
          checkIP: true,
          checkRateLimit: false, // Don't check rate limit on page load
          checkTimeAccess: false // Optional time-based access
        });

        setSecurityCheck(result);
      } catch (error) {
        console.error('Security check failed:', error);
        setSecurityCheck({ passed: false, failures: ['SECURITY_CHECK_FAILED'] });
      } finally {
        setIsPerformingSecurityCheck(false);
      }
    };

    checkSecurity();
  }, []);

  const onSubmit = async (data) => {
    try {
      // Perform additional security checks before login
      const loginSecurityCheck = await performAdminSecurityCheck({
        checkIP: true,
        checkRateLimit: true,
        checkTimeAccess: false,
        identifier: data.username
      });

      if (!loginSecurityCheck.passed) {
        console.error('Login blocked by security checks:', loginSecurityCheck.failures);
        return;
      }

      const result = await login(data.username, data.password);

      if (result.success) {
        // Redirect to admin dashboard
        navigate('/admin-secure-portal', { replace: true });
      }
      // Error handling is done in the context
    } catch (err) {
      // Error handling is done in the context
    }
  };

  // Show loading during security check
  if (isPerformingSecurityCheck) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Performing security checks...</p>
        </div>
      </div>
    );
  }

  // Show security failure message
  if (!securityCheck.passed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-600 mb-6">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Your access to the admin panel has been restricted due to security policies.
          </p>
          <div className="text-sm text-gray-500">
            {securityCheck.failures.includes('IP_NOT_ALLOWED') && (
              <p className="mb-2">• Your IP address is not in the allowed list</p>
            )}
            {securityCheck.failures.includes('RATE_LIMIT_EXCEEDED') && (
              <p className="mb-2">• Too many login attempts detected</p>
            )}
            {securityCheck.failures.includes('TIME_ACCESS_DENIED') && (
              <p className="mb-2">• Access is restricted outside business hours</p>
            )}
            {securityCheck.failures.includes('SECURITY_CHECK_FAILED') && (
              <p className="mb-2">• Security validation failed</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-600">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Restricted area - Authorized personnel only
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                {...register('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' }
                })}
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                disabled={isLoading}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                type="password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-900 border border-red-700 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-200">
                    Authentication Failed
                  </h3>
                  <div className="mt-2 text-sm text-red-300">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Unauthorized entry will result in serious consequences.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
