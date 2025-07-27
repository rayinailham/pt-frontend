import { useEffect } from 'react';
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

  // Setup global notification listeners
  useNotifications({
    onAnalysisComplete: (data) => {
      // Only handle redirect if user is NOT currently on AssessmentStatus page
      // AssessmentStatus will handle its own redirect to avoid conflicts
      const isOnAssessmentStatus = location.pathname.includes('/assessment/status');
      
      if (!isOnAssessmentStatus && data.resultId) {
        // Add a small delay to ensure any ongoing navigation completes
        setTimeout(() => {
          navigate(`/results/${data.resultId}`, {
            state: { 
              fromNotification: true,
              jobId: data.jobId,
              message: data.message 
            }
          });
        }, 500);
      }
    },
    
    onAnalysisFailed: (data) => {
      // Handle analysis failure globally if needed
      // For now, we let individual components handle their own error states
      console.warn('Analysis failed:', data.message);
    }
  });

  // This component doesn't render anything
  return null;
};

export default GlobalNotificationHandler;
