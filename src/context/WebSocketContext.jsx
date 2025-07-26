import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';
import { API_CONFIG } from '../config/api';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isNotificationAuthenticated, setIsNotificationAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({});
  
  // Use ref to track if we're already connecting to prevent multiple connections
  const isConnectingRef = useRef(false);
  const callbacksRef = useRef({});

  // Register callback for specific events
  const registerCallback = (eventType, callback) => {
    if (!callbacksRef.current[eventType]) {
      callbacksRef.current[eventType] = [];
    }
    callbacksRef.current[eventType].push(callback);

    // Return unregister function
    return () => {
      callbacksRef.current[eventType] = callbacksRef.current[eventType].filter(cb => cb !== callback);
    };
  };

  // Trigger callbacks for specific events
  const triggerCallbacks = (eventType, data) => {
    if (callbacksRef.current[eventType]) {
      callbacksRef.current[eventType].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} callback:`, error);
        }
      });
    }
  };

  // Setup WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Disconnect if not authenticated
      if (isConnectingRef.current) {
        console.log('WebSocketProvider: Disconnecting due to auth change');
        notificationService.disconnect();
        setIsConnected(false);
        setIsNotificationAuthenticated(false);
        setConnectionStatus({});
        isConnectingRef.current = false;
      }
      return;
    }

    if (isConnectingRef.current) {
      console.log('WebSocketProvider: Already connecting, skipping');
      return;
    }

    isConnectingRef.current = true;
    console.log('WebSocketProvider: Setting up connection');

    // Setup notification service callbacks
    notificationService
      .onConnect(() => {
        console.log('WebSocketProvider: Connected');
        setIsConnected(true);
        setConnectionStatus(notificationService.getConnectionStatus());
        triggerCallbacks('onConnect');
      })
      .onDisconnect(() => {
        console.log('WebSocketProvider: Disconnected');
        setIsConnected(false);
        setIsNotificationAuthenticated(false);
        setConnectionStatus({});
        isConnectingRef.current = false;
        triggerCallbacks('onDisconnect');
      })
      .onAuthenticated((data) => {
        console.log('WebSocketProvider: Authenticated');
        setIsNotificationAuthenticated(true);
        setConnectionStatus(notificationService.getConnectionStatus());
        triggerCallbacks('onAuthenticated', data);
      })
      .onAuthError((error) => {
        console.log('WebSocketProvider: Auth error', error);
        setIsNotificationAuthenticated(false);
        triggerCallbacks('onAuthError', error);
      })
      .onAnalysisComplete((data) => {
        console.log('WebSocketProvider: Analysis complete', data);
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          title: 'Analysis Complete',
          message: data.message || 'Your analysis is ready!',
          data: data,
          timestamp: new Date()
        }]);
        triggerCallbacks('onAnalysisComplete', data);
      })
      .onAnalysisFailed((data) => {
        console.log('WebSocketProvider: Analysis failed', data);
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'error',
          title: 'Analysis Failed',
          message: data.message || 'Analysis failed. Please try again.',
          data: data,
          timestamp: new Date()
        }]);
        triggerCallbacks('onAnalysisFailed', data);
      })
      .connect(token, {
        url: API_CONFIG.NOTIFICATION_URL
      });

    // Cleanup on unmount
    return () => {
      console.log('WebSocketProvider: Cleanup');
      isConnectingRef.current = false;
      // Don't disconnect here to prevent multiple disconnects
      // Let the service handle its own lifecycle
    };
  }, [isAuthenticated, token]);

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    isConnected,
    isAuthenticated: isNotificationAuthenticated,
    notifications,
    connectionStatus,
    clearNotification,
    clearAllNotifications,
    registerCallback
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
