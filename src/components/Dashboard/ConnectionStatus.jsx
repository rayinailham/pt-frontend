import React, { useState } from 'react';
import { WifiOff, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../context/WebSocketContext';

const ConnectionStatus = () => {
  const { isConnected, isAuthenticated, connectionStatus } = useWebSocket();
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = () => {
    if (isConnected && isAuthenticated) {
      return {
        icon: CheckCircle,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        label: 'Connected',
        description: 'Real-time notifications active',
        pulseColor: 'bg-green-500'
      };
    } else if (isConnected && !isAuthenticated) {
      return {
        icon: AlertCircle,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
        label: 'Authenticating',
        description: 'Connecting to notification service',
        pulseColor: 'bg-yellow-500'
      };
    } else {
      return {
        icon: WifiOff,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        label: 'Disconnected',
        description: 'No real-time connection',
        pulseColor: 'bg-red-500'
      };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="relative flex items-center space-x-2">
      {/* Main Status Indicator */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium border cursor-pointer transition-all duration-200 hover:shadow-sm backdrop-blur-sm ${config.bgColor} ${config.textColor} ${config.borderColor}`}
        title={`${config.label}: ${config.description}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Pulse indicator for active connection */}
        <div className="relative">
          <Icon className="h-3.5 w-3.5" />
          {isConnected && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${config.pulseColor}`}
            />
          )}
        </div>

        <span className="hidden sm:inline font-medium">{config.label}</span>
        <span className="sm:hidden text-sm">
          {isConnected && isAuthenticated ? '●' : isConnected ? '◐' : '○'}
        </span>

        <Info className="h-3 w-3 opacity-60" />
      </motion.div>

      {/* Detailed Status Popup */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-5 z-50"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-semibold text-gray-900">WebSocket Connection Status</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl">
                <span className="text-xs font-medium text-gray-600">Connection:</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${isConnected ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                  {isConnected ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl">
                <span className="text-xs font-medium text-gray-600">Authentication:</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${isAuthenticated ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100'}`}>
                  {isAuthenticated ? 'Authenticated' : 'Pending'}
                </span>
              </div>

              {connectionStatus?.socketId && (
                <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl">
                  <span className="text-xs font-medium text-gray-600">Socket ID:</span>
                  <span className="text-xs font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                    {connectionStatus.socketId.slice(0, 12)}...
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-2">
                  {config.description}
                </p>
                {isConnected && isAuthenticated && (
                  <div className="flex items-center text-xs text-green-700 bg-green-50 p-2 rounded-lg">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    You will receive real-time notifications for assessment updates
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectionStatus;
