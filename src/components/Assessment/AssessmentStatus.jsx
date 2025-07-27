import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/apiService';
import { useNotifications } from '../../hooks/useNotifications';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

/**
 * AssessmentStatus Component - Uses Observer Pattern (No Polling)
 *
 * Stage Transitions:
 * Stage 1 (Processing) → Stage 2 (Analysis) → Stage 3 (Report)
 *
 * Triggers:
 * 1. Processing → Analysis: Automatic after 3 seconds
 * 2. Analysis → Report: Wait for WebSocket notification from onAnalysisComplete
 *
 * No polling is used - purely event-driven architecture
 */
const AssessmentStatus = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStage, setCurrentStage] = useState('processing'); // processing, analyzing, preparing
  const processingToAnalysisTimeoutRef = useRef(null);

  // Observer Pattern: Setup WebSocket notifications as observers
  const { isConnected, isAuthenticated } = useNotifications({
    onAnalysisComplete: (data) => {
      if (data.jobId === jobId) {
        // Transition to Report stage immediately when notification is received
        setCurrentStage('preparing');

        // Navigate after minimum 3 seconds to allow UI transition
        setTimeout(() => {
          navigate(`/results/${data.resultId}`);
        }, 3000);
      }
    },
    onAnalysisFailed: (data) => {
      if (data.jobId === jobId) {
        setError(data.message || 'Analysis failed');
      }
    }
  });

  // Observer: WebSocket connection status tracking
  useEffect(() => {
    // Connection status is tracked silently
  }, [isConnected, isAuthenticated, jobId]);

  // Initial status check (only called once)
  const checkInitialStatus = async () => {
    try {
      const response = await apiService.getAssessmentStatus(jobId);

      if (response.success) {
        const statusData = response.data;
        setStatus(statusData);

        // If already completed when we first check, navigate immediately
        if (statusData.status === 'completed') {
          navigate(`/results/${statusData.resultId || jobId}`);
        } else if (statusData.status === 'failed') {
          setError('Analysis failed. Please try again.');
        }
        // For 'queued' or 'processing', we rely on observer pattern
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check status');
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    if (!jobId) {
      navigate('/assessment');
      return;
    }

    // Check if we just came from assessment submission
    const isFromSubmission = location.state?.fromSubmission;
    if (isFromSubmission) {
      setCurrentStage('processing');

      // Stage 1 → Stage 2: Processing to Analysis after 3 seconds
      processingToAnalysisTimeoutRef.current = setTimeout(() => {
        setCurrentStage('analyzing');
        // Stage 2 (Analysis) will wait for WebSocket notification to proceed to Stage 3
      }, 3000);
    }

    // Only do initial status check (no polling)
    checkInitialStatus();

    // Cleanup
    return () => {
      if (processingToAnalysisTimeoutRef.current) {
        clearTimeout(processingToAnalysisTimeoutRef.current);
        processingToAnalysisTimeoutRef.current = null;
      }
    };
  }, [jobId, navigate, location.state]);

  const getStageInfo = (stage) => {
    switch (stage) {
      case 'processing':
        return {
          title: 'Processing Data',
          description: 'Mengorganisasi respons penilaian Anda',
          color: 'text-gray-900',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-700'
        };
      case 'analyzing':
        return {
          title: 'Analyzing with AI',
          description: 'Menganalisis pola dan menghasilkan wawasan',
          color: 'text-gray-900',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-700'
        };
      case 'preparing':
        return {
          title: 'Finalizing Report',
          description: 'Menyiapkan hasil yang dipersonalisasi untuk Anda',
          color: 'text-gray-900',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-700'
        };
      default:
        return {
          title: 'Processing',
          description: 'Penilaian Anda sedang diproses',
          color: 'text-gray-900',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-700'
        };
    }
  };

  const getStageIcon = (stage) => {
    const stageInfo = getStageInfo(stage);

    switch (stage) {
      case 'processing':
        return (
          <div className={`relative w-16 h-16 ${stageInfo.bgColor} border border-gray-200 flex items-center justify-center transition-all duration-300`}>
            {/* Single rotating ring */}
            <div className="absolute inset-2 border-2 border-gray-200 border-t-gray-700 animate-spin" style={{animationDuration: '1.5s'}}></div>
            {/* Processing icon */}
            <div className="relative z-10">
              <svg className={`w-8 h-8 ${stageInfo.iconColor} transition-colors duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        );
      case 'analyzing':
        return (
          <div className={`relative w-16 h-16 ${stageInfo.bgColor} border border-gray-200 flex items-center justify-center transition-all duration-300`}>
            {/* Subtle pulsing background */}
            <div className="absolute inset-1 bg-gray-100 animate-pulse" style={{animationDuration: '2s'}}></div>
            {/* Rotating ring */}
            <div className="absolute inset-2 border-2 border-gray-200 border-t-gray-700 animate-spin" style={{animationDuration: '2s'}}></div>
            <svg className={`w-8 h-8 ${stageInfo.iconColor} relative z-10 transition-colors duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        );
      case 'preparing':
        return (
          <div className={`relative w-16 h-16 ${stageInfo.bgColor} border border-gray-200 flex items-center justify-center transition-all duration-300`}>
            {/* Subtle pulsing background */}
            <div className="absolute inset-1 bg-gray-100 animate-pulse" style={{animationDuration: '1.5s'}}></div>
            {/* Slow rotating progress indicator */}
            <div className="absolute inset-2 border-2 border-gray-200 border-t-gray-700 animate-spin" style={{animationDuration: '2.5s'}}></div>
            {/* Check icon with subtle scale animation */}
            <div className="relative z-10 animate-pulse" style={{animationDuration: '2s'}}>
              <svg className={`w-8 h-8 ${stageInfo.iconColor} transition-colors duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-gray-100 border border-gray-200 flex items-center justify-center transition-all duration-300">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
    }
  };

  // Show content immediately when coming from submission
  if (isLoading && location.state?.fromSubmission) {
    setCurrentStage('processing');
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">
            Assessment Processing
          </h1>
          <p className="text-gray-700 max-w-lg mx-auto font-medium">
            Your assessment is being processed using AI technology
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          {error ? (
            <div className="p-8">
              <ErrorMessage
                title="Assessment Error"
                message={error}
                onRetry={() => navigate('/assessment')}
                retryText="Start New Assessment"
              />
            </div>
          ) : (location.state?.fromSubmission || status) ? (
            <div className="p-8">
              {/* Progress Steps */}
              <div className="mb-12">
                <div className="flex justify-center items-center space-x-6 mb-8">
                  {/* Step 1: Processing */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-all duration-500 ${
                      currentStage === 'processing' ? 'bg-gray-900 text-white' :
                      ['analyzing', 'preparing'].includes(currentStage) ? 'bg-gray-700 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {['analyzing', 'preparing'].includes(currentStage) ? (
                        <svg className="w-4 h-4 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        '1'
                      )}
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-500 ${
                      currentStage === 'processing' ? 'text-gray-900' :
                      ['analyzing', 'preparing'].includes(currentStage) ? 'text-gray-700' :
                      'text-gray-500'
                    }`}>
                      Processing
                    </span>
                  </div>

                  {/* Connector */}
                  <div className={`h-px w-8 transition-all duration-700 ${
                    ['analyzing', 'preparing'].includes(currentStage) ? 'bg-gray-700' : 'bg-gray-300'
                  }`}></div>

                  {/* Step 2: Analysis */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-all duration-500 ${
                      currentStage === 'analyzing' ? 'bg-gray-900 text-white' :
                      currentStage === 'preparing' ? 'bg-gray-700 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStage === 'preparing' ? (
                        <svg className="w-4 h-4 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        '2'
                      )}
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-500 ${
                      currentStage === 'analyzing' ? 'text-gray-900' :
                      currentStage === 'preparing' ? 'text-gray-700' :
                      'text-gray-500'
                    }`}>
                      Analysis
                    </span>
                  </div>

                  {/* Connector */}
                  <div className={`h-px w-8 transition-all duration-700 ${
                    currentStage === 'preparing' ? 'bg-gray-700' : 'bg-gray-300'
                  }`}></div>

                  {/* Step 3: Report */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-all duration-500 ${
                      currentStage === 'preparing' ? 'bg-gray-900 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      3
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-500 ${
                      currentStage === 'preparing' ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      Report
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Stage Display */}
              <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                  {getStageIcon(currentStage)}
                </div>

                <div className="space-y-3">
                  <h2 className={`text-2xl font-semibold transition-colors duration-500 text-gray-900`}>
                    {getStageInfo(currentStage).title}
                  </h2>
                  <p className="text-gray-700 max-w-md mx-auto transition-opacity duration-300 font-medium">
                    {getStageInfo(currentStage).description}
                  </p>
                </div>
              </div>

              {/* Time Estimation */}
              {status?.estimatedTimeRemaining && (
                <div className="bg-gray-50 p-4 border border-gray-200 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white flex items-center justify-center border border-gray-200 transition-all duration-300">
                      <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Perkiraan Waktu Tersisa</p>
                      <p className="text-sm text-gray-700">{status.estimatedTimeRemaining}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Back to Dashboard Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate('/dashboard', { state: { fromAssessment: true } })}
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                  Back to Dashboard
                </button>
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  You can check your assessment status in the dashboard
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <LoadingSpinner text="Loading Assessment Status..." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentStatus;