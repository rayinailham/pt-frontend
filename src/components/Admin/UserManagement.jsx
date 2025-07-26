import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import adminService from '../../services/adminService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);

  // Search and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [limit, setLimit] = useState(10);

  const { register: registerToken, handleSubmit: handleTokenSubmit, reset: resetToken, formState: { errors: tokenErrors } } = useForm();

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, sortBy, sortOrder, limit]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await adminService.getUsers(currentPage, limit, searchTerm, sortBy, sortOrder);
      setUsers(Array.isArray(response.data.users) ? response.data.users : []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError(adminService.handleError(err));
      setUsers([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    setCurrentPage(1);
  };

  const handleViewUser = async (user) => {
    setLoading(true);
    try {
      const response = await adminService.getUserById(user.id);
      setSelectedUser(response.data.user);
      setShowUserDetail(true);
    } catch (err) {
      setError(adminService.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTokens = async (data) => {
    try {
      await adminService.updateUserTokenBalance(selectedUser.id, parseInt(data.token_balance), data.action);
      setShowTokenModal(false);
      resetToken();
      loadUsers();
      
      // Show success message
      setError('');
    } catch (err) {
      setError(adminService.handleError(err));
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminService.deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
      
      // Show success message
      setError('');
    } catch (err) {
      setError(adminService.handleError(err));
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

  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'ASC' ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-white">User Management</h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage all users in the system, update token balances, and view user statistics.
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-900 border border-red-700 p-4">
          <div className="text-sm text-red-200">{error}</div>
        </div>
      )}

      {/* Users Table */}
      <div className="mt-6 bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Email</span>
                    {getSortIcon('email')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800"
                  onClick={() => handleSort('token_balance')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Token Balance</span>
                    {getSortIcon('token_balance')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created At</span>
                    {getSortIcon('created_at')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.token_balance} tokens
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowTokenModal(true);
                        }}
                        className="text-green-400 hover:text-green-300"
                      >
                        Update Tokens
                      </button>
                      {adminService.hasRole('admin') && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md">
              {pagination.page}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Token Update Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white mb-4">Update Token Balance</h3>
              <form onSubmit={handleTokenSubmit(handleUpdateTokens)}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    User: {selectedUser?.email}
                  </label>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Balance: {selectedUser?.token_balance} tokens
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
                  <select
                    {...registerToken('action', { required: 'Action is required' })}
                    className="block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="set">Set to specific amount</option>
                    <option value="add">Add tokens</option>
                    <option value="subtract">Subtract tokens</option>
                  </select>
                  {tokenErrors.action && (
                    <p className="mt-1 text-sm text-red-400">{tokenErrors.action.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    min="0"
                    {...registerToken('token_balance', {
                      required: 'Amount is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {tokenErrors.token_balance && (
                    <p className="mt-1 text-sm text-red-400">{tokenErrors.token_balance.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTokenModal(false);
                      resetToken();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 border border-gray-600 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white text-center mb-4">Delete User</h3>
              <p className="text-sm text-gray-300 text-center mb-6">
                Are you sure you want to delete user <strong>{selectedUser?.email}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 border border-gray-600 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">User Details</h3>
                <button
                  onClick={() => setShowUserDetail(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Email</label>
                    <p className="mt-1 text-sm text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Token Balance</label>
                    <p className="mt-1 text-sm text-white">{selectedUser.token_balance} tokens</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Created At</label>
                    <p className="mt-1 text-sm text-white">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Updated At</label>
                    <p className="mt-1 text-sm text-white">{formatDate(selectedUser.updated_at)}</p>
                  </div>
                </div>

                {selectedUser.stats && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-white">Analysis Statistics</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Total Analyses</label>
                      <p className="mt-1 text-sm text-white">{selectedUser.stats.total_analyses}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Completed</label>
                      <p className="mt-1 text-sm text-green-400">{selectedUser.stats.completed_analyses}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Processing</label>
                      <p className="mt-1 text-sm text-yellow-400">{selectedUser.stats.processing_analyses}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Failed</label>
                      <p className="mt-1 text-sm text-red-400">{selectedUser.stats.failed_analyses}</p>
                    </div>
                    {selectedUser.stats.latest_analysis && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Latest Analysis</label>
                        <p className="mt-1 text-sm text-white">{formatDate(selectedUser.stats.latest_analysis)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
