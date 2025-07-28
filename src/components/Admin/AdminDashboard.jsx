import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const { adminUser } = useAdmin();
  const [stats, setStats] = useState({
    totalUsers: 0,
    recentUsers: [],
    systemHealth: 'unknown'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Only get recent users data - admin profile is already available from context
      const usersResponse = await adminService.getUsers(1, 5, '', 'created_at', 'DESC');

      setStats({
        totalUsers: usersResponse.data.pagination?.total || 0,
        recentUsers: Array.isArray(usersResponse.data.users) ? usersResponse.data.users : [],
        systemHealth: 'healthy'
      });
    } catch (err) {
      setError(adminService.handleError(err));
      // Set default values on error
      setStats({
        totalUsers: 0,
        recentUsers: [],
        systemHealth: 'error'
      });
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

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
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

  if (loading) {
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
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {getWelcomeMessage()}, {adminUser?.full_name || adminUser?.username}!
        </h1>
        <p className="mt-2 text-gray-400">
          Welcome to the Peta Talenta Admin Dashboard. Here's what's happening in your system.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-900 border border-red-700 p-4">
          <div className="text-sm text-red-200">{error}</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Total Users */}
        <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-white">{stats.totalUsers.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <button
                onClick={() => navigate('/secretdashboard/users')}
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                View all users
              </button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">System Status</dt>
                  <dd className="text-lg font-medium text-white capitalize">{stats.systemHealth}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-400">All systems operational</span>
            </div>
          </div>
        </div>

        {/* Admin Role */}
        <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">Your Role</dt>
                  <dd className="text-lg font-medium text-white">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(adminUser?.role)}`}>
                      {adminUser?.role}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <button
                onClick={() => navigate('/secretdashboard/profile')}
                className="font-medium text-purple-400 hover:text-purple-300"
              >
                Manage profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Recent Users</h3>
            <button
              onClick={() => navigate('/secretdashboard/users')}
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              View all
            </button>
          </div>
          
          {!Array.isArray(stats.recentUsers) || stats.recentUsers.length === 0 ? (
            <div className="text-center py-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-300">No users found</h3>
              <p className="mt-1 text-sm text-gray-400">No users have been registered yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-700">
                {Array.isArray(stats.recentUsers) && stats.recentUsers.map((user) => (
                  <li key={user.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                        <p className="text-sm text-gray-400">Joined {formatDate(user.created_at)}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.token_balance} tokens
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => navigate('/secretdashboard/users')}
              className="relative group bg-gray-700 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-600"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-white">Manage Users</h3>
                <p className="mt-2 text-sm text-gray-400">
                  View, search, and manage user accounts and token balances.
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/secretdashboard/profile')}
              className="relative group bg-gray-700 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-600"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-white">Admin Profile</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Update your profile information and change password.
                </p>
              </div>
            </button>

            {adminService.hasRole('superadmin') && (
              <button
                onClick={() => navigate('/admin-secure-portal/register')}
                className="relative group bg-gray-700 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-600"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-600 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-white">Register Admin</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Create new admin accounts with different permission levels.
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
