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
      return { completed: 0, failed: 0 };
    }

    return data.results.reduce((counts, result) => {
      if (result.status === 'completed') counts.completed++;
      else if (result.status === 'failed') counts.failed++;
      return counts;
    }, { completed: 0, failed: 0 });
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle top accent line */}
      <div className="h-px bg-slate-200/40"></div>

      {/* Header */}
      <DashboardHeader
        user={user}
        onProfile={handleProfile}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Loading State */}
        {loading.initial && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm">
              <EnhancedLoadingScreen
                title="Loading Dashboard..."
                subtitle="Fetching your latest assessment results and statistics"
                skeletonCount={4}
                className="min-h-[500px] p-8"
              />
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {hasError && !loading.initial && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8">
              <ErrorMessage
                title="Failed to Load Dashboard"
                message={error.general || error.stats || error.results || error.tokenBalance}
                onRetry={actions.refreshData}
                retryText="Retry"
              />
            </div>
          </motion.div>
        )}

        {/* Dashboard Content */}
        {!loading.initial && !hasError && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.1 }}
            className="space-y-12"
          >

            {/* Performance Overview Section */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Performance Overview</h2>
                <p className="text-slate-600">Key metrics and insights from your assessments</p>
              </div>
              <StatsCards
                data={data}
                loading={loading}
                statusCounts={statusCounts}
              />
            </motion.section>

            {/* Divider */}
            <div className="border-t border-slate-200/60"></div>

            {/* Assessment Results Section */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">Assessment Results</h2>
                    <p className="text-slate-600">View and manage your assessment history</p>
                  </div>
                </div>
              </div>
              <ResultsTable
                data={data}
                loading={loading}
                onView={handleView}
                onDelete={handleDelete}
                onNewAssessment={() => navigate('/assessment')}
                onRefresh={() => actions.fetchResults()}
                deleteLoading={deleteLoading}
              />
            </motion.section>

            {/* Divider */}
            <div className="border-t border-slate-200/60"></div>

            {/* Learning Resources Section */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Learning Resources</h2>
                <p className="text-slate-600">Curated articles and insights to enhance your knowledge</p>
              </div>
              <ArticlesSection loading={loading} />
            </motion.section>

            {/* Bottom spacing */}
            <div className="h-16"></div>
          </motion.div>
        )}
      </main>

      {/* Subtle footer accent */}
      <div className="h-px bg-slate-200/40"></div>
    </div>
  );
}