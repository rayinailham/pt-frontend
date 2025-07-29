import { useEffect, useRef } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

export const useNotifications = (options = {}) => {
  const {
    isConnected,
    isAuthenticated,
    notifications,
    connectionStatus,
    clearNotification,
    clearAllNotifications,
    registerCallback
  } = useWebSocket();

  // Use refs to store callbacks to avoid re-registering on every render
  const callbacksRef = useRef({});
  const unregisterFunctionsRef = useRef([]);

  useEffect(() => {
    // Clean up previous callbacks
    unregisterFunctionsRef.current.forEach(unregister => unregister());
    unregisterFunctionsRef.current = [];

    // Register new callbacks if provided
    if (options.onAuthError && options.onAuthError !== callbacksRef.current.onAuthError) {
      callbacksRef.current.onAuthError = options.onAuthError;
      const unregister = registerCallback('onAuthError', options.onAuthError);
      unregisterFunctionsRef.current.push(unregister);
    }

    if (options.onAnalysisComplete && options.onAnalysisComplete !== callbacksRef.current.onAnalysisComplete) {
      callbacksRef.current.onAnalysisComplete = options.onAnalysisComplete;
      const unregister = registerCallback('onAnalysisComplete', options.onAnalysisComplete);
      unregisterFunctionsRef.current.push(unregister);
    }

    if (options.onAnalysisFailed && options.onAnalysisFailed !== callbacksRef.current.onAnalysisFailed) {
      callbacksRef.current.onAnalysisFailed = options.onAnalysisFailed;
      const unregister = registerCallback('onAnalysisFailed', options.onAnalysisFailed);
      unregisterFunctionsRef.current.push(unregister);
    }

    if (options.onConnect && options.onConnect !== callbacksRef.current.onConnect) {
      callbacksRef.current.onConnect = options.onConnect;
      const unregister = registerCallback('onConnect', options.onConnect);
      unregisterFunctionsRef.current.push(unregister);
    }

    if (options.onDisconnect && options.onDisconnect !== callbacksRef.current.onDisconnect) {
      callbacksRef.current.onDisconnect = options.onDisconnect;
      const unregister = registerCallback('onDisconnect', options.onDisconnect);
      unregisterFunctionsRef.current.push(unregister);
    }

    if (options.onAuthenticated && options.onAuthenticated !== callbacksRef.current.onAuthenticated) {
      callbacksRef.current.onAuthenticated = options.onAuthenticated;
      const unregister = registerCallback('onAuthenticated', options.onAuthenticated);
      unregisterFunctionsRef.current.push(unregister);
    }

    // Cleanup function
    return () => {
      unregisterFunctionsRef.current.forEach(unregister => {
        try {
          unregister();
        } catch (error) {
          console.error('Error during callback cleanup:', error);
        }
      });
      unregisterFunctionsRef.current = [];
      callbacksRef.current = {};
    };
  }, [
    options.onAuthError,
    options.onAnalysisComplete,
    options.onAnalysisFailed,
    options.onConnect,
    options.onDisconnect,
    options.onAuthenticated,
    registerCallback
  ]);

  return {
    isConnected,
    isAuthenticated,
    notifications,
    clearNotification,
    clearAllNotifications,
    connectionStatus
  };
};
