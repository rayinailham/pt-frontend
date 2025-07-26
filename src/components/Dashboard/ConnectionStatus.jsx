import React, { useState } from 'react';
import { WifiOff, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
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
      <div
        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all duration-200 hover:shadow-sm ${config.bgColor} ${config.textColor} ${config.borderColor}`}
        title={`${config.label}: ${config.description}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Pulse indicator for active connection */}
        <div className="relative">
          <Icon className="h-3 w-3" />
          {isConnected && (
            <div className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${config.pulseColor} animate-pulse`}></div>
          )}
        </div>

        <span className="hidden sm:inline">{config.label}</span>
        <span className="sm:hidden">
          {isConnected && isAuthenticated ? '●' : isConnected ? '◐' : '○'}
        </span>

        <Info className="h-3 w-3 opacity-60" />
      </div>

      {/* Detailed Status Popup */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-semibold text-gray-900">WebSocket Connection Status</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Connection:</span>
              <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Authentication:</span>
              <span className={`text-xs font-medium ${isAuthenticated ? 'text-green-600' : 'text-yellow-600'}`}>
                {isAuthenticated ? 'Authenticated' : 'Pending'}
              </span>
            </div>

            {connectionStatus?.socketId && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Socket ID:</span>
                <span className="text-xs font-mono text-gray-800">
                  {connectionStatus.socketId.slice(0, 12)}...
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {config.description}
              </p>
              {isConnected && isAuthenticated && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ You will receive real-time notifications for assessment updates
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
