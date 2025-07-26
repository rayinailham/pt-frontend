import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

const AdminRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    // Check if current admin has superadmin role
    if (!adminService.hasRole('superadmin')) {
      navigate('/secretdashboard', { replace: true });
      return;
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await adminService.registerAdmin({
        username: data.username,
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: data.role
      });

      setSuccess(`Admin ${data.username} has been successfully registered!`);
      reset();
    } catch (err) {
      setError(adminService.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'moderator', label: 'Moderator', description: 'Limited access for content moderation' },
    { value: 'admin', label: 'Admin', description: 'Full access to user management and standard operations' },
    { value: 'superadmin', label: 'Super Admin', description: 'Full system access including admin management' }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-white">Admin Registration</h1>
          <p className="mt-2 text-sm text-gray-400">
            Create new admin accounts. Only available to super administrators.
          </p>
        </div>
      </div>

      {(error || success) && (
        <div className={`mt-4 rounded-md p-4 ${error ? 'bg-red-900 border border-red-700' : 'bg-green-900 border border-green-700'}`}>
          <div className={`text-sm ${error ? 'text-red-200' : 'text-green-200'}`}>
            {error || success}
          </div>
        </div>
      )}

      <div className="mt-6 bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300">Username</label>
                <input
                  type="text"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Username must be at least 3 characters' },
                    maxLength: { value: 20, message: 'Username must be less than 20 characters' },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Username can only contain letters, numbers, and underscores'
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter username"
                  disabled={loading}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter email address"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Full Name</label>
              <input
                type="text"
                {...register('full_name', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Full name must be at least 2 characters' },
                  maxLength: { value: 50, message: 'Full name must be less than 50 characters' }
                })}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter full name"
                disabled={loading}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-400">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Role</label>
              <select
                {...register('role', { required: 'Role is required' })}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={loading}
              >
                <option value="">Select a role</option>
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>
              )}
              
              {/* Role descriptions */}
              <div className="mt-2 space-y-2">
                {roleOptions.map((role) => (
                  <div key={role.value} className="text-xs text-gray-400">
                    <span className="font-medium capitalize">{role.label}:</span> {role.description}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter password"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm the password',
                    validate: (value) => value === watch('password') || 'Passwords do not match'
                  })}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Confirm password"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-700 rounded-md p-4">
              <h4 className="text-sm font-medium text-white mb-2">Password Requirements:</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Contains at least one uppercase letter (A-Z)</li>
                <li>• Contains at least one lowercase letter (a-z)</li>
                <li>• Contains at least one number (0-9)</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => reset()}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Admin...
                  </>
                ) : (
                  'Create Admin Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 bg-yellow-900 border border-yellow-700 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-200">Security Notice</h3>
            <div className="mt-2 text-sm text-yellow-300">
              <ul className="list-disc list-inside space-y-1">
                <li>New admin accounts are created with immediate access</li>
                <li>Ensure you trust the person before creating their account</li>
                <li>All admin actions are logged for security auditing</li>
                <li>Consider using strong, unique passwords for all admin accounts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistration;
