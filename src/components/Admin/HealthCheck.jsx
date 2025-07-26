import { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import LoadingSpinner from '../UI/LoadingSpinner';

const HealthCheck = () => {
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchHealthData();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchHealthData, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchHealthData = async () => {
    try {
      const response = await apiService.getDetailedHealthStatus();
      if (response.status) {
        setHealthData(response);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch health data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'degraded':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading && !healthData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" text="Loading health status..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
              <p className="mt-2 text-gray-600">Monitor the status of all system components</p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
              </label>
              <button
                onClick={fetchHealthData}
                disabled={isLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {healthData && (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Overall System Status</h2>
                  <p className="text-sm text-gray-600">Last updated: {new Date(healthData.timestamp).toLocaleString()}</p>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthData.status)}`}>
                  {getStatusIcon(healthData.status)}
                  <span className="ml-2 capitalize">{healthData.status}</span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{healthData.responseTime}</div>
                  <div className="text-sm text-gray-600">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{healthData.version}</div>
                  <div className="text-sm text-gray-600">Version</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {healthData.gateway?.uptime ? formatUptime(healthData.gateway.uptime) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </div>

            {/* Services Status */}
            {healthData.services && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Services Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(healthData.services).map(([serviceName, serviceData]) => (
                    <div key={serviceName} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 capitalize">
                          {serviceName.replace('-', ' ')}
                        </h3>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(serviceData.status)}`}>
                          {getStatusIcon(serviceData.status)}
                          <span className="ml-1 capitalize">{serviceData.status}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Response: {serviceData.responseTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gateway Details */}
            {healthData.gateway && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Gateway Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthData.gateway.status)}`}>
                      {getStatusIcon(healthData.gateway.status)}
                      <span className="ml-2 capitalize">{healthData.gateway.status}</span>
                    </div>
                  </div>
                  
                  {healthData.gateway.memory && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Memory Usage</h3>
                      <div className="space-y-1">
                        {Object.entries(healthData.gateway.memory).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="text-gray-900">
                              {typeof value === 'number' ? `${Math.round(value / 1024 / 1024)} MB` : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthCheck;
