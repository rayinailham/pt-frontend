import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import { useForm } from 'react-hook-form';

const ProfilePage = () => {
  const { user, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile form
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors }, setValue, reset: resetProfile } = useForm();

  // Password form
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await apiService.getProfile();
      if (response.success) {
        setProfileData(response.data);
        // Set form values
        setValue('username', response.data.user.username || '');
        setValue('full_name', response.data.profile?.full_name || '');
        setValue('date_of_birth', response.data.profile?.date_of_birth || '');
        setValue('gender', response.data.profile?.gender || '');
        setValue('school_id', response.data.profile?.school_id || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const onUpdateProfile = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Clean up data - remove empty strings and convert school_id to number
      const cleanData = {};
      if (data.username && data.username.trim()) cleanData.username = data.username.trim();
      if (data.full_name && data.full_name.trim()) cleanData.full_name = data.full_name.trim();
      if (data.date_of_birth) cleanData.date_of_birth = data.date_of_birth;
      if (data.gender) cleanData.gender = data.gender;
      if (data.school_id && data.school_id !== '') cleanData.school_id = parseInt(data.school_id);

      const response = await apiService.updateProfile(cleanData);

      if (response.success) {
        // Update user context with new data
        const updatedUser = { ...user, ...response.data.user };
        login(localStorage.getItem('token'), updatedUser);
        setProfileData(response.data);
        setSuccess('Profile updated successfully');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      if (response.success) {
        setSuccess('Password changed successfully');
        resetPassword();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteAccount = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.deleteAccount();

      if (response.success) {
        // Logout user and redirect
        logout();
        window.location.href = '/auth';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setShowDeleteConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Token Balance Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Token Balance</h3>
              <p className="text-sm text-gray-600">Available tokens for assessments</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">
                {profileData?.user?.token_balance ?? '...'}
              </div>
              <div className="text-sm text-gray-500">tokens</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'password'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'account'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Success/Error Messages */}
            {error && (
              <ErrorMessage
                title="Error"
                message={error}
                className="mb-6"
              />
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-6">
                {/* Read-only Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profileData?.user?.email || ''}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    {...registerProfile('username', {
                      pattern: {
                        value: /^[a-zA-Z0-9]+$/,
                        message: 'Username must be alphanumeric only'
                      },
                      minLength: {
                        value: 3,
                        message: 'Username must be at least 3 characters'
                      },
                      maxLength: {
                        value: 100,
                        message: 'Username must be at most 100 characters'
                      }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {profileErrors.username && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.username.message}</p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    {...registerProfile('full_name', {
                      maxLength: {
                        value: 100,
                        message: 'Full name must be at most 100 characters'
                      }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {profileErrors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.full_name.message}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    {...registerProfile('date_of_birth', {
                      validate: (value) => {
                        if (!value) return true; // Optional field
                        const selectedDate = new Date(value);
                        const today = new Date();
                        return selectedDate <= today || 'Date of birth cannot be in the future';
                      }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {profileErrors.date_of_birth && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.date_of_birth.message}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    id="gender"
                    {...registerProfile('gender')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {profileErrors.gender && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.gender.message}</p>
                  )}
                </div>

                {/* School ID */}
                <div>
                  <label htmlFor="school_id" className="block text-sm font-medium text-gray-700">
                    School ID
                  </label>
                  <input
                    type="number"
                    id="school_id"
                    {...registerProfile('school_id', {
                      min: {
                        value: 1,
                        message: 'School ID must be a positive number'
                      }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {profileErrors.school_id && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.school_id.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required'
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      },
                      pattern: {
                        value: /^(?=.*[A-Za-z])(?=.*\d)/,
                        message: 'Password must contain at least one letter and one number'
                      }
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your new password',
                      validate: (value, { newPassword }) =>
                        value === newPassword || 'Passwords do not match'
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Danger Zone</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-md p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Delete Account</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    This will permanently delete your account and all associated data. This action cannot be undone.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-red-600">
                        Are you absolutely sure? This action cannot be undone.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={onDeleteAccount}
                          disabled={isLoading}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          {isLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isLoading}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
