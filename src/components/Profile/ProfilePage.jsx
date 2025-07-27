import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import EnhancedLoadingScreen from '../UI/EnhancedLoadingScreen';
import ErrorMessage from '../UI/ErrorMessage';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';



const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, login, logout, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile form
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors }, setValue, reset: resetProfile } = useForm({
    mode: 'onChange',
    defaultValues: {
      username: '',
      full_name: '',
      date_of_birth: '',
      gender: ''
    }
  });

  // Password form
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm();



  useEffect(() => {
    fetchProfile();
  }, []);

  // Update form values when profileData changes
  useEffect(() => {
    if (profileData) {
      const userData = profileData.user || {};
      const profile = userData.profile || profileData.profile || {};

      const formValues = {
        username: userData.username || '',
        full_name: profile.full_name || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || ''
      };

      // Use setTimeout to ensure form is ready
      setTimeout(() => {
        resetProfile(formValues);
      }, 100);
    }
  }, [profileData, resetProfile]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await apiService.getProfile();

      if (response.success) {
        setProfileData(response.data);

        // Set form values with proper handling
        const userData = response.data.user || {};
        const profileData = userData.profile || response.data.profile || {};

        const formValues = {
          username: userData.username || '',
          full_name: profileData.full_name || '',
          date_of_birth: profileData.date_of_birth || '',
          gender: profileData.gender || ''
        };

        // Use reset to ensure form updates properly
        resetProfile(formValues);
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
      // Clean up data - remove empty strings
      const cleanData = {};
      if (data.username && data.username.trim()) cleanData.username = data.username.trim();
      if (data.full_name && data.full_name.trim()) cleanData.full_name = data.full_name.trim();
      if (data.date_of_birth && data.date_of_birth.trim()) cleanData.date_of_birth = data.date_of_birth;
      if (data.gender && data.gender.trim()) cleanData.gender = data.gender;

      const response = await apiService.updateProfile(cleanData);

      if (response.success) {
        // Update user context with new data
        const updatedUser = { ...user, ...response.data.user };
        updateUser(updatedUser);
        setProfileData(response.data);
        setSuccess('Profile updated successfully');

        // Update form values immediately with the response data
        const userData = response.data.user || {};
        const profileData = userData.profile || response.data.profile || {};

        const formValues = {
          username: userData.username || '',
          full_name: profileData.full_name || '',
          date_of_birth: profileData.date_of_birth || '',
          gender: profileData.gender || ''
        };

        resetProfile(formValues);
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
        {/* Main Content Area */}
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12">
          {/* Loading State */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedLoadingScreen
              title="Loading Profile..."
              subtitle="Fetching your account information and settings"
              skeletonCount={4}
              className="min-h-[400px]"
            />
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-200/60 pb-6 sm:pb-8 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-slate-900 mb-2 sm:mb-3">
                Account Settings
              </h1>
              <p className="text-slate-600 font-light text-base sm:text-lg">Manage your profile and security preferences</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-slate-900 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-slate-800 transition-colors duration-200 font-light shadow-sm text-sm sm:text-base touch-manipulation"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </motion.div>

        {/* Token Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-md p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-1">Available Credits</h3>
              <p className="text-slate-500 font-light text-sm sm:text-base">Assessment tokens remaining</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl sm:text-4xl font-light text-slate-900 tracking-tight">
                {profileData?.user?.token_balance ?? '...'}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider font-medium">Credits</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white border border-slate-200/60 shadow-sm rounded-md overflow-hidden"
        >
          <div className="border-b border-slate-200/60">
            <nav className="flex flex-col sm:flex-row overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 sm:py-5 px-4 sm:px-8 text-xs sm:text-sm font-medium transition-all duration-300 relative whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'text-slate-900 bg-slate-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/30'
                }`}
              >
                <span className="hidden sm:inline">Profile Information</span>
                <span className="sm:hidden">Profile</span>
                {activeTab === 'profile' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-3 sm:py-5 px-4 sm:px-8 text-xs sm:text-sm font-medium transition-all duration-300 relative whitespace-nowrap ${
                  activeTab === 'password'
                    ? 'text-slate-900 bg-slate-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/30'
                }`}
              >
                Security
                {activeTab === 'password' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-3 sm:py-5 px-4 sm:px-8 text-xs sm:text-sm font-medium transition-all duration-300 relative whitespace-nowrap ${
                  activeTab === 'account'
                    ? 'text-slate-900 bg-slate-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/30'
                }`}
              >
                <span className="hidden sm:inline">Account Management</span>
                <span className="sm:hidden">Account</span>
                {activeTab === 'account' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>
                )}
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6 lg:p-10">
            {/* Success/Error Messages */}
            {error && (
              <ErrorMessage
                title="Error"
                message={error}
                className="mb-8"
              />
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200/60 rounded-md p-5 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-emerald-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-slate-50/30 rounded-md p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-6 sm:space-y-8">
                  {/* Read-only Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profileData?.user?.email || ''}
                      disabled
                      className="block w-full px-4 py-3.5 border border-slate-200 rounded-md shadow-sm bg-slate-50 text-slate-500 focus:outline-none font-light"
                    />
                    <p className="mt-2 text-sm text-slate-500 font-light">Email address cannot be modified</p>
                  </div>

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-3">
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
                      className="block w-full px-4 py-3.5 border border-slate-200 rounded-md shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 font-light"
                      placeholder="Enter your username"
                    />
                    {profileErrors.username && (
                      <p className="mt-2 text-sm text-red-600 font-light">{profileErrors.username.message}</p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-3">
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
                      className="block w-full px-4 py-3.5 border border-slate-200 rounded-md shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 font-light"
                      placeholder="Enter your full name"
                    />
                    {profileErrors.full_name && (
                      <p className="mt-2 text-sm text-red-600 font-light">{profileErrors.full_name.message}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-slate-700 mb-3">
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
                      className="block w-full px-4 py-3.5 border border-slate-200 rounded-md shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 font-light"
                    />
                    {profileErrors.date_of_birth && (
                      <p className="mt-2 text-sm text-red-600 font-light">{profileErrors.date_of_birth.message}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-3">
                      Gender
                    </label>
                    <select
                      id="gender"
                      {...registerProfile('gender')}
                      className="block w-full px-4 py-3.5 border border-slate-200 rounded-md shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 font-light"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {profileErrors.gender && (
                      <p className="mt-2 text-sm text-red-600 font-light">{profileErrors.gender.message}</p>
                    )}
                  </div>



                  <div className="flex justify-end pt-4 sm:pt-6 border-t border-slate-200/60">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-md font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm touch-manipulation"
                    >
                      {isLoading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-slate-50/30 rounded-md p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-6 sm:space-y-8">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-3">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      {...registerPassword('currentPassword', {
                        required: 'Current password is required'
                      })}
                      className="block w-full px-4 py-3.5 border border-slate-200 rounded-md shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 font-light"
                      placeholder="Enter your current password"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600 font-light">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-3">
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
                      className="block w-full px-4 py-3.5 border border-slate-200 rounded-md shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 font-light"
                      placeholder="Enter your new password"
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-2 text-sm text-red-600 font-light">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-3">
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
                      className="block w-full px-4 py-3.5 border border-slate-200 rounded-md shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all duration-200 font-light"
                      placeholder="Confirm your new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 font-light">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-4 sm:pt-6 border-t border-slate-200/60">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-md font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm touch-manipulation"
                    >
                      {isLoading ? 'Changing...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="bg-slate-50/30 rounded-md p-4 sm:p-6 lg:p-8">
                <div className="space-y-6 sm:space-y-8">
                  <div className="bg-red-50 border border-red-200/60 rounded-md p-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Critical Actions</h3>
                        <div className="mt-2 text-sm text-red-700 font-light">
                          <p>Irreversible account operations require careful consideration.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/60 rounded-md p-4 sm:p-6 lg:p-8">
                    <h4 className="text-lg sm:text-xl font-medium text-slate-900 mb-3">Account Deletion</h4>
                    <p className="text-slate-600 font-light mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                      Permanently remove your account and all associated data. This action is irreversible and cannot be undone.
                    </p>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full sm:w-auto bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-sm touch-manipulation"
                      >
                        Delete Account
                      </button>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="bg-red-50 border border-red-200/60 rounded-md p-3 sm:p-4">
                          <p className="text-xs sm:text-sm font-medium text-red-800">
                            Confirm account deletion. This action is permanent and irreversible.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                          <button
                            onClick={onDeleteAccount}
                            disabled={isLoading}
                            className="w-full sm:w-auto bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm touch-manipulation"
                          >
                            {isLoading ? 'Processing...' : 'Confirm Deletion'}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isLoading}
                            className="w-full sm:w-auto bg-slate-200 text-slate-700 px-6 sm:px-8 py-3 sm:py-3.5 rounded-md font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 touch-manipulation"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
