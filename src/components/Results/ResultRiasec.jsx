import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import apiService from '../../services/apiService';
import EnhancedLoadingScreen from '../UI/EnhancedLoadingScreen';
import useScrollToTop from '../../hooks/useScrollToTop';

const ResultRiasec = () => {
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

  // RIASEC explanation data
  const riasecExplanation = {
    title: "Model RIASEC",
    description: "Model RIASEC adalah kerangka minat karier yang dikembangkan oleh psikolog John Holland. Model ini mengidentifikasi enam tipe kepribadian yang berkorespondensi dengan lingkungan kerja dan jalur karier yang berbeda.",
    developer: "Dikembangkan oleh psikolog John Holland (1959) dan disempurnakan melalui penelitian selama puluhan tahun",
    validity: "Telah divalidasi secara ekstensif di berbagai budaya dan digunakan di seluruh dunia untuk konseling karier dan assessment. Model ini menjadi standar dalam bidang psikologi karier.",
    purpose: "Mengidentifikasi minat karier dan lingkungan kerja yang selaras dengan kepribadian Anda, membantu menemukan kepuasan, keterlibatan, dan kesuksesan yang lebih besar dalam pilihan karier.",
    dimensions: [
      { key: 'realistic', name: 'Realistic', description: 'Minat pada pekerjaan praktis dan hands-on' },
      { key: 'investigative', name: 'Investigative', description: 'Minat pada penelitian dan pemecahan masalah' },
      { key: 'artistic', name: 'Artistic', description: 'Minat pada kreativitas dan ekspresi diri' },
      { key: 'social', name: 'Social', description: 'Minat pada membantu dan bekerja dengan orang lain' },
      { key: 'enterprising', name: 'Enterprising', description: 'Minat pada kepemimpinan dan persuasi' },
      { key: 'conventional', name: 'Conventional', description: 'Minat pada organisasi dan prosedur yang terstruktur' }
    ]
  };

  // Prepare radar chart data
  const prepareRadarData = (riasecData) => {
    if (!riasecData) return [];

    return [
      {
        trait: 'Realistic',
        value: riasecData.realistic || 0,
        fullValue: riasecData.realistic || 0
      },
      {
        trait: 'Investigative',
        value: riasecData.investigative || 0,
        fullValue: riasecData.investigative || 0
      },
      {
        trait: 'Artistic',
        value: riasecData.artistic || 0,
        fullValue: riasecData.artistic || 0
      },
      {
        trait: 'Social',
        value: riasecData.social || 0,
        fullValue: riasecData.social || 0
      },
      {
        trait: 'Enterprising',
        value: riasecData.enterprising || 0,
        fullValue: riasecData.enterprising || 0
      },
      {
        trait: 'Conventional',
        value: riasecData.conventional || 0,
        fullValue: riasecData.conventional || 0
      }
    ];
  };

  const getScoreLevel = (score) => {
    // 5-level scoring system consistent with OCEAN
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
      const trait = riasecTraits[label.toLowerCase()];
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



  // RIASEC traits data structure similar to OCEAN
  const riasecTraits = {
    'realistic': {
      icon: '🔧',
      name: 'Realistic',
      subtitle: 'The Doer',
      description: 'Prefer hands-on, practical work with tools, machines, or animals. Value concrete results and physical activities.',
      highTraits: [
        'Enjoy working with your hands and building things',
        'Prefer practical, concrete tasks over abstract concepts',
        'Like working outdoors or with machinery',
        'Value efficiency and getting tangible results',
        'Comfortable with physical challenges and manual work'
      ],
      lowTraits: [
        'Prefer working with ideas rather than physical objects',
        'More comfortable in office or indoor environments',
        'Enjoy abstract thinking and conceptual work',
        'Less interested in hands-on technical tasks',
        'Prefer collaborative and people-oriented activities'
      ],
      careerImplications: {
        high: 'You thrive in hands-on careers involving building, fixing, or creating tangible products. Consider engineering, skilled trades, or technical fields.',
        low: 'You prefer careers involving ideas, people, or abstract concepts rather than physical manipulation of objects or tools.'
      }
    },
    'investigative': {
      icon: '🔬',
      name: 'Investigative',
      subtitle: 'The Thinker',
      description: 'Enjoy analyzing, researching, and solving complex problems. Prefer intellectual challenges and scientific thinking.',
      highTraits: [
        'Love solving complex problems and puzzles',
        'Enjoy research and analytical thinking',
        'Prefer working independently on intellectual tasks',
        'Value accuracy and scientific methods',
        'Curious about how things work and why'
      ],
      lowTraits: [
        'Prefer practical action over extensive analysis',
        'More interested in people and relationships',
        'Like structured, routine tasks with clear guidelines',
        'Prefer collaborative work over independent research',
        'Focus on immediate results rather than long-term investigation'
      ],
      careerImplications: {
        high: 'You excel in research-oriented careers requiring analytical thinking and problem-solving. Consider science, research, or technical analysis roles.',
        low: 'You prefer careers with clear procedures and immediate applications rather than extensive research or theoretical work.'
      }
    },
    'artistic': {
      icon: '🎨',
      name: 'Artistic',
      subtitle: 'The Creator',
      description: 'Value creativity, self-expression, and aesthetic experiences. Prefer unstructured environments and original work.',
      highTraits: [
        'Highly creative and value self-expression',
        'Enjoy working in unstructured, flexible environments',
        'Appreciate beauty and aesthetic experiences',
        'Prefer original, innovative approaches to problems',
        'Value independence and creative freedom'
      ],
      lowTraits: [
        'Prefer structured, organized work environments',
        'More comfortable following established procedures',
        'Value practical results over creative expression',
        'Like clear guidelines and systematic approaches',
        'Focus on efficiency rather than innovation'
      ],
      careerImplications: {
        high: 'You thrive in creative fields that allow self-expression and innovation. Consider arts, design, writing, or creative industries.',
        low: 'You prefer structured careers with clear procedures and practical outcomes rather than highly creative or artistic work.'
      }
    },
    'social': {
      icon: '🤝',
      name: 'Social',
      subtitle: 'The Helper',
      description: 'Enjoy helping, teaching, and working with people. Value cooperation, understanding, and making a positive impact.',
      highTraits: [
        'Genuinely enjoy helping and supporting others',
        'Excellent interpersonal and communication skills',
        'Value cooperation and teamwork',
        'Motivated by making a positive impact on people',
        'Comfortable in people-centered environments'
      ],
      lowTraits: [
        'Prefer working with data, objects, or ideas',
        'More comfortable working independently',
        'Less interested in counseling or teaching others',
        'Prefer technical or analytical tasks',
        'Value efficiency over interpersonal harmony'
      ],
      careerImplications: {
        high: 'You excel in people-oriented careers focused on helping, teaching, or supporting others. Consider education, healthcare, or social services.',
        low: 'You prefer careers involving technical skills, data analysis, or independent work rather than extensive interpersonal interaction.'
      }
    },
    'enterprising': {
      icon: '📈',
      name: 'Enterprising',
      subtitle: 'The Persuader',
      description: 'Like leading, persuading, and managing others. Value achievement, competition, and business success.',
      highTraits: [
        'Natural leader who enjoys taking charge',
        'Comfortable with competition and achievement',
        'Skilled at persuading and influencing others',
        'Value business success and financial rewards',
        'Enjoy taking risks and pursuing opportunities'
      ],
      lowTraits: [
        'Prefer supportive rather than leadership roles',
        'More comfortable with cooperation than competition',
        'Less interested in sales or persuasion activities',
        'Value stability over risk-taking',
        'Prefer following established procedures'
      ],
      careerImplications: {
        high: 'You thrive in leadership and business-oriented careers involving persuasion and achievement. Consider management, sales, or entrepreneurship.',
        low: 'You prefer supportive roles with clear procedures rather than high-pressure leadership or competitive business environments.'
      }
    },
    'conventional': {
      icon: '📊',
      name: 'Conventional',
      subtitle: 'The Organizer',
      description: 'Prefer organized, structured work with clear procedures. Value accuracy, efficiency, and systematic approaches.',
      highTraits: [
        'Highly organized and detail-oriented',
        'Prefer clear procedures and systematic approaches',
        'Value accuracy and precision in work',
        'Comfortable with routine and structured tasks',
        'Excellent at managing data and information'
      ],
      lowTraits: [
        'Prefer flexible, unstructured work environments',
        'More interested in creative or innovative approaches',
        'Less comfortable with routine, repetitive tasks',
        'Value variety and change over consistency',
        'Prefer big-picture thinking over detailed procedures'
      ],
      careerImplications: {
        high: 'You excel in organized, detail-oriented careers with clear procedures. Consider administration, finance, or data management roles.',
        low: 'You prefer dynamic, flexible careers that allow creativity and variety rather than highly structured or routine work.'
      }
    }
  };



  // Navigation cards data
  const navigationCards = [
    {
      title: 'Character Strengths',
      subtitle: 'VIA-IS Assessment',
      description: 'Explore your core character strengths and values',
      path: `/results/${resultId}/via-is`,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Personality Traits',
      subtitle: 'OCEAN Assessment',
      description: 'Understand your personality dimensions',
      path: `/results/${resultId}/ocean`,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Career Persona',
      subtitle: 'Integrated Profile',
      description: 'Your comprehensive career recommendations',
      path: `/results/${resultId}/persona`,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {!result && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedLoadingScreen
              title="Loading RIASEC Results..."
              subtitle="Fetching your career interests analysis"
              skeletonCount={4}
              className="min-h-[600px]"
            />
          </motion.div>
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

        {/* Content State */}
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
                    RIASEC Career Interests Assessment
                  </h1>
                  <p className="text-gray-600 max-w-2xl">
                    Discover your natural career interests and work environments that align with your personality.
                    The RIASEC model identifies six key interest areas that guide career satisfaction and success.
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
                    RIASEC Model
                  </span>
                </div>
              </div>
            </motion.div>

            {/* RIASEC Explanation Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">🎯</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{riasecExplanation.title}</h2>
                      <p className="text-blue-700 font-medium">The RIASEC Career Interest Model</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">{riasecExplanation.description}</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-2">👨‍🔬 Pengembang</h4>
                      <p className="text-sm text-gray-700">{riasecExplanation.developer}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-2">✅ Validitas Ilmiah</h4>
                      <p className="text-sm text-gray-700">{riasecExplanation.validity}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2">🎯 Tujuan Assessment</h4>
                    <p className="text-sm text-gray-700">{riasecExplanation.purpose}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Radar Chart Visualization */}
            {result.assessment_data?.riasec && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-8"
              >
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Profil Minat Karier Anda</h3>
                    <p className="text-gray-600">Visualisasi enam dimensi minat karier RIASEC</p>
                  </div>

                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={prepareRadarData(result.assessment_data.riasec)}>
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
                          name="RIASEC Score"
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

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {prepareRadarData(result.assessment_data.riasec).map((item, index) => {
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

            {/* Career Interests Analysis */}
            {result.assessment_data?.riasec && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-8"
              >
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Your RIASEC Interest Profile</h3>
                    <p className="text-gray-600">Detailed breakdown of your career interest areas</p>
                  </div>

                  {/* RIASEC Interest Cards - 3 columns 2 rows layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(result.assessment_data.riasec).map(([type, score], index) => {
                      const trait = riasecTraits[type];
                      if (!trait) return null;

                      const scoreInfo = getScoreLevel(score);
                      const isHigh = score >= 50; // Adjusted threshold for RIASEC 0-100 scale
                      const relevantTraits = isHigh ? trait.highTraits : trait.lowTraits;

                      return (
                        <motion.div
                          key={type}
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
                </div>
              </motion.div>
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
                    <span className="text-2xl">🎯</span>
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

export default ResultRiasec;