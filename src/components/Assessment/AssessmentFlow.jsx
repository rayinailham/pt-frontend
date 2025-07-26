import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../../services/apiService';
import AssessmentForm from './AssessmentForm';
import { viaQuestions, riasecQuestions, bigFiveQuestions } from '../../data/assessmentQuestions';

const AssessmentFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDebugMode = searchParams.get('debug') === 'true';

  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentResults, setAssessmentResults] = useState({
    via: null,
    riasec: null,
    bigFive: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tokenBalance, setTokenBalance] = useState(null);
  const [isCheckingToken, setIsCheckingToken] = useState(false);

  const assessments = [
    { key: 'via', data: viaQuestions, title: 'VIA Character Strengths' },
    { key: 'riasec', data: riasecQuestions, title: 'RIASEC Holland Codes' },
    { key: 'bigFive', data: bigFiveQuestions, title: 'Big Five Personality' }
  ];

  // Debug function to auto-fill assessments
  const generateDebugScores = () => {
    const debugScores = {
      via: {
        creativity: 85,
        curiosity: 78,
        judgment: 70,
        loveOfLearning: 82,
        perspective: 60,
        bravery: 55,
        perseverance: 68,
        honesty: 73,
        zest: 66,
        love: 80,
        kindness: 75,
        socialIntelligence: 65,
        teamwork: 60,
        fairness: 70,
        leadership: 67,
        forgiveness: 58,
        humility: 62,
        prudence: 69,
        selfRegulation: 61,
        appreciationOfBeauty: 50,
        gratitude: 72,
        hope: 77,
        humor: 65,
        spirituality: 55
      },
      riasec: {
        realistic: 75,
        investigative: 85,
        artistic: 60,
        social: 50,
        enterprising: 70,
        conventional: 55
      },
      bigFive: {
        openness: 80,
        conscientiousness: 65,
        extraversion: 55,
        agreeableness: 45,
        neuroticism: 30
      }
    };
    return debugScores;
  };

  const currentAssessment = assessments[currentStep - 1];

  // Auto-fill assessments in debug mode
  useEffect(() => {
    if (isDebugMode && import.meta.env.DEV) {
      const debugScores = generateDebugScores();
      setAssessmentResults(debugScores);
      setCurrentStep(3); // Go to last assessment
    }
  }, [isDebugMode]);

  // Fetch token balance on component mount
  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {
        const response = await apiService.getTokenBalance();
        if (response.success) {
          setTokenBalance(response.data.token_balance);
        }
      } catch (err) {
        setTokenBalance(0); // Set to 0 if failed to fetch
      }
    };

    fetchTokenBalance();
  }, []);

  // Function to check token balance before submission
  const checkTokenBalance = async () => {
    setIsCheckingToken(true);
    try {
      const response = await apiService.getTokenBalance();
      if (response.success) {
        const balance = response.data.token_balance;
        setTokenBalance(balance);
        return balance;
      }
      return 0;
    } catch (err) {
      return 0;
    } finally {
      setIsCheckingToken(false);
    }
  };

  const handleAssessmentComplete = (scores) => {
    const newResults = {
      ...assessmentResults,
      [currentAssessment.key]: scores
    };

    setAssessmentResults(newResults);

    // Only move to next assessment if not the last one
    if (currentStep < assessments.length) {
      setCurrentStep(prev => prev + 1);
    }
    // Don't auto-advance on last assessment, let user explicitly click submit
  };

  const handleNext = () => {
    if (currentStep < assessments.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const transformScoresForAPI = () => {
    const { via, riasec, bigFive } = assessmentResults;

    // Transform VIA scores to match API format with all required fields
    const viaIs = {
      creativity: (via?.creativity || 0),
      curiosity: (via?.curiosity || 0),
      judgment: (via?.judgment || 0),
      loveOfLearning: (via?.loveOfLearning || 0),
      perspective: (via?.perspective || 0),
      bravery: (via?.bravery || 0),
      perseverance: (via?.perseverance || 0),
      honesty: (via?.honesty || 0),
      zest: (via?.zest || 0),
      love: (via?.love || 0),
      kindness: (via?.kindness || 0),
      socialIntelligence: (via?.socialIntelligence || 0),
      teamwork: (via?.teamwork || 0),
      fairness: (via?.fairness || 0),
      leadership: (via?.leadership || 0),
      forgiveness: (via?.forgiveness || 0),
      humility: (via?.humility || 0),
      prudence: (via?.prudence || 0),
      selfRegulation: (via?.selfRegulation || 0),
      appreciationOfBeauty: (via?.appreciationOfBeauty || 0),
      gratitude: (via?.gratitude || 0),
      hope: (via?.hope || 0),
      humor: (via?.humor || 0),
      spirituality: (via?.spirituality || 0)
    };

    // Transform RIASEC scores to match API format
    const riasecScores = {
      realistic: (riasec?.realistic || 0),
      investigative: (riasec?.investigative || 0),
      artistic: (riasec?.artistic || 0),
      social: (riasec?.social || 0),
      enterprising: (riasec?.enterprising || 0),
      conventional: (riasec?.conventional || 0)
    };

    // Transform Big Five scores to match API format (OCEAN)
    const ocean = {
      openness: (bigFive?.openness || 0),
      conscientiousness: (bigFive?.conscientiousness || 0),
      extraversion: (bigFive?.extraversion || 0),
      agreeableness: (bigFive?.agreeableness || 0),
      neuroticism: (bigFive?.neuroticism || 0)
    };

    const transformedData = {
      riasec: riasecScores,
      ocean: ocean,
      viaIs: viaIs
    };

    return transformedData;
  };

  const findIncompleteAssessment = () => {
    const { via, riasec, bigFive } = assessmentResults;

    // Check if each assessment has meaningful data (not just empty object)
    const isViaComplete = via && Object.keys(via).length > 0 && Object.values(via).some(score => score > 0);
    const isRiasecComplete = riasec && Object.keys(riasec).length > 0 && Object.values(riasec).some(score => score > 0);
    const isBigFiveComplete = bigFive && Object.keys(bigFive).length > 0 && Object.values(bigFive).some(score => score > 0);

    if (!isViaComplete) return { step: 1, name: 'VIA Character Strengths' };
    if (!isRiasecComplete) return { step: 2, name: 'RIASEC Holland Codes' };
    if (!isBigFiveComplete) return { step: 3, name: 'Big Five Personality' };
    return null;
  };

  const handleSubmitAll = async () => {
    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    // Validate that all assessments are completed
    const incompleteAssessment = findIncompleteAssessment();

    if (incompleteAssessment) {
      setError(`Please complete the ${incompleteAssessment.name} assessment before submitting. Redirecting you to that assessment...`);

      // Redirect to incomplete assessment after a short delay
      setTimeout(() => {
        setCurrentStep(incompleteAssessment.step);
        setError('');
      }, 2000);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Check token balance before submitting
      const currentBalance = await checkTokenBalance();

      if (currentBalance <= 0) {
        setError('Insufficient token balance. You need at least 1 token to submit an assessment. Please contact support to add more tokens to your account.');
        setIsSubmitting(false);
        return;
      }

      const transformedData = transformScoresForAPI();

      const response = await apiService.submitAssessment(transformedData);

      if (response.success) {
        const { jobId } = response.data;
        // Navigate immediately to status page without loading screen
        navigate(`/assessment/status/${jobId}`, {
          state: { fromSubmission: true }
        });
      } else {
        setError('Failed to submit assessment: ' + (response.message || 'Unknown error'));
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit assessment');
      setIsSubmitting(false);
    }
  };

  // Remove loading screen - navigate immediately to status page

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {error && (
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Assessment Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Debug Mode Indicator */}
      {isDebugMode && import.meta.env.DEV && (
        <div className="max-w-3xl mx-auto px-4 mb-4">
          <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 flex items-center space-x-2">
            <span className="text-orange-600">🔧</span>
            <span className="text-orange-800 font-medium text-sm">
              DEBUG MODE: Assessments are auto-filled for testing
            </span>
          </div>
        </div>
      )}

      <AssessmentForm
        key={currentStep} // Force re-render when step changes to reset state
        assessmentData={currentAssessment.data}
        onSubmit={currentStep === assessments.length ? handleSubmitAll : handleAssessmentComplete}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isLastAssessment={currentStep === assessments.length}
        currentStep={currentStep}
        totalSteps={assessments.length}
        tokenBalance={tokenBalance}
        isCheckingToken={isCheckingToken}
        isDebugMode={isDebugMode}
      />
    </div>
  );
};

export default AssessmentFlow;
