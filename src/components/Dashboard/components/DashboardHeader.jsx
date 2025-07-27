import { User, LogOut, BarChart3, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ConnectionStatus from '../ConnectionStatus';

const DashboardHeader = ({ user, onProfile, onLogout }) => {
  // Check if user has username set
  const username = user?.username || null;
  const displayName = username || 'user';
  const needsProfileCompletion = !username;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-slate-200/60 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-3 bg-slate-900 rounded-md shadow-sm"
            >
              <BarChart3 className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Dashboard
              </h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-slate-600 flex items-center space-x-1">
                  <span>Welcome back,</span>
                  <span className="font-medium text-slate-900">
                    {displayName}
                  </span>
                </p>
                {needsProfileCompletion && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onProfile}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
                  >
                    <AlertCircle className="h-3 w-3" />
                    <span>Complete profile</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3">
            <ConnectionStatus />

            {/* Profile Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onProfile}
              className="flex items-center space-x-2 px-4 py-2.5 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-all duration-200 border border-slate-200 hover:border-slate-300"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Profile</span>
            </motion.button>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2.5 text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-700 rounded-md transition-all duration-200 border border-slate-200 hover:border-red-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
