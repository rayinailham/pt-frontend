import { useState } from 'react';
import { debugAuth, testApiCall, checkAuthStatus } from '../../utils/authDebug';
import { motion } from 'framer-motion';

const AuthDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleDebugAuth = () => {
    const info = debugAuth();
    setDebugInfo(info);
  };

  const handleTestApi = async () => {
    setTestResult({ loading: true });
    const result = await testApiCall('/api/archive/jobs?page=1&limit=5');
    setTestResult(result);
  };

  const handleCheckAuth = async () => {
    setTestResult({ loading: true });
    const result = await checkAuthStatus();
    setTestResult(result);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
        >
          🔍 Debug Auth
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 max-h-96 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Auth Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleDebugAuth}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          Check Auth Status
        </button>

        <button
          onClick={handleTestApi}
          className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors"
        >
          Test Jobs API
        </button>

        <button
          onClick={handleCheckAuth}
          className="w-full bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600 transition-colors"
        >
          Full Auth Check
        </button>
      </div>

      {debugInfo && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <div className="space-y-1">
            <div>Token: {debugInfo.hasToken ? '✅ Found' : '❌ Missing'}</div>
            <div>User Data: {debugInfo.hasUserData ? '✅ Found' : '❌ Missing'}</div>
            <div>Auth Header: {debugInfo.hasAuthHeader ? '✅ Set' : '❌ Not Set'}</div>
            {debugInfo.userData && (
              <div>User: {debugInfo.userData.email || 'Unknown'}</div>
            )}
          </div>
        </div>
      )}

      {testResult && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
          <h4 className="font-semibold mb-2">Test Result:</h4>
          {testResult.loading ? (
            <div>Loading...</div>
          ) : testResult.success ? (
            <div className="text-green-600">✅ Success</div>
          ) : testResult.authenticated === false ? (
            <div className="text-red-600">
              ❌ Auth Failed: {testResult.reason}
            </div>
          ) : (
            <div className="text-red-600">
              ❌ API Failed: {testResult.error?.message || 'Unknown error'}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>💡 Tip: Buka browser console untuk detail logging</p>
      </div>
    </motion.div>
  );
};

export default AuthDebugPanel;
