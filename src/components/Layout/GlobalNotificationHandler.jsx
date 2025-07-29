import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

/**
 * GlobalNotificationHandler - Handles global notification events
 * 
 * This component listens for WebSocket notifications and performs
 * global actions like redirecting to results page when analysis is complete.
 * 
 * It's designed to work alongside AssessmentStatus component without conflicts.
 */
const GlobalNotificationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationTimeoutRef = useRef(null);
  const isHandlingGlobalNotificationRef = useRef(false);

  // Setup global notification listeners
  useNotifications({
    onAnalysisComplete: (data) => {
      // Only handle redirect if user is NOT currently on AssessmentStatus page
      // AssessmentStatus will handle its own redirect to avoid conflicts
      const isOnAssessmentStatus = location.pathname.includes('/assessment/status');

      // Prevent race conditions - only handle if not already processing
      if (isHandlingGlobalNotificationRef.current) {
        console.log('GlobalNotificationHandler: Already handling analysis complete, ignoring duplicate');
        return;
      }

      if (!isOnAssessmentStatus && data?.resultId) {
        isHandlingGlobalNotificationRef.current = true;

        // Clear any existing timeout
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }

        // Add a small delay to ensure any ongoing navigation completes
        navigationTimeoutRef.current = setTimeout(() => {
          if (data?.resultId) {
            navigate(`/results/${data.resultId}`, {
              state: {
                fromNotification: true,
                jobId: data.jobId,
                message: data.message
              }
            });
          }
          // Reset flag after navigation
          isHandlingGlobalNotificationRef.current = false;
        }, 500);
      }
    },
    
    onAnalysisFailed: (data) => {
      // Handle analysis failure globally if needed
      // For now, we let individual components handle their own error states

      // Clear any pending navigation timeout on failure
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
      // Reset flag
      isHandlingGlobalNotificationRef.current = false;
    }
  });

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
      isHandlingGlobalNotificationRef.current = false;
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default GlobalNotificationHandler;
