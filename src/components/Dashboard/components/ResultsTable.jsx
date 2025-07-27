import { Activity, Eye, Trash2, Plus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const ResultsTable = ({
  data,
  loading,
  onView,
  onDelete,
  onNewAssessment,
  onRefresh,
  deleteLoading = {}
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-200'
      },
      failed: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200'
      }
    };

    const config = statusConfig[status] || statusConfig.failed;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {status}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {/* Action Buttons */}
      <div className="flex justify-end items-center space-x-3 mb-6">
        {onRefresh && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRefresh}
            disabled={loading.results}
            className="flex items-center space-x-2 px-3 py-2.5 text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh results table"
          >
            <RefreshCw className={`h-4 w-4 ${loading.results ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline font-medium">Refresh</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewAssessment}
          className="flex items-center space-x-2 px-4 py-2.5 text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline font-medium">New Assessment</span>
        </motion.button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
        {loading.results ? (
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="h-4 bg-slate-200/60 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200/60 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200/60 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-200/60 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : data.results?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Archetype
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data.results.map((result, index) => (
                    <motion.tr
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-slate-50 transition-colors duration-200"
                    >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {result.assessment_name || 'Peta Talenta Assessment'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {formatDate(result.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {result.status === 'completed' ? (
                        result.persona_profile?.archetype ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {result.persona_profile.archetype}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            No archetype
                          </span>
                        )
                      ) : result.status === 'processing' ? (
                        <span className="text-blue-600 text-xs">
                          Processing...
                        </span>
                      ) : result.status === 'failed' ? (
                        <span className="text-red-600 text-xs">
                          Failed
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          Unknown
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(result.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onView(result.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(result.id)}
                          disabled={deleteLoading[result.id]}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50 transition-colors duration-200"
                        >
                          {deleteLoading[result.id] ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3 mr-1" />
                          )}
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No results yet</h3>
              <p className="text-sm text-slate-500 mb-6">Take an assessment to see your results here.</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNewAssessment}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 transition-all duration-200"
              >
                Start Assessment
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResultsTable;
