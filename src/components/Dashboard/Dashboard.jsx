import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import { useDashboard } from '../../hooks/useDashboard';
import EnhancedLoadingScreen from '../UI/EnhancedLoadingScreen';
import ErrorMessage from '../UI/ErrorMessage';

// Import new components
import DashboardHeader from './components/DashboardHeader';
import StatsCards from './components/StatsCards';
import ResultsTable from './components/ResultsTable';
import ArticlesSection from './components/ArticlesSection';


export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, loading, error, actions, hasError } = useDashboard();

  useEffect(() => {
    // Load dashboard data on component mount
    actions.fetchAllData();
  }, []);

  // Auto-refresh when coming back from assessment
  useEffect(() => {
    // Check if user came from assessment submission
    if (location.state?.fromAssessment) {
      // Refresh only results table to show new assessment with processing status
      setTimeout(() => {
        actions.fetchResults();
      }, 1000); // Small delay to ensure backend has processed the submission

      // Clear the state to prevent repeated refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, actions, navigate, location.pathname]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Header */}
      <DashboardHeader
        user={user}
        onProfile={handleProfile}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading.initial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedLoadingScreen
              title="Loading Dashboard..."
              subtitle="Fetching your latest assessment results and statistics"
              skeletonCount={4}
              className="min-h-[400px]"
            />
          </motion.div>
        )}

        {/* Error State */}
        {hasError && !loading.initial && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ErrorMessage
              title="Failed to Load Dashboard"
              message={error.general || error.stats || error.results || error.tokenBalance}
              onRetry={actions.refreshData}
              retryText="Retry"
            />
          </motion.div>
        )}

        {/* Dashboard Content */}
        {!loading.initial && !hasError && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <StatsCards
              data={data}
              loading={loading}
              statusCounts={statusCounts}
            />
            {/* Results Table */}
            <ResultsTable
              data={data}
              loading={loading}
              onView={handleView}
              onDelete={handleDelete}
              onNewAssessment={() => navigate('/assessment')}
              onRefresh={() => actions.fetchResults()}
              deleteLoading={deleteLoading}
            />

            {/* Articles Section */}
            <ArticlesSection loading={loading} />

          </div>
        )}

      </main>

    </div>
  );
}
