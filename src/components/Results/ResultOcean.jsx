import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import apiService from '../../services/apiService';
import EnhancedLoadingScreen from '../UI/EnhancedLoadingScreen';
import useScrollToTop from '../../hooks/useScrollToTop';

const ResultOcean = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fetchInProgressRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Scroll to top when component mounts or route changes
  useScrollToTop();

  useEffect(() => {
    if (fetchInProgressRef.current) return;

    const fetchResult = async (retryCount = 0) => {
      const maxRetries = 5;
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);

      abortControllerRef.current = new AbortController();

      try {
        fetchInProgressRef.current = true;
        const response = await apiService.getResultById(resultId);

        if (!abortControllerRef.current?.signal.aborted) {
          if (response.success) {
            setResult(response.data);
            fetchInProgressRef.current = false;
          }
        }
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) return;

        if (err.response?.status === 404 && retryCount < maxRetries) {
          setTimeout(() => {
            if (!abortControllerRef.current?.signal.aborted) {
              fetchResult(retryCount + 1);
            }
          }, retryDelay);
        } else {
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

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      fetchInProgressRef.current = false;
    };
  }, [resultId, navigate]);

  // OCEAN trait definitions with minimalist design
  const oceanTraits = {
    openness: {
      name: 'Openness',
      subtitle: 'Creativity & Curiosity',
      icon: '🎨',
      description: 'Openness to experience emphasizes imagination and insight. It reflects your willingness to try new things, think creatively, and embrace novel ideas and experiences.',
      highTraits: ['Very creative', 'Open to trying new things', 'Focused on tackling new challenges', 'Happy to think about abstract concepts', 'Enjoys artistic experiences'],
      lowTraits: ['Dislikes change', 'Does not enjoy new things', 'Resists new ideas', 'Not very imaginative', 'Prefers routine and structure'],
      careerImplications: {
        high: 'Thrives in creative roles, research, innovation, and dynamic environments',
        low: 'Excels in structured roles, traditional industries, and routine-based work'
      }
    },
    conscientiousness: {
      name: 'Conscientiousness',
      subtitle: 'Organization & Discipline',
      icon: '📋',
      description: 'Conscientiousness is defined by high levels of thoughtfulness, good impulse control, and goal-directed behaviors. It reflects your tendency to be organized, responsible, and dependable.',
      highTraits: ['Spends time preparing', 'Finishes important tasks right away', 'Pays attention to detail', 'Enjoys having a set schedule', 'Strong work ethic'],
      lowTraits: ['Dislikes structure and schedules', 'Makes messes and doesn\'t take care of things', 'Procrastinates important tasks', 'Flexible and spontaneous', 'Comfortable with ambiguity'],
      careerImplications: {
        high: 'Suited for management, project coordination, and detail-oriented professions',
        low: 'Thrives in flexible, creative, and adaptive work environments'
      }
    },
    extraversion: {
      name: 'Extraversion',
      subtitle: 'Social Energy & Assertiveness',
      icon: '🗣️',
      description: 'Extraversion is characterized by excitability, sociability, talkativeness, and assertiveness. It indicates your preference for social interaction and drawing energy from external stimulation.',
      highTraits: ['Enjoys being the center of attention', 'Likes to start conversations', 'Enjoys meeting new people', 'Has a wide social circle', 'Feels energized when around other people'],
      lowTraits: ['Prefers solitude', 'Feels exhausted when having to socialize a lot', 'Finds it difficult to start conversations', 'Carefully thinks things through before speaking', 'Works well independently'],
      careerImplications: {
        high: 'Excels in sales, leadership, public speaking, and team-oriented roles',
        low: 'Thrives in research, writing, technical work, and independent roles'
      }
    },
    agreeableness: {
      name: 'Agreeableness',
      subtitle: 'Cooperation & Empathy',
      icon: '🤝',
      description: 'Agreeableness includes attributes such as trust, altruism, kindness, and affection. It reflects your tendency to be cooperative, trusting, and helpful in interactions with others.',
      highTraits: ['Has a great deal of interest in other people', 'Cares about others', 'Feels empathy and concern for other people', 'Enjoys helping others', 'Cooperative team player'],
      lowTraits: ['Takes little interest in others', 'Direct and honest communicator', 'Has little interest in other people\'s problems', 'Competitive nature', 'Independent thinker'],
      careerImplications: {
        high: 'Suited for counseling, healthcare, education, and service-oriented roles',
        low: 'Excels in competitive fields, negotiations, and leadership positions'
      }
    },
    neuroticism: {
      name: 'Neuroticism',
      subtitle: 'Emotional Sensitivity',
      icon: '🌊',
      description: 'Neuroticism is characterized by emotional instability and tendency to experience negative emotions. It measures your emotional stability and resilience to stress.',
      highTraits: ['Experiences a lot of stress', 'Worries about many different things', 'Gets upset easily', 'Experiences dramatic shifts in mood', 'Sensitive to criticism'],
      lowTraits: ['Emotionally stable', 'Deals well with stress', 'Rarely feels sad or depressed', 'Doesn\'t worry much', 'Resilient to setbacks'],
      careerImplications: {
        high: 'Benefits from supportive environments and stress management resources',
        low: 'Thrives in high-pressure, demanding, and unpredictable work environments'
      }
    }
  };

  // OCEAN explanation data
  const oceanExplanation = {
    title: "Model Big Five (OCEAN)",
    description: "Model Big Five atau OCEAN adalah kerangka kepribadian yang paling diterima secara luas dalam psikologi modern. Model ini dikembangkan melalui analisis faktor dari ribuan kata sifat yang menggambarkan kepribadian manusia.",
    developer: "Dikembangkan oleh Lewis Goldberg (1981) dan disempurnakan oleh Costa & McCrae (1992)",
    validity: "Telah divalidasi secara ilmiah melalui ribuan penelitian di berbagai budaya dan bahasa. Model ini digunakan secara luas oleh psikolog profesional, konselor karier, dan organisasi untuk assessment kepribadian.",
    purpose: "Mengukur lima dimensi luas kepribadian yang relatif stabil sepanjang hidup dan memprediksi perilaku, preferensi karier, dan kinerja dalam berbagai konteks.",
    dimensions: [
      { key: 'openness', name: 'Openness', description: 'Keterbukaan terhadap pengalaman baru' },
      { key: 'conscientiousness', name: 'Conscientiousness', description: 'Kecenderungan untuk terorganisir dan disiplin' },
      { key: 'extraversion', name: 'Extraversion', description: 'Orientasi energi sosial dan assertiveness' },
      { key: 'agreeableness', name: 'Agreeableness', description: 'Kecenderungan untuk kooperatif dan empatik' },
      { key: 'neuroticism', name: 'Neuroticism', description: 'Stabilitas emosional dan manajemen stres' }
    ]
  };

  // Navigation cards data
  const navigationCards = [
    {
      title: 'Career Interests',
      subtitle: 'RIASEC Assessment',
      description: 'Explore your career interests and work environment preferences',
      path: `/results/${resultId}/riasec`,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Character Strengths',
      subtitle: 'VIA-IS Assessment',
      description: 'Discover your core character strengths and values',
      path: `/results/${resultId}/via-is`,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Career Persona',
      subtitle: 'Integrated Profile',
      description: 'Your comprehensive career recommendations',
      path: `/results/${resultId}/persona`,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  // Prepare radar chart data
  const prepareRadarData = (oceanData) => {
    if (!oceanData) return [];

    return [
      {
        trait: 'Openness',
        value: oceanData.openness || 0, // Data already in 0-100 scale
        fullValue: oceanData.openness || 0
      },
      {
        trait: 'Conscientiousness',
        value: oceanData.conscientiousness || 0,
        fullValue: oceanData.conscientiousness || 0
      },
      {
        trait: 'Extraversion',
        value: oceanData.extraversion || 0,
        fullValue: oceanData.extraversion || 0
      },
      {
        trait: 'Agreeableness',
        value: oceanData.agreeableness || 0,
        fullValue: oceanData.agreeableness || 0
      },
      {
        trait: 'Neuroticism',
        value: oceanData.neuroticism || 0,
        fullValue: oceanData.neuroticism || 0
      }
    ];
  };

  const getScoreLevel = (score) => {
    // Adjusted thresholds based on typical OCEAN score distribution
    if (score >= 70) return { level: 'Very High', intensity: 'text-gray-900 font-semibold' };
    if (score >= 55) return { level: 'High', intensity: 'text-gray-800 font-medium' };
    if (score >= 40) return { level: 'Moderate', intensity: 'text-gray-700 font-medium' };
    if (score >= 25) return { level: 'Low', intensity: 'text-gray-600 font-medium' };
    return { level: 'Very Low', intensity: 'text-gray-500 font-medium' };
  };

  // Custom tooltip for radar chart
  const CustomRadarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const trait = oceanTraits[label.toLowerCase()];
      const scoreLevel = getScoreLevel(data.payload.fullValue);

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm"
        >
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">{trait?.icon}</span>
            <h4 className="font-semibold text-gray-900">{trait?.name}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">{trait?.subtitle}</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-lg font-bold text-blue-600">
              Skor: {data.payload.fullValue.toFixed(1)}
            </div>
            <span className={`text-sm font-medium ${scoreLevel.intensity}`}>
              ({scoreLevel.level})
            </span>
          </div>
          <p className="text-xs text-gray-500">{trait?.description}</p>
        </motion.div>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {!result && !error && (
          <EnhancedLoadingScreen
            title="Loading OCEAN Results..."
            subtitle="Analyzing your personality profile"
            skeletonCount={4}
            className="min-h-[600px]"
          />
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="text-gray-400 mr-3">⚠️</div>
              <div>
                <h3 className="text-gray-900 font-semibold">Unable to Load Results</h3>
                <p className="text-gray-600 text-sm mt-1">{error}</p>
                <div className="mt-4 space-x-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate(`/results/${resultId}`)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
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
              className="mb-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    OCEAN Personality Assessment
                  </h1>
                  <p className="text-gray-600 max-w-2xl">
                    The Big Five personality model reveals your core traits and behavioral tendencies across five key dimensions.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate(`/results/${resultId}`)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Dashboard
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-gray-900 rounded-full mr-2"></span>
                    Completed: {formatDate(result.created_at)}
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                    Big Five Model
                  </span>
                </div>
              </div>
            </motion.div>

            {/* OCEAN Explanation Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">🧭</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{oceanExplanation.title}</h2>
                      <p className="text-blue-700 font-medium">The Big Five Personality Model</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">{oceanExplanation.description}</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-2">👨‍🔬 Pengembang</h4>
                      <p className="text-sm text-gray-700">{oceanExplanation.developer}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-2">✅ Validitas Ilmiah</h4>
                      <p className="text-sm text-gray-700">{oceanExplanation.validity}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2">🎯 Tujuan Assessment</h4>
                    <p className="text-sm text-gray-700">{oceanExplanation.purpose}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Radar Chart Visualization */}
            {result.assessment_data?.ocean && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-8"
              >
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Profil Kepribadian Anda</h3>
                    <p className="text-gray-600">Visualisasi lima dimensi kepribadian OCEAN</p>
                  </div>

                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={prepareRadarData(result.assessment_data.ocean)}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis
                          dataKey="trait"
                          tick={{ fontSize: 12, fill: '#374151' }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          tickCount={6}
                        />
                        <Radar
                          name="OCEAN Score"
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Tooltip content={<CustomRadarTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
                    {prepareRadarData(result.assessment_data.ocean).map((item, index) => {
                      const scoreLevel = getScoreLevel(item.fullValue);
                      return (
                        <motion.div
                          key={item.trait}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                          className="text-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="text-lg font-bold text-blue-600 mb-1">
                            {item.fullValue.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-600 font-medium mb-1">{item.trait}</div>
                          <div className={`text-xs ${scoreLevel.intensity}`}>
                            {scoreLevel.level}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Main Grid Layout */}
            {result.assessment_data?.ocean && (
              <div className="space-y-6">
                {/* First 3 cards in a row */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.entries(result.assessment_data.ocean).slice(0, 3).map(([traitKey, score], index) => {
                    const trait = oceanTraits[traitKey];
                    if (!trait) return null;

                    const scoreInfo = getScoreLevel(score);
                    const isHigh = score >= 50; // Adjusted for 0-100 scale
                    const relevantTraits = isHigh ? trait.highTraits : trait.lowTraits;

                    return (
                      <motion.div
                        key={traitKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                      {/* Header */}
                      <div className="bg-gray-50 border-b border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{trait.icon}</span>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{trait.name}</h3>
                              <p className="text-sm text-gray-600">{trait.subtitle}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{score.toFixed(1)}</div>
                            <div className={`text-sm ${scoreInfo.intensity}`}>{scoreInfo.level}</div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Description */}
                        <p className="text-gray-700 mb-4 leading-relaxed">{trait.description}</p>

                        {/* Progress Bar */}
                        <div className="mb-6">
                          <div className="bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-gray-900 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(score, 100)}%` }}
                              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            />
                          </div>
                        </div>

                        {/* Characteristics */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            {isHigh ? 'Your High Score Indicates:' : 'Your Low Score Indicates:'}
                          </h4>
                          <div className="space-y-2">
                            {relevantTraits.slice(0, 4).map((characteristic, idx) => (
                              <div key={idx} className="flex items-start text-sm text-gray-700">
                                <span className="text-gray-400 mr-2 mt-0.5">•</span>
                                {characteristic}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Career Implications */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <h4 className="font-semibold text-gray-900 mb-2">Career Implications</h4>
                          <p className="text-sm text-gray-700">
                            {isHigh ? trait.careerImplications.high : trait.careerImplications.low}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>

                {/* Last 2 cards taking full width */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(result.assessment_data.ocean).slice(3, 5).map(([traitKey, score], index) => {
                    const trait = oceanTraits[traitKey];
                    if (!trait) return null;

                    const scoreInfo = getScoreLevel(score);
                    const isHigh = score >= 50; // Adjusted for 0-100 scale
                    const relevantTraits = isHigh ? trait.highTraits : trait.lowTraits;

                    return (
                      <motion.div
                        key={traitKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index + 3) * 0.1 }}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Header */}
                        <div className="bg-gray-50 border-b border-gray-200 p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{trait.icon}</span>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{trait.name}</h3>
                                <p className="text-sm text-gray-600">{trait.subtitle}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">{score.toFixed(1)}</div>
                              <div className={`text-sm ${scoreInfo.intensity}`}>{scoreInfo.level}</div>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          {/* Description */}
                          <p className="text-gray-700 mb-4 leading-relaxed">{trait.description}</p>

                          {/* Progress Bar */}
                          <div className="mb-6">
                            <div className="bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="bg-gray-900 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(score, 100)}%` }}
                                transition={{ duration: 1, delay: 0.5 + (index + 3) * 0.1 }}
                              />
                            </div>
                          </div>

                          {/* Characteristics */}
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">
                              {isHigh ? 'Your High Score Indicates:' : 'Your Low Score Indicates:'}
                            </h4>
                            <div className="space-y-2">
                              {relevantTraits.slice(0, 4).map((characteristic, idx) => (
                                <div key={idx} className="flex items-start text-sm text-gray-700">
                                  <span className="text-gray-400 mr-2 mt-0.5">•</span>
                                  {characteristic}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Career Implications */}
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-2">Career Implications</h4>
                            <p className="text-sm text-gray-700">
                              {isHigh ? trait.careerImplications.high : trait.careerImplications.low}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation to Other Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="mb-12"
            >
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 mb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <span className="text-2xl">🧭</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Explore Your Complete Profile
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                    Continue your journey by exploring other aspects of your assessment results.
                    Each assessment provides unique insights into different facets of your personality and career potential.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {navigationCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.1 + index * 0.1 }}
                    whileHover={{
                      y: -4,
                      transition: { duration: 0.15 }
                    }}
                    className="group cursor-pointer"
                    onClick={() => navigate(card.path)}
                  >
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 h-full">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-end mb-4">
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

                        <div className="flex-grow">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-3 font-semibold uppercase tracking-wide">
                            {card.subtitle}
                          </p>
                          <p className="text-gray-600 leading-relaxed">
                            {card.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                            <span>Explore Assessment</span>
                            <motion.svg
                              className="w-4 h-4 ml-1"
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

export default ResultOcean;