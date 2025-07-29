import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import EnhancedLoadingScreen from '../UI/EnhancedLoadingScreen';
import useScrollToTop from '../../hooks/useScrollToTop';
import AssessmentRelation from './AssessmentRelation';

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

  // Assessment Results Graphic Component
  const AssessmentResultsGraphic = ({ assessmentData }) => {
    const getScoreColor = (score) => {
      if (score >= 80) return 'bg-slate-700';
      if (score >= 60) return 'bg-slate-600';
      if (score >= 40) return 'bg-slate-500';
      return 'bg-slate-400';
    };

    const getTopScores = (data, count = 3) => {
      if (!data) return [];
      return Object.entries(data)
        .sort(([,a], [,b]) => b - a)
        .slice(0, count)
        .map(([key, value]) => ({ name: key, score: value }));
    };

    const viaTopScores = getTopScores(assessmentData?.viaIs);
    const riasecTopScores = getTopScores(assessmentData?.riasec);
    const oceanTopScores = getTopScores(assessmentData?.ocean);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-16"
      >
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-b from-gray-50/30 to-white p-4 sm:p-6 lg:p-10 border-b border-gray-100/60">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-medium text-gray-900 mb-3 tracking-tight">
                Visualisasi Hasil Assessment
              </h2>
              <p className="text-gray-600 text-sm sm:text-base font-normal leading-relaxed">
                Gambaran visual dari kekuatan utama Anda di setiap dimensi assessment
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* VIA Character Strengths */}
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-start mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                    <span className="text-gray-700 text-lg sm:text-xl">⭐</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-base sm:text-lg mb-1">Character Strengths</h3>
                    <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">VIA-IS Assessment</p>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {viaTopScores.map((item, index) => (
                    <div key={index} className="flex items-center justify-between group">
                      <span className="text-xs sm:text-sm text-gray-700 capitalize font-medium flex-1 pr-2">
                        {item.name}
                      </span>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-16 sm:w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${getScoreColor(item.score)} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.score / 100) * 100}%` }}
                            transition={{ duration: 1.2, delay: 0.5 + index * 0.15, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-6 sm:w-8 text-right tabular-nums">
                          {item.score.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIASEC Interests */}
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-start mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                    <span className="text-gray-700 text-lg sm:text-xl">🎯</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-base sm:text-lg mb-1">Career Interests</h3>
                    <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">RIASEC Assessment</p>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {riasecTopScores.map((item, index) => (
                    <div key={index} className="flex items-center justify-between group">
                      <span className="text-xs sm:text-sm text-gray-700 capitalize font-medium flex-1 pr-2">
                        {item.name}
                      </span>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-16 sm:w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${getScoreColor(item.score)} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.score / 100) * 100}%` }}
                            transition={{ duration: 1.2, delay: 0.7 + index * 0.15, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-6 sm:w-8 text-right tabular-nums">
                          {item.score.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OCEAN Personality */}
              <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-start mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                    <span className="text-gray-700 text-lg sm:text-xl">🧭</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-base sm:text-lg mb-1">Personality Traits</h3>
                    <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">OCEAN Assessment</p>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {oceanTopScores.map((item, index) => (
                    <div key={index} className="flex items-center justify-between group">
                      <span className="text-xs sm:text-sm text-gray-700 capitalize font-medium flex-1 pr-2">
                        {item.name}
                      </span>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-16 sm:w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${getScoreColor(item.score)} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.score / 100) * 100}%` }}
                            transition={{ duration: 1.2, delay: 0.9 + index * 0.15, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-6 sm:w-8 text-right tabular-nums">
                          {item.score.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overall Score Summary */}
            <div className="mt-6 sm:mt-8 lg:mt-10 pt-6 sm:pt-8 border-t border-gray-200/60">
              <h4 className="text-base sm:text-lg font-medium text-gray-900 text-center mb-6 sm:mb-8">Skor Tertinggi Anda</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
                <motion.div
                  className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)]"
                  whileHover={{ scale: 1.01, y: -1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="text-2xl sm:text-3xl font-medium text-gray-900 mb-2 sm:mb-3 tabular-nums">
                    {viaTopScores.length > 0 ? viaTopScores[0].score.toFixed(0) : 'N/A'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1 sm:mb-2">Top Character Strength</div>
                  <div className="text-xs text-gray-500 font-medium capitalize">
                    {viaTopScores.length > 0 ? viaTopScores[0].name : 'No data'}
                  </div>
                </motion.div>
                <motion.div
                  className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)]"
                  whileHover={{ scale: 1.01, y: -1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="text-2xl sm:text-3xl font-medium text-gray-900 mb-2 sm:mb-3 tabular-nums">
                    {riasecTopScores.length > 0 ? riasecTopScores[0].score.toFixed(0) : 'N/A'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1 sm:mb-2">Top Career Interest</div>
                  <div className="text-xs text-gray-500 font-medium capitalize">
                    {riasecTopScores.length > 0 ? riasecTopScores[0].name : 'No data'}
                  </div>
                </motion.div>
                <motion.div
                  className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)]"
                  whileHover={{ scale: 1.01, y: -1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="text-2xl sm:text-3xl font-medium text-gray-900 mb-2 sm:mb-3 tabular-nums">
                    {oceanTopScores.length > 0 ? oceanTopScores[0].score.toFixed(0) : 'N/A'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1 sm:mb-2">Top Personality Trait</div>
                  <div className="text-xs text-gray-500 font-medium capitalize">
                    {oceanTopScores.length > 0 ? oceanTopScores[0].name : 'No data'}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
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
      return [];
    }
    return Object.entries(riasecData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([interest, score]) => ({ strength: interest, score }));
  };

  const getTopOceanTraits = (oceanData) => {
    if (!oceanData) {
      return [];
    }
    return Object.entries(oceanData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([trait, score]) => ({ strength: trait, score }));
  };

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
        { strength: 'Archetype', score: result.persona_profile.archetype || result.persona_profile.career_persona?.archetype || 'N/A' },
        { strength: 'Risk Tolerance', score: result.persona_profile.riskTolerance || result.persona_profile.risk_tolerance || 'N/A' },
        { strength: 'Total Recommendations', score: result.persona_profile.careerRecommendation?.length || result.persona_profile.career_recommendations?.length || 0 }
      ] : []
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
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
              className="mb-8 sm:mb-10 lg:mb-12"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Hasil Assessment
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl leading-relaxed">
                    Analisis assessment kepribadian dan karir komprehensif Anda telah selesai.
                    Jelajahi setiap bagian di bawah ini untuk memahami profil unik Anda dan menemukan
                    peluang karir yang selaras dengan kekuatan Anda.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gray-900 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
                >
                  Dashboard
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200/40 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-0">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>Completed: {formatDate(result.created_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        result.status === 'completed' ? 'bg-gray-700' : 'bg-gray-500'
                      }`}></div>
                      <span>Status: <span className="capitalize font-medium text-gray-900">{result.status}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Career Persona Summary & Introduction Section - Combined in Single Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 sm:mb-10 lg:mb-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Career Persona Summary */}
                {(() => {
                  const archetype = result.persona_profile?.archetype || result.persona_profile?.career_persona?.archetype;
                  const shortSummary = result.persona_profile?.shortSummary || result.persona_profile?.short_summary || result.persona_profile?.summary;

                  return archetype && (
                    <div className="bg-white rounded-xl border border-gray-200/40 p-4 sm:p-6 shadow-xs">
                      <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                        Career Persona Anda
                      </h2>
                      <motion.div
                        className="inline-block bg-gray-50 px-3 sm:px-4 py-2 rounded-lg border border-gray-200/40 shadow-xs mb-3 sm:mb-4"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-sm sm:text-base font-medium text-gray-900">
                          {archetype}
                        </span>
                      </motion.div>
                      {shortSummary && (
                        <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
                          {shortSummary}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Introduction Section */}
                <div className="bg-white rounded-xl border border-gray-200/40 p-4 sm:p-6 shadow-xs">
                  <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                    Memahami Hasil Assessment Anda
                  </h2>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                    Hasil assessment Anda diorganisir dalam empat bagian komprehensif yang saling terintegrasi.
                    Visualisasi di bawah menunjukkan kekuatan utama Anda di setiap dimensi.
                  </p>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                    <div><strong className="text-gray-900">Character Strengths:</strong> Nilai-nilai inti dan kekuatan karakter Anda.</div>
                    <div><strong className="text-gray-900">Career Interests:</strong> Minat terhadap lingkungan karir dan aktivitas.</div>
                    <div><strong className="text-gray-900">Personality Traits:</strong> Dimensi kepribadian dan gaya kerja Anda.</div>
                    <div><strong className="text-gray-900">Career Persona:</strong> Rekomendasi karir dan peluang pengembangan.</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Assessment Explanations */}
            <div className="mt-12 sm:mt-14 lg:mt-16">
              <AssessmentRelation delay={0.3}/>
            </div>

            {/* Assessment Results Graphic */}
            <AssessmentResultsGraphic assessmentData={result.assessment_data} />

            

            {/* Assessment Sections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Jelajahi Hasil Assessment Anda
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {navigationCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="bg-white rounded-xl border border-gray-200/60 hover:border-gray-300/80 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(card.path)}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex items-start flex-1">
                          <motion.div
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-gray-200 transition-colors flex-shrink-0"
                            whileHover={{ rotate: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-base sm:text-lg">{card.icon}</span>
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 group-hover:text-gray-700 transition-colors leading-tight">
                              {card.title}
                            </h3>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed">{card.description}</p>
                          </div>
                        </div>
                        <motion.svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
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
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                        {card.preview && card.preview.length > 0 ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Highlights Utama:</h4>
                            <div className="space-y-1.5 sm:space-y-2">
                              {card.preview.slice(0, 3).map((item, idx) => (
                                <motion.div
                                  key={idx}
                                  className="flex justify-between items-center text-xs sm:text-sm"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: idx * 0.1 }}
                                >
                                  <span className="text-gray-600 capitalize flex-1 pr-2 truncate">{item.strength}</span>
                                  <span className="font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded text-xs flex-shrink-0">
                                    {typeof item.score === 'number' ? item.score.toFixed(1) : item.score}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-center py-3 sm:py-4">
                            <p className="text-xs sm:text-sm text-gray-500">
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