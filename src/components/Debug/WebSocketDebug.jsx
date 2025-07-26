import React from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

const WebSocketDebug = () => {
  const { 
    isConnected, 
    isAuthenticated, 
    connectionStatus, 
    notifications 
  } = useWebSocket();

  if (import.meta.env.VITE_APP_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">WebSocket Debug</h3>
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Connected:</span> 
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? 'Yes' : 'No'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Authenticated:</span> 
          <span className={isAuthenticated ? 'text-green-400' : 'text-yellow-400'}>
            {isAuthenticated ? 'Yes' : 'No'}
          </span>
        </div>
        {connectionStatus?.socketId && (
          <div>
            <span className="text-gray-400">Socket ID:</span> 
            <span className="text-blue-400 font-mono">
              {connectionStatus.socketId.slice(0, 8)}...
            </span>
          </div>
        )}
        <div>
          <span className="text-gray-400">Notifications:</span> 
          <span className="text-purple-400">{notifications.length}</span>
        </div>
      </div>
    </div>
  );
};

export default WebSocketDebug;
