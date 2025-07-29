import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import apiService from '../../services/apiService';
import EnhancedLoadingScreen from '../UI/EnhancedLoadingScreen';
import useScrollToTop from '../../hooks/useScrollToTop';
import AssessmentRelation from './AssessmentRelation';
import {
  viaCategories,
  strengthLabels,
  viaExplanation,
  viaStrengthsData,
  getStrengthDescription,
  getScoreLevel,
  getViaIsInsights
} from '../../data/via';

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














  // Prepare radar chart data for virtue categories
  const prepareRadarData = (viaIsData) => {
    if (!viaIsData) return [];

    // Create a more flexible mapping for field names with scale conversion
    const getStrengthValue = (data, strengthKey) => {
      const variations = [
        strengthKey,
        strengthKey.replace(/_/g, ' '),
        strengthKey.replace(/_/g, ''),
        strengthKey.toLowerCase(),
        strengthKey.replace(/_/g, ' ').toLowerCase(),
        // Add camelCase variations for backend compatibility
        strengthKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
        // Specific mappings for problematic fields
        strengthKey === 'love_of_learning' ? 'loveOfLearning' : null,
        strengthKey === 'social_intelligence' ? 'socialIntelligence' : null,
        strengthKey === 'self_regulation' ? 'selfRegulation' : null,
        strengthKey === 'appreciation_of_beauty' ? 'appreciationOfBeauty' : null
      ].filter(Boolean);

      for (const variation of variations) {
        if (data[variation] !== undefined) {
          // Convert from 0-100 scale to 0-5 scale for display
          const rawValue = data[variation];
          return rawValue / 20; // Convert 0-100 to 0-5
        }
      }
      return 0;
    };

    const categoryScores = {};
    Object.entries(viaCategories).forEach(([categoryKey, category]) => {
      const strengthValues = category.strengths.map(strength => getStrengthValue(viaIsData, strength));
      const validValues = strengthValues.filter(val => val > 0);

      if (validValues.length > 0) {
        const avgScore = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
        categoryScores[categoryKey] = avgScore;
      } else {
        // If no valid values, calculate average including zeros
        const avgScore = strengthValues.reduce((sum, val) => sum + val, 0) / strengthValues.length;
        categoryScores[categoryKey] = avgScore;
      }
    });

    return Object.entries(categoryScores).map(([key, score]) => ({
      category: viaCategories[key].name,
      value: score,
      fullValue: score
    }));
  };



  // Custom tooltip for radar chart
  const CustomRadarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const categoryKey = Object.keys(viaCategories).find(key => viaCategories[key].name === label);
      const category = viaCategories[categoryKey];

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 rounded shadow-lg border border-gray-200 max-w-sm"
        >
          <div className="flex items-center mb-2">
            <h4 className="font-semibold text-gray-900">{label}</h4>
          </div>
          <div className="text-lg font-bold mb-2 text-gray-900">
            Average Score: {data.payload.fullValue.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            Includes: {category?.strengths.map(s => strengthLabels[s]).join(', ')}
          </div>
        </motion.div>
      );
    }
    return null;
  };



  // Navigation cards data
  const navigationCards = [
    {
      title: 'Trait Kepribadian',
      subtitle: 'OCEAN Assessment',
      description: 'Pahami dimensi kepribadian utama Anda.',
      path: `/results/${resultId}/ocean`,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Minat Karier',
      subtitle: 'RIASEC Assessment',
      description: 'Jelajahi minat karier dan preferensi lingkungan kerja Anda.',
      path: `/results/${resultId}/riasec`,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Persona Karier',
      subtitle: 'Integrated Profile',
      description: 'Rekomendasi karier komprehensif berdasarkan profil Anda.',
      path: `/results/${resultId}/persona`,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 overflow-hidden">
        {/* Loading State */}
        {!result && !error && (
          <EnhancedLoadingScreen
            title="Loading VIA Character Strengths..."
            subtitle="Analyzing your character strengths profile"
            skeletonCount={4}
            className="min-h-[600px]"
          />
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-gray-200 rounded p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="text-gray-400 mr-3">⚠️</div>
              <div>
                <h3 className="text-gray-900 font-semibold">Unable to Load Results</h3>
                <p className="text-gray-600 text-sm mt-1">{error}</p>
                <div className="mt-4 space-x-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate(`/results/${resultId}`)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    Back to Overview
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {result && (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8"
            >
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 sm:mb-6">
                <div className="mb-4 lg:mb-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    VIA Character Strengths Assessment
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
                    Discover your signature character strengths based on the VIA (Values in Action) Survey that represents your authentic self.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:flex-shrink-0">
                  <button
                    onClick={() => navigate(`/results/${resultId}`)}
                    className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-3 sm:px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-sm sm:text-base"
                  >
                    Dashboard
                  </button>
                </div>
              </div>

              <div className="bg-white rounded p-3 sm:p-4 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-gray-900 rounded-sm mr-2"></span>
                    <span className="text-xs sm:text-sm">Completed: {formatDate(result.created_at)}</span>
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded text-xs font-medium self-start sm:self-auto">
                    VIA Character Strengths
                  </span>
                </div>
              </div>
            </motion.div>

            {/* VIA Explanation Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 sm:mb-8"
            >
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">💪</span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{viaExplanation.title}</h2>
                      <p className="text-blue-700 font-medium text-sm sm:text-base">Character Strengths & Virtues</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">VIA (Values in Action) Survey merupakan instrumen psikologi positif yang bertujuan mengidentifikasi 24 karakter utama manusia, yang dikelompokkan dalam 6 kategori kebajikan universal. Hasil assessment ini dapat digunakan untuk pengembangan diri, peningkatan kinerja, serta kesejahteraan secara menyeluruh.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div className="bg-white p-3 sm:p-4 rounded border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">👨‍🔬 Pengembang</h4>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{viaExplanation.developer}</p>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">✅ Validitas Ilmiah</h4>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{viaExplanation.validity}</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 sm:p-4 rounded border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">🎯 Tujuan Assessment</h4>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">Assessment ini bertujuan untuk membantu Anda mengenali kekuatan karakter utama (signature strengths) yang dapat dioptimalkan dalam kehidupan pribadi maupun profesional.</p>
                  </div>
                </div>
              </div>
            </motion.div>



            {/* Virtue Categories Radar Chart */}
            {result.assessment_data?.viaIs && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-6 sm:mb-8"
              >
                <div className="bg-white rounded border border-slate-200 shadow-sm p-4 sm:p-6">
                  <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Virtue Categories Profile</h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">Rata-rata skor Anda pada enam kategori kebajikan utama</p>
                  </div>

                  <div className="h-64 sm:h-80 lg:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={prepareRadarData(result.assessment_data.viaIs)}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                          dataKey="category"
                          tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 500 }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 5]}
                          tick={{ fontSize: 8, fill: '#64748b' }}
                          tickCount={6}
                        />
                        <Radar
                          name="Virtue Score"
                          dataKey="value"
                          stroke="#475569"
                          fill="#475569"
                          fillOpacity={0.1}
                          strokeWidth={2.5}
                        />
                        <Tooltip content={<CustomRadarTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {Object.entries(viaCategories).map(([key, category]) => {
                      const categoryData = prepareRadarData(result.assessment_data.viaIs).find(
                        item => item.category === category.name
                      );
                      const scoreLevel = getScoreLevel(categoryData ? categoryData.fullValue : 0);
                      return (
                        <div key={key} className="text-center p-2 sm:p-4 bg-slate-50 rounded border border-slate-200">
                          <div className="text-sm sm:text-lg font-bold mb-1 text-slate-900">
                            {categoryData ? categoryData.fullValue.toFixed(2) : 'N/A'}
                          </div>
                          <div className="text-xs text-slate-600 font-medium mb-1 truncate">{category.name}</div>
                          <div className={`text-xs px-1 sm:px-2 py-1 rounded ${scoreLevel.bg} ${scoreLevel.intensity}`}>
                            {scoreLevel.level}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}



            {/* Virtue Categories Detailed Analysis */}
            {result.assessment_data?.viaIs && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="mb-6 sm:mb-8"
              >
                <div className="bg-white rounded border border-slate-200 shadow-sm p-4 sm:p-6">
                  <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Virtue Categories Analysis</h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">Analisis mendalam kekuatan karakter Anda berdasarkan kategori kebajikan</p>
                  </div>

                  {/* Virtue Categories Cards - responsive grid layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Object.entries(viaCategories).map(([categoryKey, category], index) => {
                      const categoryData = prepareRadarData(result.assessment_data.viaIs).find(
                        item => item.category === category.name
                      );
                      const categoryScore = categoryData ? categoryData.fullValue : 0;
                      const scoreLevel = getScoreLevel(categoryScore);
                      const isHigh = categoryScore >= 3.5;

                      return (
                        <motion.div
                          key={categoryKey}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Header */}
                          <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center min-w-0 flex-1">
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{category.name}</h3>
                                  <p className="text-xs sm:text-sm text-slate-600">{category.strengths.length} Character Strengths</p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2 sm:ml-4">
                                <div className="text-xl sm:text-2xl font-bold text-slate-900">{categoryScore.toFixed(2)}</div>
                                <div className={`text-xs sm:text-sm ${scoreLevel.intensity}`}>{scoreLevel.level}</div>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4 sm:p-6">
                            {/* Progress Bar */}
                            <div className="mb-4 sm:mb-6 overflow-hidden">
                              <div className="bg-slate-200 rounded h-2 sm:h-3 w-full max-w-full">
                                <motion.div
                                  className="h-2 sm:h-3 rounded bg-slate-600"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((categoryScore / 5) * 100, 100)}%` }}
                                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>0.0</span>
                                <span className="font-medium hidden sm:inline">Signature Strength: 4.0+</span>
                                <span className="font-medium sm:hidden">4.0+</span>
                                <span>5.0</span>
                              </div>
                            </div>

                            {/* Strengths in this category */}
                            <div className="mb-4 sm:mb-6">
                              <h4 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Strengths in this Category:</h4>
                              <div className="space-y-2 sm:space-y-3">
                                {category.strengths.map((strength, idx) => {
                                  // Use flexible mapping for strength scores with scale conversion
                                  const getStrengthValue = (data, strengthKey) => {
                                    const variations = [
                                      strengthKey,
                                      strengthKey.replace(/_/g, ' '),
                                      strengthKey.replace(/_/g, ''),
                                      strengthKey.toLowerCase(),
                                      strengthKey.replace(/_/g, ' ').toLowerCase(),
                                      // Add camelCase variations for backend compatibility
                                      strengthKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
                                      // Specific mappings for problematic fields
                                      strengthKey === 'love_of_learning' ? 'loveOfLearning' : null,
                                      strengthKey === 'social_intelligence' ? 'socialIntelligence' : null,
                                      strengthKey === 'self_regulation' ? 'selfRegulation' : null,
                                      strengthKey === 'appreciation_of_beauty' ? 'appreciationOfBeauty' : null
                                    ].filter(Boolean);

                                    for (const variation of variations) {
                                      if (data[variation] !== undefined) {
                                        // Convert from 0-100 scale to 0-5 scale for display
                                        const rawValue = data[variation];
                                        return rawValue / 20; // Convert 0-100 to 0-5
                                      }
                                    }
                                    return 0;
                                  };

                                  const strengthScore = getStrengthValue(result.assessment_data.viaIs, strength);
                                  const strengthLabel = strengthLabels[strength] || strength.replace(/_/g, ' ');
                                  const strengthLevel = getScoreLevel(strengthScore);
                                  return (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm p-2 rounded bg-slate-50 border border-slate-200 space-y-1 sm:space-y-0">
                                      <span className="text-slate-700 font-medium flex-1 min-w-0 break-words">{strengthLabel}</span>
                                      <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
                                        <span className="font-bold text-slate-900">{strengthScore.toFixed(2)}</span>
                                        <span className={`text-xs px-1 sm:px-2 py-1 rounded ${strengthLevel.bg} ${strengthLevel.intensity}`}>
                                          {strengthScore >= 4.0 ? 'Signature' : strengthScore >= 3.5 ? 'High' : strengthScore >= 2.5 ? 'Moderate' : 'Lower'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Category Implications */}
                            <div className="bg-slate-50 rounded p-3 sm:p-4 border border-slate-200">
                              <h4 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Category Overview</h4>
                              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                {isHigh
                                  ? `Skor tinggi pada kategori ${category.name} menunjukkan pengembangan yang kuat pada kekuatan karakter terkait. Anda secara alami merepresentasikan kebajikan dalam kategori ini dan dapat memanfaatkannya untuk mendukung peran profesional maupun kehidupan pribadi.`
                                  : `Skor moderat pada kategori ${category.name} menunjukkan masih terdapat ruang untuk pengembangan kekuatan karakter terkait. Disarankan untuk meningkatkan area ini guna memperkuat profil karakter dan efektivitas diri secara menyeluruh.`
                                }
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Main Grid Layout - 2 Columns */}
            {result.assessment_data?.viaIs && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 overflow-hidden min-w-0">
                {/* Left Column - Signature Strengths */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="bg-white rounded border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 min-w-0">Top 5 Signature Strengths</h3>
                    </div>

                    <p className="text-slate-600 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
                      Lima kekuatan karakter teratas berikut merupakan ciri utama yang paling menonjol dalam diri Anda. Optimalkan kekuatan ini dalam aktivitas sehari-hari maupun pengembangan karier.
                    </p>

                    <div className="space-y-3 sm:space-y-4">
                      {getViaIsInsights(result.assessment_data.viaIs, viaCategories, strengthLabels).top.map(([strength, score], idx) => {
                        return (
                          <motion.div
                            key={strength}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.9 + idx * 0.1 }}
                            className="p-3 sm:p-4 rounded border border-slate-200 bg-slate-50 overflow-hidden"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-1 sm:space-y-0">
                              <h4 className="font-semibold text-slate-900 flex-1 sm:mr-2 break-words min-w-0 text-sm sm:text-base">
                                {strengthLabels[strength] || strength.replace(/_/g, ' ')}
                              </h4>
                              <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded bg-slate-600 text-white flex-shrink-0 font-bold self-start sm:self-auto">
                                {score.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 mb-2 sm:mb-3 leading-relaxed">
                              {getStrengthDescription(strength, viaStrengthsData)}
                            </p>
                            <div className="bg-slate-200 rounded h-2 sm:h-2.5 overflow-hidden">
                              <motion.div
                                className="bg-slate-600 h-2 sm:h-2.5 rounded"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((score / 5) * 100, 100)}%` }}
                                transition={{ duration: 0.8, delay: 1.0 + idx * 0.1 }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Right Column - Development Areas */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="bg-white rounded border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 min-w-0">Development Opportunities</h3>
                    </div>

                    <p className="text-slate-600 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
                      Kekuatan karakter berikut memiliki skor lebih rendah, namun tetap dapat dikembangkan sesuai kebutuhan dan tujuan Anda. Pertimbangkan untuk memperkuat area ini demi mendukung pertumbuhan pribadi secara optimal.
                    </p>

                    <div className="space-y-3 sm:space-y-4">
                      {getViaIsInsights(result.assessment_data.viaIs, viaCategories, strengthLabels).bottom.map(([strength, score], idx) => {
                        return (
                          <motion.div
                            key={strength}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.9 + idx * 0.1 }}
                            className="p-3 sm:p-4 rounded border border-slate-200 bg-slate-50 overflow-hidden"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-1 sm:space-y-0">
                              <h4 className="font-semibold text-slate-900 flex-1 sm:mr-2 break-words min-w-0 text-sm sm:text-base">
                                {strengthLabels[strength] || strength.replace(/_/g, ' ')}
                              </h4>
                              <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded bg-slate-600 text-white flex-shrink-0 font-bold self-start sm:self-auto">
                                {score.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 mb-2 sm:mb-3 leading-relaxed">
                              {getStrengthDescription(strength, viaStrengthsData)}
                            </p>
                            <div className="bg-slate-200 rounded h-2 sm:h-2.5 overflow-hidden">
                              <motion.div
                                className="bg-slate-600 h-2 sm:h-2.5 rounded"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((score / 5) * 100, 100)}%` }}
                                transition={{ duration: 0.8, delay: 1.0 + idx * 0.1 }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* VIA Strengths Data Explanation Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="mb-6 sm:mb-8"
            >
              <div className="bg-white rounded border border-slate-200 shadow-sm p-4 sm:p-6">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">24 Character Strengths Explained</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto">
                    Berikut adalah penjelasan lengkap dari 24 kekuatan karakter VIA yang dikelompokkan berdasarkan 6 kategori kebajikan universal.
                    Setiap kekuatan memiliki karakteristik unik yang dapat membantu Anda memahami profil karakter secara mendalam.
                  </p>
                </div>

                {/* Dynamic Grid Layout for All Strengths */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {Object.entries(viaStrengthsData).map(([strengthKey, strengthData], index) => {
                    // Get the score for this strength from the result data
                    const getStrengthValue = (data, strengthKey) => {
                      const variations = [
                        strengthKey,
                        strengthKey.replace(/_/g, ' '),
                        strengthKey.replace(/_/g, ''),
                        strengthKey.toLowerCase(),
                        strengthKey.replace(/_/g, ' ').toLowerCase(),
                        strengthKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
                        strengthKey === 'love_of_learning' ? 'loveOfLearning' : null,
                        strengthKey === 'social_intelligence' ? 'socialIntelligence' : null,
                        strengthKey === 'self_regulation' ? 'selfRegulation' : null,
                        strengthKey === 'appreciation_of_beauty' ? 'appreciationOfBeauty' : null
                      ].filter(Boolean);

                      for (const variation of variations) {
                        if (data[variation] !== undefined) {
                          const rawValue = data[variation];
                          return rawValue / 20; // Convert 0-100 to 0-5
                        }
                      }
                      return 0;
                    };

                    const strengthScore = result.assessment_data?.viaIs ? getStrengthValue(result.assessment_data.viaIs, strengthKey) : 0;
                    const scoreLevel = getScoreLevel(strengthScore);
                    const categoryData = viaCategories[strengthData.category];
                    const isSignature = strengthScore >= 4.0;
                    const isHigh = strengthScore >= 3.5;

                    return (
                      <motion.div
                        key={strengthKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white rounded-lg border-2 p-3 sm:p-4 lg:p-5 hover:shadow-lg transition-all duration-300 ${
                          isSignature
                            ? 'border-slate-600 bg-slate-50'
                            : isHigh
                            ? 'border-slate-400 bg-slate-25'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Header */}
                        <div className="mb-3 sm:mb-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-1 sm:space-y-0">
                            <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight flex-1 sm:mr-2">
                              {strengthData.name}
                            </h4>
                            <div className="text-left sm:text-right flex-shrink-0">
                              <div className="text-lg sm:text-xl font-bold text-slate-900">
                                {strengthScore.toFixed(1)}
                              </div>
                              <div className={`text-xs px-1 sm:px-2 py-1 rounded ${scoreLevel.bg} ${scoreLevel.intensity} inline-block`}>
                                {isSignature ? 'Signature' : scoreLevel.level}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-slate-500 mb-2 sm:mb-3">
                            <span className="font-medium">{categoryData?.name}</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="bg-slate-200 rounded h-1.5 sm:h-2 mb-2 sm:mb-3">
                            <motion.div
                              className={`h-1.5 sm:h-2 rounded ${isSignature ? 'bg-slate-600' : isHigh ? 'bg-slate-500' : 'bg-slate-400'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((strengthScore / 5) * 100, 100)}%` }}
                              transition={{ duration: 0.8, delay: 0.5 + index * 0.02 }}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="mb-3 sm:mb-4">
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {strengthData.description}
                          </p>
                        </div>

                        {/* Traits based on score level */}
                        <div className="space-y-2 sm:space-y-3">
                          {strengthScore >= 3.0 ? (
                            <div>
                              <h5 className="text-xs sm:text-sm font-semibold text-green-800 mb-1 sm:mb-2">Karakteristik Anda:</h5>
                              <ul className="text-xs text-green-700 space-y-1">
                                {strengthData.highTraits.slice(0, 3).map((trait, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-green-500 mr-1 flex-shrink-0">•</span>
                                    <span className="leading-tight">{trait}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div>
                              <h5 className="text-xs sm:text-sm font-semibold text-amber-800 mb-1 sm:mb-2">Area Pengembangan:</h5>
                              <ul className="text-xs text-amber-700 space-y-1">
                                {strengthData.lowTraits.slice(0, 3).map((trait, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-amber-500 mr-1 flex-shrink-0">•</span>
                                    <span className="leading-tight">{trait}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Implications */}
                          <div className="bg-slate-50 rounded p-2 sm:p-3 border border-slate-200">
                            <h5 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1">Implikasi Karier:</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {strengthScore >= 3.0 ? strengthData.implications.high : strengthData.implications.low}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 sm:mt-8 bg-slate-50 rounded-lg p-3 sm:p-4 border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2 sm:mb-3">Panduan Interpretasi:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-slate-600 rounded mr-2 flex-shrink-0"></div>
                      <span><strong>Signature (4.0+):</strong> Kekuatan utama Anda</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-slate-500 rounded mr-2 flex-shrink-0"></div>
                      <span><strong>High (3.5-3.9):</strong> Kekuatan yang berkembang baik</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-slate-400 rounded mr-2 flex-shrink-0"></div>
                      <span><strong>Moderate (2.5-3.4):</strong> Kekuatan yang cukup</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-slate-300 rounded mr-2 flex-shrink-0"></div>
                      <span><strong>Lower (&lt;2.5):</strong> Area pengembangan</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* VIA Accuracy and Validity Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 sm:mt-12 lg:mt-16 mb-8 sm:mb-12"
            >
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl font-semibold">✓</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">Akurasi dan Validitas Assessment</h2>
                      <p className="text-gray-600 font-medium text-sm sm:text-base">Mengapa VIA Character Strengths Sangat Tepat untuk Assessment Karakter</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                        <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <span className="text-white text-xs sm:text-sm">1</span>
                        </span>
                        Fondasi Ilmiah yang Kuat
                      </h4>
                      <ul className="text-xs sm:text-sm text-gray-700 space-y-2 sm:space-y-3">
                        <li className="flex items-start">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                          <span>Dikembangkan melalui penelitian lintas budaya selama 3 tahun dengan 1 juta responden</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                          <span>Validasi empiris di 54 negara dengan reliabilitas test-retest tinggi (α &gt; 0.85)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                          <span>Berdasarkan analisis literatur filosofi dan agama selama 2000+ tahun</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                        <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <span className="text-white text-xs sm:text-sm">2</span>
                        </span>
                        Keunggulan Metodologi
                      </h4>
                      <ul className="text-xs sm:text-sm text-gray-700 space-y-2 sm:space-y-3">
                        <li className="flex items-start">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                          <span>Mengukur karakter positif, bukan defisit atau patologi</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                          <span>Fokus pada kekuatan yang dapat dikembangkan dan dioptimalkan</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                          <span>Memberikan hasil yang actionable untuk pengembangan diri</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                        <span className="text-white text-xs sm:text-sm">3</span>
                      </span>
                      Hubungan dengan Assessment Lain
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Dengan RIASEC (Minat Karier):</h5>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">Kekuatan karakter mempengaruhi preferensi lingkungan kerja. Misalnya, individu dengan kekuatan "Leadership" tinggi cenderung tertarik pada tipe Enterprising, sementara "Love of Learning" berkorelasi dengan tipe Investigative.</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Dengan OCEAN (Kepribadian):</h5>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">Karakter dan kepribadian saling memperkuat. Kekuatan "Creativity" berkorelasi dengan Openness tinggi, "Perseverance" dengan Conscientiousness, dan "Social Intelligence" dengan Extraversion.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

  

            {/* Navigation to Other Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="mb-8 sm:mb-12"
            >
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-md p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-md mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl">🧭</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2 sm:mb-3 tracking-tight">
                    Jelajahi Profil Lengkap Anda
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
                    Lanjutkan eksplorasi untuk memahami berbagai aspek kepribadian dan potensi karier Anda secara komprehensif. Setiap assessment memberikan wawasan yang saling melengkapi untuk pengembangan diri yang berkelanjutan.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
                {navigationCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.7 + index * 0.1 }}
                    whileHover={{
                      y: -4,
                      transition: { duration: 0.15 }
                    }}
                    className="group cursor-pointer"
                    onClick={() => navigate(card.path)}
                  >
                    <div className="bg-white rounded-md p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 h-full">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-end mb-3 sm:mb-4">
                          <motion.svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </motion.svg>
                        </div>

                        <div className="flex-grow">
                          <h3 className="text-lg sm:text-xl font-light text-slate-900 mb-2 group-hover:text-slate-700 transition-colors tracking-tight">
                            {card.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 mb-2 sm:mb-3 font-medium uppercase tracking-wide">
                            {card.subtitle}
                          </p>
                          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                            {card.description}
                          </p>
                        </div>

                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                          <div className="flex items-center text-xs sm:text-sm font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                            <span>Lihat Assessment</span>
                            <motion.svg
                              className="w-3 h-3 sm:w-4 sm:h-4 ml-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              whileHover={{ x: 2 }}
                              transition={{ duration: 0.2 }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </motion.svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </>
        )}
      </div>
    </div>
  );
};

export default ResultViaIs;