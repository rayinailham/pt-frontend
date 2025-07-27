import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import EnhancedLoadingScreen from '../UI/EnhancedLoadingScreen';
import useScrollToTop from '../../hooks/useScrollToTop';

const ResultOverview = () => {
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

  const getTopViaIsStrengths = (viaIsData) => {
    if (!viaIsData) return [];
    return Object.entries(viaIsData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([strength, score]) => ({ strength, score }));
  };

  const getTopRiasecInterests = (riasecData) => {
    if (!riasecData) {
      console.log('RIASEC data is null/undefined:', riasecData);
      return [];
    }
    console.log('RIASEC data:', riasecData);
    return Object.entries(riasecData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([interest, score]) => ({ strength: interest, score }));
  };

  const getTopOceanTraits = (oceanData) => {
    if (!oceanData) {
      console.log('OCEAN data is null/undefined:', oceanData);
      return [];
    }
    console.log('OCEAN data:', oceanData);
    return Object.entries(oceanData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([trait, score]) => ({ strength: trait, score }));
  };

  // Debug logging
  console.log('Result data:', result);
  console.log('Assessment data:', result?.assessment_data);
  console.log('RIASEC data:', result?.assessment_data?.riasec);
  console.log('OCEAN data:', result?.assessment_data?.ocean);

  const navigationCards = [
    {
      title: 'Character Strengths (VIA-IS)',
      description: 'Mengidentifikasi nilai-nilai inti dan kekuatan karakter yang mendorong perilaku dan pengambilan keputusan Anda',
      icon: '⭐',
      path: `/results/${resultId}/via-is`,
      preview: result?.assessment_data?.viaIs ? getTopViaIsStrengths(result.assessment_data.viaIs) : []
    },
    {
      title: 'Career Interests (RIASEC)',
      description: 'Memetakan minat Anda terhadap lingkungan karir dan aktivitas yang secara alami menarik bagi Anda',
      icon: '🎯',
      path: `/results/${resultId}/riasec`,
      preview: result?.assessment_data?.riasec ? getTopRiasecInterests(result.assessment_data.riasec) : []
    },
    {
      title: 'Personality Traits (OCEAN)',
      description: 'Menganalisis dimensi kepribadian fundamental dan bagaimana hal tersebut mempengaruhi gaya kerja Anda',
      icon: '🧭',
      path: `/results/${resultId}/ocean`,
      preview: result?.assessment_data?.ocean ? getTopOceanTraits(result.assessment_data.ocean) : []
    },
    {
      title: 'Career Persona',
      description: 'Mensintesis semua penilaian menjadi rekomendasi karir yang dapat ditindaklanjuti dan peluang pengembangan',
      icon: '🎪',
      path: `/results/${resultId}/persona`,
      preview: result?.persona_profile ? [
        { strength: 'Archetype', score: result.persona_profile.archetype },
        { strength: 'Risk Tolerance', score: result.persona_profile.riskTolerance },
        { strength: 'Total Recommendations', score: result.persona_profile.careerRecommendation?.length || 0 }
      ] : []
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {!result && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedLoadingScreen
              title="Loading Results..."
              subtitle="Fetching your assessment analysis and insights"
              skeletonCount={6}
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
                <h3 className="text-sm font-medium text-gray-900">Unable to Load Results</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>{error}</p>
                  {error.includes('not found after') && (
                    <div className="mt-3">
                      <p className="font-medium">What you can do:</p>
                      <ul className="mt-1 list-disc list-inside">
                        <li>Wait a few more minutes and refresh the page</li>
                        <li>Check your dashboard for the completed analysis</li>
                        <li>Contact support if the issue persists</li>
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mt-4 space-x-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content State */}
        {result && (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-12"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Hasil Assessment
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Analisis assessment kepribadian dan karir komprehensif Anda telah selesai.
                    Jelajahi setiap bagian di bawah ini untuk memahami profil unik Anda dan menemukan
                    peluang karir yang selaras dengan kekuatan Anda.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
                >
                  Dashboard
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>Completed: {formatDate(result.created_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        result.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span>Status: <span className="capitalize font-medium text-gray-900">{result.status}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Career Persona Summary */}
            {result.persona_profile?.archetype && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-12"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      Career Persona Anda
                    </h2>
                    <motion.div
                      className="inline-block bg-gray-100 px-4 py-2 rounded-full"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-lg font-semibold text-gray-800">
                        {result.persona_profile.archetype}
                      </span>
                    </motion.div>
                  </div>
                  <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto text-center">
                    {result.persona_profile.shortSummary}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Introduction Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-12"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Memahami Hasil Assessment Anda
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 mb-4">
                    Hasil assessment Anda diorganisir dalam empat bagian komprehensif, masing-masing memberikan
                    wawasan unik tentang aspek yang berbeda dari kepribadian dan potensi karir Anda:
                  </p>
                  <ul className="text-gray-700 space-y-2">
                    <li><strong>Character Strengths (VIA-IS):</strong> Mengidentifikasi nilai-nilai inti dan kekuatan karakter yang mendorong perilaku dan pengambilan keputusan Anda.</li>
                    <li><strong>Career Interests (RIASEC):</strong> Memetakan minat Anda terhadap lingkungan karir dan aktivitas yang secara alami menarik bagi Anda.</li>
                    <li><strong>Personality Traits (OCEAN):</strong> Menganalisis dimensi kepribadian fundamental dan bagaimana hal tersebut mempengaruhi gaya kerja Anda.</li>
                    <li><strong>Career Persona:</strong> Mensintesis semua penilaian menjadi rekomendasi karir yang dapat ditindaklanjuti dan peluang pengembangan.</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Assessment Sections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Jelajahi Hasil Assessment Anda
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {navigationCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate(card.path)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <motion.div
                            className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-gray-200 transition-colors"
                            whileHover={{ rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-lg">{card.icon}</span>
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                              {card.title}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">{card.description}</p>
                          </div>
                        </div>
                        <motion.svg
                          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </motion.svg>
                      </div>

                      {/* Preview Data */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {card.preview && card.preview.length > 0 ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Highlights Utama:</h4>
                            <div className="space-y-2">
                              {card.preview.slice(0, 3).map((item, idx) => (
                                <motion.div
                                  key={idx}
                                  className="flex justify-between items-center text-sm"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: idx * 0.1 }}
                                >
                                  <span className="text-gray-600 capitalize">{item.strength}</span>
                                  <span className="font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded text-xs">
                                    {typeof item.score === 'number' ? item.score.toFixed(1) : item.score}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500">
                              {card.title.includes('VIA-IS') ? 'Data kekuatan karakter tidak tersedia' :
                               card.title.includes('RIASEC') ? 'Data minat karir tidak tersedia' :
                               card.title.includes('OCEAN') ? 'Data kepribadian tidak tersedia' :
                               'Klik untuk melihat detail lengkap'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default ResultOverview;
