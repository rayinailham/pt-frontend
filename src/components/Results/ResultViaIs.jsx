import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import EnhancedLoadingScreen from '../UI/EnhancedLoadingScreen';
import ViaisChart from './ViaisChart';
import AssessmentExplanations from './AssessmentExplanations';
import useScrollToTop from '../../hooks/useScrollToTop';

const ResultViaIs = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fetchInProgressRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Scroll to top when component mounts or route changes
  useScrollToTop();

  useEffect(() => {
    // Prevent duplicate calls
    if (fetchInProgressRef.current) {
      return;
    }

    const fetchResult = async (retryCount = 0) => {
      const maxRetries = 5;
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s

      // Create new AbortController for this fetch sequence
      abortControllerRef.current = new AbortController();

      try {
        fetchInProgressRef.current = true;
        const response = await apiService.getResultById(resultId);

        // Check if component is still mounted and request wasn't aborted
        if (!abortControllerRef.current?.signal.aborted) {
          if (response.success) {
            setResult(response.data);
            fetchInProgressRef.current = false;
          }
        }
      } catch (err) {
        // Check if the error is due to abort
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        // If it's a 404 and we haven't exceeded max retries, try again
        if (err.response?.status === 404 && retryCount < maxRetries) {
          setTimeout(() => {
            // Check if component is still mounted before retrying
            if (!abortControllerRef.current?.signal.aborted) {
              fetchResult(retryCount + 1);
            }
          }, retryDelay);
        } else {
          // Final error after all retries or non-404 error
          const errorMessage = retryCount >= maxRetries
            ? `Result not found after ${maxRetries + 1} attempts. The analysis may still be processing.`
            : err.response?.data?.message || 'Failed to load results';
          setError(errorMessage);
          fetchInProgressRef.current = false;
        }
      }
    };

    if (resultId) {
      fetchResult();
    } else {
      navigate('/dashboard');
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      fetchInProgressRef.current = false;
    };
  }, [resultId, navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getViaIsInsights = (viaIsData) => {
    if (!viaIsData) return { top: [], bottom: [] };
    
    const entries = Object.entries(viaIsData).sort(([,a], [,b]) => b - a);
    return {
      top: entries.slice(0, 5),
      bottom: entries.slice(-3)
    };
  };

  const getStrengthDescription = (strength) => {
    const descriptions = {
      'creativity': 'Thinking of novel and productive ways to conceptualize and do things',
      'curiosity': 'Taking an interest in ongoing experience for its own sake',
      'judgment': 'Thinking things through and examining them from all sides',
      'love_of_learning': 'Mastering new skills, topics, and bodies of knowledge',
      'perspective': 'Being able to provide wise counsel; having ways of looking at the world',
      'bravery': 'Not shrinking from threat, challenge, difficulty, or pain',
      'perseverance': 'Persistence in spite of fatigue, frustration, or discouragement',
      'honesty': 'Speaking the truth but more broadly presenting oneself in a genuine way',
      'zest': 'Approaching life with excitement and energy',
      'love': 'Capacity for close relationships; valuing close relations with others',
      'kindness': 'Doing favors and good deeds for others; helping them; taking care of them',
      'social_intelligence': 'Understanding the motives and feelings of other people',
      'teamwork': 'Citizenship, social responsibility, loyalty; working well as member of a group',
      'fairness': 'Treating all people the same according to notions of fairness and justice',
      'leadership': 'Encouraging a group of which one is a member to get things done',
      'forgiveness': 'Forgiving those who have done wrong; second chances; not being vengeful',
      'humility': 'Letting one\'s accomplishments speak for themselves; not regarding oneself as special',
      'prudence': 'Being careful about one\'s choices; not taking undue risks',
      'self_regulation': 'Regulating what one feels and does; being disciplined',
      'appreciation_of_beauty': 'Noticing and appreciating beauty, excellence, and/or skilled performance',
      'gratitude': 'Being aware of and thankful for the good things that happen',
      'hope': 'Expecting the best in the future and working to achieve it',
      'humor': 'Liking to laugh and tease; bringing smiles to other people',
      'spirituality': 'Having coherent beliefs about the higher purpose and meaning of the universe'
    };
    return descriptions[strength] || 'A valuable character strength';
  };

  const navigationOptions = [
    { label: 'Overview', path: `/results/${resultId}`, icon: '📊' },
    { label: 'Big Five', path: `/results/${resultId}/big-five`, icon: '🧠' },
    { label: 'MBTI', path: `/results/${resultId}/mbti`, icon: '💡' },
    { label: 'Enneagram', path: `/results/${resultId}/enneagram`, icon: '⭐' },
    { label: 'VIA-IS', path: `/results/${resultId}/via-is`, icon: '💪', active: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Loading State */}
        {!result && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedLoadingScreen
              title="Loading VIA-IS Results..."
              subtitle="Fetching your character strengths analysis"
              skeletonCount={4}
              className="min-h-[600px]"
            />
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-red-200 rounded-lg p-6 shadow-sm"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Unable to Load Results</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4 space-x-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate(`/results/${resultId}`)}
                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Back to Overview
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content State */}
        {result && (
          <>
            {/* Navigation Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-semibold text-gray-900">Assessment Results</h1>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
                <div className="flex space-x-1 overflow-x-auto">
                  {navigationOptions.map((option) => (
                    <button
                      key={option.path}
                      onClick={() => !option.active && navigate(option.path)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        option.active
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-12"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <span className="text-2xl">💪</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    VIA Character Strengths
                  </h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Discover your signature character strengths based on the VIA (Values in Action) Survey. 
                    This assessment identifies your top character strengths that represent your authentic self 
                    and core virtues.
                  </p>
                </div>
                
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 border-t border-gray-100 pt-6">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>Completed: {formatDate(result.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                    </svg>
                    <span>24 Character Strengths Measured</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chart Section */}
            {result.assessment_data?.viaIs && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-12"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Character Strengths Profile</h3>
                  <ViaisChart data={result.assessment_data.viaIs} />
                </div>
              </motion.div>
            )}

            {/* Insights Section */}
            {result.assessment_data?.viaIs && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-12"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Understanding Your Results</h3>
                  <p className="text-gray-600 mb-8">
                    Your character strengths are ranked from highest to lowest. Your top 5 strengths are considered 
                    your "signature strengths" - these represent your most authentic and energizing qualities. 
                    Focus on leveraging these strengths while being mindful of developing areas that score lower.
                  </p>
                  
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Top Strengths */}
                    <div>
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Signature Strengths</h4>
                      </div>
                      <div className="space-y-4">
                        {getViaIsInsights(result.assessment_data.viaIs).top.map(([strength, score], idx) => (
                          <motion.div
                            key={strength}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-200 hover:bg-green-50/50 transition-all duration-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900 capitalize">
                                {strength.replace(/_/g, ' ')}
                              </h5>
                              <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                                {score.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {getStrengthDescription(strength)}
                            </p>
                            <div className="mt-3 bg-gray-200 rounded-full h-1.5">
                              <motion.div 
                                className="bg-green-500 h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(score / 5) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.6 + idx * 0.1 }}
                              ></motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Development Areas */}
                    <div>
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Development Opportunities</h4>
                      </div>
                      <div className="space-y-4">
                        {getViaIsInsights(result.assessment_data.viaIs).bottom.map(([strength, score], idx) => (
                          <motion.div
                            key={strength}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900 capitalize">
                                {strength.replace(/_/g, ' ')}
                              </h5>
                              <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                {score.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {getStrengthDescription(strength)}
                            </p>
                            <div className="mt-3 bg-gray-200 rounded-full h-1.5">
                              <motion.div 
                                className="bg-orange-500 h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(score / 5) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.6 + idx * 0.1 }}
                              ></motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Key Insights Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-12"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Insights & Recommendations</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Focus on Strengths</h4>
                    <p className="text-sm text-gray-600">
                      Leverage your top 5 signature strengths in daily activities and career decisions for optimal satisfaction and performance.
                    </p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Build on Success</h4>
                    <p className="text-sm text-gray-600">
                      Use your character strengths to overcome challenges and achieve your goals more effectively.
                    </p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Balanced Growth</h4>
                    <p className="text-sm text-gray-600">
                      Consider developing lower-scoring strengths when they align with your goals and values.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Assessment Explanations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <AssessmentExplanations showOnly="viaIs" />
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default ResultViaIs;