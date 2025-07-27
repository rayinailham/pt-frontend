import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AssessmentForm from './AssessmentForm';
import AutoFillNotification from './AutoFillNotification';
import { viaQuestions, riasecQuestions, bigFiveQuestions } from '../../data/assessmentQuestions';
import apiService from '../../services/apiService';
import ErrorMessage from '../UI/ErrorMessage';
import { transformAssessmentScores, validateAssessmentData } from '../../utils/assessmentTransformers';

/**
 * AssessmentFlow Component
 * 
 * Orchestrates the complete assessment process:
 * 1. VIA Character Strengths (Step 1)
 * 2. RIASEC Holland Codes (Step 2) 
 * 3. Big Five Personality (Step 3)
 * 4. Final submission to API
 */
const AssessmentFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentScores, setAssessmentScores] = useState({
    via: null,
    riasec: null,
    bigFive: null
  });
  const [hasSubmitted, setHasSubmitted] = useState(false); // Flag to prevent double submission
  const [isProcessingSubmit, setIsProcessingSubmit] = useState(false); // Flag to prevent rapid clicks
  const [error, setError] = useState('');
  const [isDebugMode] = useState(import.meta.env.DEV && false); // Set to true for debug mode
  const [allAssessmentsFilled, setAllAssessmentsFilled] = useState(false); // Flag to indicate all assessments are filled
  const [prefilledAnswers, setPrefilledAnswers] = useState({}); // Store all prefilled answers
  const [showAutoFillNotification, setShowAutoFillNotification] = useState(false); // Show auto fill success notification
  const [isAutoFillMode, setIsAutoFillMode] = useState(false); // Flag to prevent auto-submit when using auto-fill

  // Assessment configurations
  const assessments = [
    {
      step: 1,
      key: 'via',
      data: viaQuestions,
      title: 'VIA Character Strengths'
    },
    {
      step: 2,
      key: 'riasec', 
      data: riasecQuestions,
      title: 'RIASEC Holland Codes'
    },
    {
      step: 3,
      key: 'bigFive',
      data: bigFiveQuestions,
      title: 'Big Five Personality'
    }
  ];

  const currentAssessment = assessments.find(a => a.step === currentStep);
  const totalSteps = assessments.length;

  /**
   * Transform assessment scores to API format using utility functions
   */
  const transformScoresToApiFormat = () => {
    try {
      const apiData = transformAssessmentScores(assessmentScores);

      // Validate the transformed data
      const validation = validateAssessmentData(apiData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      return apiData;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Handle assessment completion for current step
   */
  const handleAssessmentSubmit = (scores) => {
    // Prevent rapid successive submissions
    if (isProcessingSubmit) {
      return;
    }

    // Set processing flag to prevent rapid clicks
    setIsProcessingSubmit(true);

    // Store scores for current assessment
    setAssessmentScores(prev => ({
      ...prev,
      [currentAssessment.key]: scores
    }));

    // Reset processing flag after a short delay to allow for state updates
    setTimeout(() => {
      setIsProcessingSubmit(false);
    }, 1000);
  };

  /**
   * Move to next assessment
   */
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  /**
   * Move to previous assessment
   */
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  /**
   * Navigate to specific phase
   */
  const handleNavigateToPhase = (targetStep) => {
    if (targetStep >= 1 && targetStep <= totalSteps) {
      setCurrentStep(targetStep);
    }
  };

  /**
   * Fill all assessments with random answers (200 questions total)
   * Does not auto-submit, allows manual editing
   * @param {boolean} navigateToLast - Whether to navigate to last question in last phase
   */
  const fillAllAssessments = (navigateToLast = false) => {
    // Function to generate random answers for an assessment
    const generateRandomAnswersForAssessment = (assessmentData) => {
      const answers = {};

      Object.entries(assessmentData.categories).forEach(([categoryKey, category]) => {
        // Regular questions
        category.questions.forEach((_, index) => {
          const questionKey = `${categoryKey}_${index}`;
          answers[questionKey] = Math.floor(Math.random() * 7) + 1; // Random 1-7 for varied scores
        });

        // Reverse questions (for Big Five)
        if (category.reverseQuestions) {
          category.reverseQuestions.forEach((_, index) => {
            const questionKey = `${categoryKey}_reverse_${index}`;
            answers[questionKey] = Math.floor(Math.random() * 7) + 1; // Random 1-7
          });
        }
      });

      return answers;
    };

    // Function to calculate scores from answers
    const calculateScoresFromAnswers = (answers, assessmentData) => {
      const scores = {};

      Object.entries(assessmentData.categories).forEach(([categoryKey, category]) => {
        let totalScore = 0;
        let questionCount = 0;

        // Regular questions
        category.questions.forEach((_, index) => {
          const questionKey = `${categoryKey}_${index}`;
          if (answers[questionKey]) {
            totalScore += answers[questionKey];
            questionCount++;
          }
        });

        // Reverse questions (for Big Five)
        if (category.reverseQuestions) {
          category.reverseQuestions.forEach((_, index) => {
            const questionKey = `${categoryKey}_reverse_${index}`;
            if (answers[questionKey]) {
              // Reverse the score (8 - original score for 1-7 scale)
              totalScore += (8 - answers[questionKey]);
              questionCount++;
            }
          });
        }

        // Calculate average score (0-100 scale)
        if (questionCount > 0) {
          scores[categoryKey] = Math.round(((totalScore / questionCount) - 1) * (100 / 6)); // Convert 1-7 to 0-100
        }
      });

      return scores;
    };

    // Generate scores and answers for all assessments
    const allScores = {};
    const allAnswers = {};

    assessments.forEach(assessment => {
      const randomAnswers = generateRandomAnswersForAssessment(assessment.data);
      const scores = calculateScoresFromAnswers(randomAnswers, assessment.data);
      allScores[assessment.key] = scores;

      // Store all answers for each assessment
      Object.assign(allAnswers, randomAnswers);
    });

    // Update assessment scores state
    setAssessmentScores(allScores);

    // Store prefilled answers for use in forms
    setPrefilledAnswers(allAnswers);

    // Set flag to indicate all assessments are filled
    setAllAssessmentsFilled(true);

    // Set auto-fill mode to prevent auto-submit
    setIsAutoFillMode(true);

    // Show success notification
    setShowAutoFillNotification(true);

    // Navigate to last phase and last question if requested
    if (navigateToLast) {
      setCurrentStep(totalSteps); // Go to last phase (Big Five)
    }

    // Stay on current step to allow manual editing
    // User can navigate between assessments to review and edit answers
  };

  /**
   * Submit all assessments to API
   */
  const submitToApi = async () => {
    try {
      const apiData = transformScoresToApiFormat();
      const response = await apiService.submitAssessment(apiData);

      if (response.success && response.data?.jobId) {
        // Navigate directly to status page with job ID without showing loading
        navigate(`/assessment/status/${response.data.jobId}`, {
          state: { fromSubmission: true }
        });
      } else {
        throw new Error(response.message || 'Failed to submit assessment');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit assessment');
      setHasSubmitted(false); // Reset flag on error to allow retry
      setIsProcessingSubmit(false); // Reset processing flag on error
    }
  };

  /**
   * Manual submit function for auto-fill mode
   */
  const handleManualSubmit = () => {
    setIsAutoFillMode(false); // Exit auto-fill mode
    setHasSubmitted(true); // Set flag to prevent double submission
    submitToApi();
  };

  // Auto-submit when all assessments are complete (but not in auto-fill mode)
  useEffect(() => {
    const { via, riasec, bigFive } = assessmentScores;

    if (via && riasec && bigFive && !hasSubmitted && !isProcessingSubmit && !isAutoFillMode) {
      setHasSubmitted(true); // Set flag to prevent double submission
      submitToApi();
    }
  }, [assessmentScores, hasSubmitted, isProcessingSubmit, isAutoFillMode]);

  // Show error screen if submission failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            title="Submission Failed"
            message={error}
            onRetry={() => {
              setError('');
              setHasSubmitted(false); // Reset flag to allow retry
              setIsProcessingSubmit(false); // Reset processing flag to allow retry
              submitToApi();
            }}
            retryText="Try Again"
          />
        </div>
      </div>
    );
  }

  // Render current assessment
  return (
    <>
      <AssessmentForm
        assessmentData={currentAssessment.data}
        onSubmit={handleAssessmentSubmit}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isLastAssessment={currentStep === totalSteps}
        currentStep={currentStep}
        totalSteps={totalSteps}
        isDebugMode={isDebugMode}
        isProcessingSubmit={isProcessingSubmit}
        onFillAllAssessments={fillAllAssessments}
        allAssessmentsFilled={allAssessmentsFilled}
        prefilledAnswers={prefilledAnswers}
        isAutoFillMode={isAutoFillMode}
        onManualSubmit={handleManualSubmit}
        onNavigateToPhase={handleNavigateToPhase}
      />

      {/* Auto Fill Success Notification */}
      <AutoFillNotification
        isVisible={showAutoFillNotification}
        onClose={() => setShowAutoFillNotification(false)}
        totalQuestions={200}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
    </>
  );
};

export default AssessmentFlow;
