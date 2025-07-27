import { User, LogOut, BarChart3, AlertCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ConnectionStatus from '../ConnectionStatus';

const DashboardHeader = ({ user, onProfile, onLogout }) => {
  // Check if user has username set
  const username = user?.username || null;
  const displayName = username || 'user';
  const needsProfileCompletion = !username;

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-slate-200/60 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-2 md:p-3 bg-slate-900 rounded-md shadow-sm"
            >
              <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
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
                    className="hidden md:flex items-center space-x-1 px-2 py-1 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
                  >
                    <AlertCircle className="h-3 w-3" />
                    <span>Complete profile</span>
                  </motion.button>
                )}
              </div>
            </div>
            {/* Mobile title */}
            <div className="sm:hidden">
              <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
            </div>
          </div>

          {/* Desktop Right Section - Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <ConnectionStatus />

            {/* Profile Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onProfile}
              className="flex items-center space-x-2 px-4 py-2.5 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-all duration-200 border border-slate-200 hover:border-slate-300"
            >
              <User className="h-4 w-4" />
              <span className="hidden lg:inline font-medium">Profile</span>
            </motion.button>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2.5 text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-700 rounded-md transition-all duration-200 border border-slate-200 hover:border-red-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline font-medium">Logout</span>
            </motion.button>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ConnectionStatus />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-all duration-200 border border-slate-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-slate-200/60 py-4"
            >
              <div className="space-y-3">
                {/* Mobile Welcome Message */}
                <div className="px-2">
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
                      onClick={() => {
                        onProfile();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-1 px-2 py-1 mt-2 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>Complete profile</span>
                    </motion.button>
                  )}
                </div>

                {/* Mobile Profile Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onProfile();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-all duration-200 border border-slate-200"
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Profile</span>
                </motion.button>

                {/* Mobile Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-700 rounded-md transition-all duration-200 border border-slate-200 hover:border-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
