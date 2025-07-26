import { useEffect, useState } from 'react';
import {
  User,
  LogOut,
  BarChart3,
  CheckCircle,
  Clock,
  Coins,
  Activity,
  XCircle,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import ConnectionStatus from './ConnectionStatus';
import { useDashboard } from '../../hooks/useDashboard';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, actions, hasError } = useDashboard();

  useEffect(() => {
    // Load dashboard data on component mount
    actions.fetchAllData();
  }, []);

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (err) {
      // Logout error handled silently
    } finally {
      logout();
      navigate('/auth');
    }
  };

  const handleProfile = () => {
    navigate('/profile');
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

  const [deleteLoading, setDeleteLoading] = useState({});

  const handleDelete = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) {
      return;
    }

    setDeleteLoading(prev => ({ ...prev, [resultId]: true }));
    try {
      await actions.deleteResult(resultId);
      // Refresh data after successful deletion
      actions.refreshData();
    } catch (err) {
      console.error('Failed to delete result:', err);
      alert('Failed to delete result. Please try again.');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [resultId]: false }));
    }
  };

  const handleView = (resultId) => {
    navigate(`/results/${resultId}`);
  };

  // Calculate status counts from results data
  const getStatusCounts = () => {
    if (!data.results || data.results.length === 0) {
      return { completed: 0, processing: 0, failed: 0 };
    }

    return data.results.reduce((counts, result) => {
      if (result.status === 'completed') counts.completed++;
      else if (result.status === 'processing') counts.processing++;
      else if (result.status === 'failed') counts.failed++;
      return counts;
    }, { completed: 0, processing: 0, failed: 0 });
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600 flex items-center space-x-1">
                  <span>Welcome back,</span>
                  <span className="font-medium text-indigo-600">{user?.email || 'User'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ConnectionStatus />

              <button
                onClick={handleProfile}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading.initial && (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {hasError && !loading.initial && (
          <ErrorMessage
            title="Failed to Load Dashboard"
            message={error.general || error.stats || error.results || error.tokenBalance}
            onRetry={actions.refreshData}
            retryText="Retry"
          />
        )}

        {/* Dashboard Content */}
        {!loading.initial && !hasError && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Token Balance Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Coins className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Token Balance</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {loading.tokenBalance ? (
                            <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                          ) : (
                            data.tokenBalance?.token_balance || 0
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Results Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {loading.results ? (
                            <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                          ) : (
                            statusCounts.completed
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Results Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Processing</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {loading.results ? (
                            <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                          ) : (
                            statusCounts.processing
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Failed Results Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {loading.results ? (
                            <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                          ) : (
                            statusCounts.failed
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 text-indigo-600 mr-2" />
                  Recent Results
                </h3>
                {/* New Assessment Button */}
                <button
                  onClick={() => navigate('/assessment')}
                  className="flex items-center space-x-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  title="Start New Assessment"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Assessment</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                {loading.results ? (
                  <div className="p-6">
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse flex items-center space-x-4">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : data.results?.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Archetype
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.results.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {result.assessment_name || 'Peta Talenta Assessment'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(result.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {result.status === 'completed' && result.persona_profile?.archetype ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {result.persona_profile.archetype}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  {result.status === 'completed' ? 'No archetype' : 'Processing...'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              result.status === 'completed' ? 'bg-green-100 text-green-800' :
                              result.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {result.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleView(result.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(result.id)}
                                disabled={deleteLoading[result.id]}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                {deleteLoading[result.id] ? (
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3 mr-1" />
                                )}
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Take an assessment to see your results here.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => navigate('/assessment')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Start Assessment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
