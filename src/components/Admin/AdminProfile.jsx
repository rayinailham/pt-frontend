import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAdmin } from './AdminContext';
import adminService from '../../services/adminService';

const AdminProfile = () => {
  const { adminUser, updateAdminProfile } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors }
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors }
  } = useForm();

  useEffect(() => {
    // Initialize form with admin data from context
    if (adminUser) {
      resetProfile({
        email: adminUser.email,
        full_name: adminUser.full_name
      });
    }
  }, [adminUser, resetProfile]);

  const handleUpdateProfile = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await adminService.updateProfile(data);
      updateAdminProfile(response.data.admin);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(adminService.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminService.changePassword(data.currentPassword, data.newPassword);
      setSuccess('Password changed successfully');
      resetPassword();
    } catch (err) {
      setError(adminService.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'moderator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!adminUser) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-white">Admin Profile</h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage your admin account settings and security.
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

      {/* Admin Info Card */}
      <div className="mt-6 bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white text-xl font-medium">
                  {adminUser?.full_name?.charAt(0) || adminUser?.username?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">{adminUser?.full_name || adminUser?.username}</h3>
              <p className="text-sm text-gray-400">{adminUser?.email}</p>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(adminUser?.role)}`}>
                  {adminUser?.role}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-400">Username</dt>
              <dd className="mt-1 text-sm text-white">{adminUser?.username}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-400">Account Status</dt>
              <dd className="mt-1 text-sm text-white">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${adminUser?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {adminUser?.is_active ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-400">Last Login</dt>
              <dd className="mt-1 text-sm text-white">
                {adminUser?.last_login ? formatDate(adminUser.last_login) : 'Never'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-400">Account Created</dt>
              <dd className="mt-1 text-sm text-white">{formatDate(adminUser?.created_at)}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <div className="bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
              <form onSubmit={handleProfileSubmit(handleUpdateProfile)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Email</label>
                  <input
                    type="email"
                    {...registerProfile('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-red-400">{profileErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Full Name</label>
                  <input
                    type="text"
                    {...registerProfile('full_name', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Full name must be at least 2 characters' }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {profileErrors.full_name && (
                    <p className="mt-1 text-sm text-red-400">{profileErrors.full_name.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
              <form onSubmit={handlePasswordSubmit(handleChangePassword)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Current Password</label>
                  <input
                    type="password"
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required'
                    })}
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-400">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">New Password</label>
                  <input
                    type="password"
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-400">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                  <input
                    type="password"
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your new password',
                      validate: (value) => value === watch('newPassword') || 'Passwords do not match'
                    })}
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
