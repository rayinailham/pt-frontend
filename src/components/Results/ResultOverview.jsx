import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Cell
} from 'recharts';
import apiService from '../../services/apiService';
import EnhancedLoadingScreen from '../UI/EnhancedLoadingScreen';
import useScrollToTop from '../../hooks/useScrollToTop';
import AssessmentRelation from './AssessmentRelation';
import { getIndustryInfo } from '../../data/industryData';
import { transformAssessmentScores, validateAssessmentData } from '../../utils/assessmentTransformers';

const ResultOverview = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fetchInProgressRef = useRef(false);
  const abortControllerRef = useRef(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitError, setResubmitError] = useState('');

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

  // Function to handle viewing raw result data
  const handleViewRawResult = async () => {
    try {
      const response = await apiService.getResultById(resultId);
      if (response.success) {
        // Open raw data in a new window/tab for debugging
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>Raw Result Data - ${resultId}</title>
                <style>
                  body {
                    font-family: 'Courier New', monospace;
                    margin: 20px;
                    background-color: #f8f9fa;
                  }
                  .container {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  }
                  .header {
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                  }
                  pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 4px;
                    border: 1px solid #dee2e6;
                    font-size: 12px;
                    line-height: 1.4;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Raw Result Data</h1>
                    <p><strong>Result ID:</strong> ${resultId}</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  <pre>${JSON.stringify(response.data, null, 2)}</pre>
                </div>
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      }
    } catch (error) {
      console.error('Failed to fetch raw result:', error);
      alert('Failed to fetch raw result data. Please try again.');
    }
  };

  // Function to handle resubmitting assessment for regeneration
  const handleResubmitAssessment = async () => {
    if (!result?.assessment_data) {
      setResubmitError('No assessment data available for resubmission');
      return;
    }

    setIsResubmitting(true);
    setResubmitError('');

    try {
      // Transform the existing assessment data to the format expected by the API
      // We need to convert the result format back to the assessment format
      const assessmentScores = {
        via: {
          // Map VIA-IS scores back to category scores
          // Since we have individual character strengths, we need to group them back
          wisdomAndKnowledge: Math.round((
            (result.assessment_data.viaIs.creativity || 50) +
            (result.assessment_data.viaIs.curiosity || 50) +
            (result.assessment_data.viaIs.judgment || 50) +
            (result.assessment_data.viaIs.loveOfLearning || 50) +
            (result.assessment_data.viaIs.perspective || 50)
          ) / 5),
          courage: Math.round((
            (result.assessment_data.viaIs.bravery || 50) +
            (result.assessment_data.viaIs.perseverance || 50) +
            (result.assessment_data.viaIs.honesty || 50) +
            (result.assessment_data.viaIs.zest || 50)
          ) / 4),
          humanity: Math.round((
            (result.assessment_data.viaIs.love || 50) +
            (result.assessment_data.viaIs.kindness || 50) +
            (result.assessment_data.viaIs.socialIntelligence || 50)
          ) / 3),
          justice: Math.round((
            (result.assessment_data.viaIs.teamwork || 50) +
            (result.assessment_data.viaIs.fairness || 50) +
            (result.assessment_data.viaIs.leadership || 50)
          ) / 3),
          temperance: Math.round((
            (result.assessment_data.viaIs.forgiveness || 50) +
            (result.assessment_data.viaIs.humility || 50) +
            (result.assessment_data.viaIs.prudence || 50) +
            (result.assessment_data.viaIs.selfRegulation || 50)
          ) / 4),
          transcendence: Math.round((
            (result.assessment_data.viaIs.appreciationOfBeauty || 50) +
            (result.assessment_data.viaIs.gratitude || 50) +
            (result.assessment_data.viaIs.hope || 50) +
            (result.assessment_data.viaIs.humor || 50) +
            (result.assessment_data.viaIs.spirituality || 50)
          ) / 5)
        },
        riasec: result.assessment_data.riasec,
        bigFive: result.assessment_data.ocean
      };

      // Transform scores to API format
      const transformedData = transformAssessmentScores(assessmentScores);

      // Validate the transformed data
      const validation = validateAssessmentData(transformedData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Submit to API
      const response = await apiService.submitAssessment(transformedData);

      if (response.success && response.data?.jobId) {
        // Navigate to status page
        navigate(`/assessment/status/${response.data.jobId}`, {
          state: { fromRegeneration: true },
        });
      } else {
        throw new Error(response.message || "Failed to resubmit assessment");
      }
    } catch (error) {
      console.error("Assessment resubmission error:", error);

      // Handle specific error cases
      let errorMessage = "Failed to regenerate assessment";

      if (error.response?.status === 402) {
        errorMessage =
          "Insufficient tokens to process your assessment. Please contact support or try again later.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setResubmitError(errorMessage);
    } finally {
      setIsResubmitting(false);
    }
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
        className="mb-8"
      >
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-b from-gray-50/30 to-white p-4 sm:p-6 border-b border-gray-100/60">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-medium text-gray-900 mb-3 tracking-tight">
                Visualisasi Hasil Assessment
              </h2>
              <p className="text-gray-600 text-sm sm:text-base font-normal leading-relaxed">
                Gambaran visual dari kekuatan utama Anda di setiap dimensi assessment
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* VIA Character Strengths */}
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
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
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
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
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
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
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200/60">
              <h4 className="text-base sm:text-lg font-medium text-gray-900 text-center mb-6">Skor Tertinggi Anda</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
                  <div className="text-2xl sm:text-3xl font-medium text-gray-900 mb-2 sm:mb-3 tabular-nums">
                    {viaTopScores.length > 0 ? viaTopScores[0].score.toFixed(0) : 'N/A'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1 sm:mb-2">Top Character Strength</div>
                  <div className="text-xs text-gray-500 font-medium capitalize">
                    {viaTopScores.length > 0 ? viaTopScores[0].name : 'No data'}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
                  <div className="text-2xl sm:text-3xl font-medium text-gray-900 mb-2 sm:mb-3 tabular-nums">
                    {riasecTopScores.length > 0 ? riasecTopScores[0].score.toFixed(0) : 'N/A'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1 sm:mb-2">Top Career Interest</div>
                  <div className="text-xs text-gray-500 font-medium capitalize">
                    {riasecTopScores.length > 0 ? riasecTopScores[0].name : 'No data'}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200/60 shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
                  <div className="text-2xl sm:text-3xl font-medium text-gray-900 mb-2 sm:mb-3 tabular-nums">
                    {oceanTopScores.length > 0 ? oceanTopScores[0].score.toFixed(0) : 'N/A'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1 sm:mb-2">Top Personality Trait</div>
                  <div className="text-xs text-gray-500 font-medium capitalize">
                    {oceanTopScores.length > 0 ? oceanTopScores[0].name : 'No data'}
                  </div>
                </div>
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

  const getTopIndustries = (industryData) => {
    if (!industryData) {
      return [];
    }
    return Object.entries(industryData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([industry, score]) => ({ strength: industry, score }));
  };

  // Prepare data for radial bar chart
  const prepareRadialChartData = (industryData) => {
    // Premium color scheme: sophisticated and elegant tones
    const colors = ['#1e293b', '#475569', '#64748b', '#94a3b8'];
    return getTopIndustries(industryData).map((industry, index) => ({
      name: industryNameMapping[industry.strength] || industry.strength,
      value: industry.score,
      fill: colors[index],
      originalKey: industry.strength
    }));
  };

  // Industry name mapping for better display
  const industryNameMapping = {
    'teknologi': 'Teknologi',
    'kesehatan': 'Kesehatan',
    'keuangan': 'Keuangan',
    'pendidikan': 'Pendidikan',
    'rekayasa': 'Rekayasa',
    'pemasaran': 'Pemasaran',
    'hukum': 'Hukum',
    'kreatif': 'Kreatif',
    'media': 'Media',
    'penjualan': 'Penjualan',
    'sains': 'Sains',
    'manufaktur': 'Manufaktur',
    'agrikultur': 'Agrikultur',
    'pemerintahan': 'Pemerintahan',
    'konsultasi': 'Konsultasi',
    'pariwisata': 'Pariwisata',
    'logistik': 'Logistik',
    'energi': 'Energi',
    'sosial': 'Sosial',
    'olahraga': 'Olahraga',
    'properti': 'Properti',
    'kuliner': 'Kuliner',
    'perdagangan': 'Perdagangan',
    'telekomunikasi': 'Telekomunikasi'
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
      title: 'Profile Persona',
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
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button
                    onClick={handleResubmitAssessment}
                    disabled={isResubmitting}
                    className={`border border-blue-200 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors font-medium text-sm flex items-center space-x-2 flex-1 sm:flex-none justify-center ${
                      isResubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Generate new analysis with the same assessment data"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{isResubmitting ? 'Generating...' : 'Regenerate'}</span>
                  </button>
                  <button
                    onClick={handleViewRawResult}
                    className="border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm flex items-center space-x-2 flex-1 sm:flex-none justify-center"
                    title="View raw result data for debugging"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>Raw Data</span>
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-900 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm sm:text-base flex-1 sm:flex-none"
                  >
                    Dashboard
                  </button>
                </div>
              </div>

              {/* Resubmit Error Message */}
              {resubmitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Regeneration Failed</h3>
                      <p className="text-sm text-red-700 mt-1">{resubmitError}</p>
                    </div>
                  </div>
                </motion.div>
              )}

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

            {/* Profile Persona & Assessment Understanding - Bento Layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 sm:mb-10 lg:mb-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Profile Persona - Compact without summary */}
                {(() => {
                  const archetype = result.persona_profile?.archetype || result.persona_profile?.career_persona?.archetype;
                  const riskTolerance = result.persona_profile?.riskTolerance || result.persona_profile?.risk_tolerance;
                  const careerRecommendations = result.persona_profile?.careerRecommendation || result.persona_profile?.career_recommendations || [];

                  return archetype && (
                    <div className="bg-white rounded-xl border border-gray-200/40 p-4 sm:p-6 shadow-xs">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-lg sm:text-xl">🎪</span>
                        </div>
                        <h2 className="text-base sm:text-lg font-medium text-gray-900">
                          Profile Persona Anda
                        </h2>
                      </div>

                      <div className="space-y-3">
                        <motion.div
                          className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200/40"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="text-xs text-gray-500 font-medium mb-1">Archetype</div>
                          <div className="text-sm font-medium text-gray-900">{archetype}</div>
                        </motion.div>

                        {riskTolerance && (
                          <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200/40">
                            <div className="text-xs text-gray-500 font-medium mb-1">Risk Tolerance</div>
                            <div className="text-sm font-medium text-gray-900 capitalize">{riskTolerance}</div>
                          </div>
                        )}

                        <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200/40">
                          <div className="text-xs text-gray-500 font-medium mb-1">Career Recommendations</div>
                          <div className="text-sm font-medium text-gray-900">{careerRecommendations.length} Available</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Assessment Understanding - Spans 2 columns */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200/40 p-4 sm:p-6 shadow-xs">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-lg sm:text-xl">📊</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-medium text-gray-900">
                      Memahami Hasil Assessment Anda
                    </h2>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    Hasil assessment Anda diorganisir dalam empat bagian komprehensif yang saling terintegrasi.
                    Setiap dimensi memberikan wawasan unik tentang profil kepribadian dan karir Anda.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/40">
                      <div className="flex items-center mb-2">
                        <span className="text-sm mr-2">⭐</span>
                        <strong className="text-sm text-gray-900">Character Strengths</strong>
                      </div>
                      <p className="text-xs text-gray-600">Nilai-nilai inti dan kekuatan karakter yang mendorong perilaku Anda.</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/40">
                      <div className="flex items-center mb-2">
                        <span className="text-sm mr-2">🎯</span>
                        <strong className="text-sm text-gray-900">Career Interests</strong>
                      </div>
                      <p className="text-xs text-gray-600">Minat terhadap lingkungan karir dan aktivitas yang menarik bagi Anda.</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/40">
                      <div className="flex items-center mb-2">
                        <span className="text-sm mr-2">🧭</span>
                        <strong className="text-sm text-gray-900">Personality Traits</strong>
                      </div>
                      <p className="text-xs text-gray-600">Dimensi kepribadian fundamental dan gaya kerja Anda.</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/40">
                      <div className="flex items-center mb-2">
                        <span className="text-sm mr-2">🎪</span>
                        <strong className="text-sm text-gray-900">Profile Persona</strong>
                      </div>
                      <p className="text-xs text-gray-600">Sintesis semua assessment menjadi rekomendasi karir yang actionable.</p>
                    </div>
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

            {/* Top 4 Industries Section */}
            {result.assessment_data?.industryScore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <div className="bg-white rounded-xl border border-gray-200/60 shadow-xs overflow-hidden">
                  <div className="bg-gradient-to-b from-gray-50/30 to-white p-6 sm:p-8 border-b border-gray-100/60">
                    <div className="text-center max-w-3xl mx-auto">
                      <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 mb-4 tracking-tight">
                        Top 4 Industri yang Cocok untuk Anda
                      </h2>
                      <p className="text-gray-600 text-base sm:text-lg font-normal leading-relaxed">
                        Berdasarkan analisis komprehensif kepribadian dan minat Anda, berikut adalah industri yang paling sesuai dengan profil Anda
                      </p>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    {/* Integrated Talent Profile & Industry Analysis */}
                    <div className="mb-12">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden"
                      >
                        <div className="bg-gray-50/50 p-6 border-b border-gray-200/60">
                          <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Talent Profile & Industry Analysis</h3>
                            <p className="text-sm text-gray-600">Analisis komprehensif kesesuaian industri berdasarkan profil kepribadian Anda</p>
                          </div>
                        </div>

                        <div className="p-6">
                          {/* 2x2 Grid Layout */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Left - Radial Chart */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.6, delay: 0.8 }}
                              className="bg-gray-50/30 rounded-lg p-6 border border-gray-200/40"
                            >
                              <div className="text-center mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Industry Match Chart</h4>
                                <p className="text-sm text-gray-600">Visualisasi kesesuaian industri berdasarkan profil Anda</p>
                              </div>

                              <div className="flex justify-center">
                                <div className="relative w-64 h-64">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                      cx="50%"
                                      cy="50%"
                                      innerRadius="30%"
                                      outerRadius="85%"
                                      data={prepareRadialChartData(result.assessment_data.industryScore)}
                                      startAngle={90}
                                      endAngle={450}
                                    >
                                      <RadialBar
                                        minAngle={15}
                                        background={{ fill: 'transparent' }}
                                        dataKey="value"
                                        cornerRadius={6}
                                        fill="#8884d8"
                                      >
                                        {prepareRadialChartData(result.assessment_data.industryScore).map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                      </RadialBar>
                                    </RadialBarChart>
                                  </ResponsiveContainer>

                                  {/* Center Label */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-xl font-bold text-gray-900">
                                        {prepareRadialChartData(result.assessment_data.industryScore)[0]?.value.toFixed(0)}%
                                      </div>
                                      <div className="text-xs text-gray-500 font-medium">Top Match</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>

                            {/* Top Right - Industry Rankings */}
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.6, delay: 1.0 }}
                              className="bg-gray-50/30 rounded-lg p-6 border border-gray-200/40"
                            >
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Industry Rankings</h4>
                                <p className="text-sm text-gray-600">Ranking industri berdasarkan tingkat kesesuaian</p>
                              </div>

                              <div className="space-y-3">
                                {prepareRadialChartData(result.assessment_data.industryScore).map((item, index) => {
                                  return (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200/60 hover:shadow-sm transition-all duration-200"
                                    >
                                      <div className="flex items-center space-x-3 flex-1">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                          </div>
                                          <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.fill }}
                                          ></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-sm font-semibold text-gray-900 truncate">
                                              {item.name}
                                            </span>
                                          </div>
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            item.value >= 75 ? 'bg-green-100 text-green-800' :
                                            item.value >= 65 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {item.value >= 75 ? 'Sangat Cocok' :
                                             item.value >= 65 ? 'Cocok' : 'Cukup Cocok'}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-right ml-3">
                                        <div className="text-lg font-bold text-gray-900 tabular-nums">
                                          {item.value.toFixed(0)}%
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </motion.div>

                            {/* Bottom - Industry Analysis Summary */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: 1.4 }}
                              className="lg:col-span-2 bg-gray-50/30 rounded-lg p-6 border border-gray-200/40"
                            >
                              <div className="flex items-start space-x-3 mb-4">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-gray-600 text-lg">🎯</span>
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Industry Match Summary</h4>
                                  <p className="text-sm text-gray-600">Ringkasan analisis kesesuaian industri berdasarkan profil assessment Anda</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Key Insights */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200/60">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <span className="text-gray-600 text-sm">💡</span>
                                    <h5 className="font-medium text-gray-900 text-sm">Key Insights</h5>
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                    Top match: <span className="font-semibold text-gray-900">{prepareRadialChartData(result.assessment_data.industryScore)[0]?.name}</span> ({prepareRadialChartData(result.assessment_data.industryScore)[0]?.value.toFixed(0)}%)
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Prioritaskan pengembangan karir di sektor ini untuk memaksimalkan potensi natural Anda.
                                  </p>
                                </div>

                                {/* Calculation Method */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200/60">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <span className="text-gray-600 text-sm">📊</span>
                                    <h5 className="font-medium text-gray-900 text-sm">Calculation Method</h5>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2">
                                    Skor dihitung berdasarkan weighted average dari:
                                  </p>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div>• RIASEC traits (minat karir)</div>
                                    <div>• VIA traits (kekuatan karakter)</div>
                                    <div>• OCEAN traits (kepribadian)</div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Industry Details Section - Enhanced */}
                    <div className="mb-12">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden"
                      >
                        <div className="bg-gray-50/50 p-6 border-b border-gray-200/60">
                          <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Detail Industri Terpilih</h3>
                            <p className="text-sm text-gray-600">Informasi komprehensif tentang setiap industri yang sesuai dengan profil Anda</p>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {getTopIndustries(result.assessment_data.industryScore).map((industry, index) => {
                              const industryInfo = getIndustryInfo(industry.strength);

                              return (
                                <motion.div
                                  key={industry.strength}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.4, delay: 1.0 + index * 0.1 }}
                                  className="bg-gray-50/30 rounded-lg p-5 border border-gray-200/60 hover:bg-gray-50/50 transition-all duration-300"
                                >
                                  {/* Header with Score */}
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center flex-1">
                                      <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                          {index + 1}
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                          {industryNameMapping[industry.strength] || industry.strength}
                                        </h4>
                                        <div className="flex items-center">
                                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            industry.score >= 75 ? 'bg-green-100 text-green-800' :
                                            industry.score >= 65 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {industry.score >= 75 ? 'Sangat Cocok' :
                                             industry.score >= 65 ? 'Cocok' : 'Cukup Cocok'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="text-2xl font-bold text-gray-900 tabular-nums">
                                        {industry.score.toFixed(0)}%
                                      </div>
                                      <div className="text-xs text-gray-500 font-medium">Match Score</div>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                    {industryInfo.description}
                                  </p>

                                  {/* Category */}
                                  <div className="mb-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                      {industryInfo.category || industry.strength.charAt(0).toUpperCase() + industry.strength.slice(1)}
                                    </span>
                                  </div>

                                  {/* Companies */}
                                  <div>
                                    <div className="text-xs font-medium text-gray-700 mb-3">Contoh Perusahaan Terkemuka:</div>
                                    <div className="flex flex-wrap gap-2">
                                      {industryInfo.topCompanies.slice(0, 4).map((company, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white text-gray-700 border border-gray-200/60 shadow-sm"
                                        >
                                          {company}
                                        </span>
                                      ))}
                                      {industryInfo.topCompanies.length > 4 && (
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                          +{industryInfo.topCompanies.length - 4} lainnya
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Methodology Explanation Section */}
                    <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
                      <div className="bg-gray-50/50 p-6 border-b border-gray-200/60">
                        <div className="text-center max-w-4xl mx-auto">
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">Metodologi Penilaian</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            Skor industri dihitung berdasarkan analisis mendalam terhadap kesesuaian kepribadian OCEAN,
                            minat karir RIASEC, dan kekuatan karakter VIA Anda dengan kebutuhan spesifik setiap industri.
                          </p>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                          <motion.div
                            className="bg-gray-50/30 rounded-lg p-5 border border-gray-200/40"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 1.2 }}
                          >
                            <div className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-gray-600">🧭</span>
                              </div>
                              OCEAN Model
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">Analisis kepribadian fundamental yang mempengaruhi gaya kerja dan preferensi lingkungan kerja Anda dalam konteks profesional</p>
                          </motion.div>
                          <motion.div
                            className="bg-gray-50/30 rounded-lg p-5 border border-gray-200/40"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 1.3 }}
                          >
                            <div className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-gray-600">🎯</span>
                              </div>
                              RIASEC Theory
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">Pemetaan minat terhadap lingkungan dan aktivitas karir yang sesuai dengan preferensi alami dan motivasi intrinsik Anda</p>
                          </motion.div>
                          <motion.div
                            className="bg-gray-50/30 rounded-lg p-5 border border-gray-200/40"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 1.4 }}
                          >
                            <div className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-gray-600">⭐</span>
                              </div>
                              VIA Character
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">Identifikasi kekuatan karakter yang mendorong perilaku dan nilai-nilai inti dalam bekerja serta pengambilan keputusan</p>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Assessment Sections - Traditional Grid Layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Jelajahi Hasil Assessment Anda
              </h2>

              {/* Responsive Grid Layout - 2x2 */}
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
                    className="bg-white rounded-xl border border-gray-200/60 hover:border-gray-300/80 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full"
                    onClick={() => navigate(card.path)}
                  >
                    <div className="p-4 sm:p-5 md:p-6 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex items-start flex-1">
                          <motion.div
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-gray-200 transition-colors flex-shrink-0"
                            whileHover={{ rotate: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-lg sm:text-xl">{card.icon}</span>
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 group-hover:text-gray-700 transition-colors leading-tight mb-1">
                              {card.title}
                            </h3>
                            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{card.description}</p>
                          </div>
                        </div>
                        <motion.svg
                          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
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
                      <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100">
                        {card.preview && card.preview.length > 0 ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Highlights Utama:</h4>
                            <div className="space-y-1.5">
                              {card.preview.slice(0, 3).map((item, idx) => (
                                <motion.div
                                  key={idx}
                                  className="flex justify-between items-center text-xs sm:text-sm"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: idx * 0.1 }}
                                >
                                  <span className="text-gray-600 capitalize flex-1 pr-2 truncate">{item.strength}</span>
                                  <span className="font-medium text-gray-900 bg-gray-50 px-2 py-0.5 rounded text-xs flex-shrink-0">
                                    {typeof item.score === 'number' ? item.score.toFixed(1) : item.score}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-center py-2 sm:py-3">
                            <p className="text-xs sm:text-sm text-gray-500">
                              {card.title.includes('Character Strengths') ? 'Data kekuatan karakter tidak tersedia' :
                               card.title.includes('Career Interests') ? 'Data minat karir tidak tersedia' :
                               card.title.includes('Personality Traits') ? 'Data kepribadian tidak tersedia' :
                               card.title.includes('Industry Recommendations') ? 'Data rekomendasi industri tidak tersedia' :
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