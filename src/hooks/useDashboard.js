import { useState, useCallback } from 'react';
import apiService from '../services/apiService';

/**
 * Comprehensive dashboard hook for managing dashboard data
 */
export const useDashboard = () => {
  const [data, setData] = useState({
    stats: null,
    results: [],
    tokenBalance: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
  });

  const [loading, setLoading] = useState({
    stats: false,
    results: false,
    tokenBalance: false,
    initial: true
  });

  const [error, setError] = useState({
    stats: '',
    results: '',
    tokenBalance: '',
    general: ''
  });

  // Clear specific error
  const clearError = useCallback((type) => {
    setError(prev => ({ ...prev, [type]: '' }));
  }, []);

  // Fetch user statistics using enhanced jobs-based stats
  const fetchStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    setError(prev => ({ ...prev, stats: '' }));

    try {
      const response = await apiService.getStatsFromJobs();
      setData(prev => ({ ...prev, stats: response.data }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch statistics';
      setError(prev => ({ ...prev, stats: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  // Fetch user results with pagination using new jobs endpoint
  const fetchResults = useCallback(async (page = 1, limit = 10) => {
    setLoading(prev => ({ ...prev, results: true }));
    setError(prev => ({ ...prev, results: '' }));

    try {
      const response = await apiService.getJobs({
        page,
        limit,
        sort: 'created_at',
        order: 'DESC'
      });

      // Debug logging
      console.group('🔍 Dashboard Data Debug');
      console.log('📦 Raw API Response:', response.data);
      console.log('📊 Jobs count:', response.data.jobs?.length || 0);
      if (response.data.jobs?.length > 0) {
        console.log('📋 First job sample:', response.data.jobs[0]);
        console.log('🎭 Archetypes found:', response.data.jobs.filter(job => job.archetype).map(job => ({ id: job.id, archetype: job.archetype, status: job.status })));
      }
      console.groupEnd();

      // Transform jobs data to match expected results structure
      const transformedResults = (response.data.jobs || []).map(job => ({
        id: job.id,
        job_id: job.job_id,
        user_id: job.user_id,
        assessment_name: job.assessment_name,
        created_at: job.created_at,
        updated_at: job.updated_at,
        completed_at: job.completed_at,
        status: job.status,
        result_id: job.result_id,
        error_message: job.error_message,
        priority: job.priority,
        retry_count: job.retry_count,
        max_retries: job.max_retries,
        processing_started_at: job.processing_started_at,
        archetype: job.archetype
      }));

      setData(prev => ({
        ...prev,
        results: transformedResults,
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch results';
      setError(prev => ({ ...prev, results: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, results: false }));
    }
  }, []);

  // Fetch token balance
  const fetchTokenBalance = useCallback(async () => {
    setLoading(prev => ({ ...prev, tokenBalance: true }));
    setError(prev => ({ ...prev, tokenBalance: '' }));

    try {
      const response = await apiService.getTokenBalance();
      setData(prev => ({ ...prev, tokenBalance: response.data }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch token balance';
      setError(prev => ({ ...prev, tokenBalance: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, tokenBalance: false }));
    }
  }, []);

  // Fetch all dashboard data
  const fetchAllData = useCallback(async (page = 1, limit = 10) => {
    setLoading(prev => ({ ...prev, initial: true }));
    setError({
      stats: '',
      results: '',
      tokenBalance: '',
      general: ''
    });

    try {
      // Fetch all data in parallel
      await Promise.all([
        fetchStats(),
        fetchResults(page, limit),
        fetchTokenBalance()
      ]);
    } catch (err) {
      setError(prev => ({
        ...prev,
        general: 'Failed to load dashboard data. Please try again.'
      }));
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  }, [fetchStats, fetchResults, fetchTokenBalance]);

  // Delete a result
  const deleteResult = useCallback(async (resultId) => {
    try {
      await apiService.deleteResult(resultId);
      // Remove from local state
      setData(prev => ({
        ...prev,
        results: prev.results.filter(result => result.id !== resultId)
      }));
      return true;
    } catch (err) {
      throw err;
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(() => {
    fetchAllData(data.pagination.page, data.pagination.limit);
  }, [fetchAllData, data.pagination.page, data.pagination.limit]);

  // Change page
  const changePage = useCallback((newPage) => {
    fetchResults(newPage, data.pagination.limit);
  }, [fetchResults, data.pagination.limit]);

  return {
    data,
    loading,
    error,
    actions: {
      fetchStats,
      fetchResults,
      fetchTokenBalance,
      fetchAllData,
      deleteResult,
      refreshData,
      changePage,
      clearError
    },
    // Computed values
    isLoading: loading.initial || loading.stats || loading.results || loading.tokenBalance,
    hasError: !!(error.stats || error.results || error.tokenBalance || error.general),
    isEmpty: !data.stats && !data.results.length && !data.tokenBalance
  };
};

export default useDashboard;
