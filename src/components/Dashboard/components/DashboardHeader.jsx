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
      className="bg-white/80 backdrop-blur-sm border-b border-gray-100/50 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/25"
            >
              <BarChart3 className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500 flex items-center space-x-1">
                  <span>Welcome back,</span>
                  <span className="font-medium text-indigo-600">
                    {displayName}
                  </span>
                </p>
                {needsProfileCompletion && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onProfile}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
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
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 bg-gray-50/80 hover:bg-gray-100/80 rounded-xl transition-all duration-200 border border-gray-200/50 hover:border-gray-300/50 hover:shadow-sm"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Profile</span>
            </motion.button>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 bg-gray-50/80 hover:bg-red-50/80 hover:text-red-700 rounded-xl transition-all duration-200 border border-gray-200/50 hover:border-red-200/50 hover:shadow-sm"
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
