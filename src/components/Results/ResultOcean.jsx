import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import apiService from '../../services/apiService';
import EnhancedLoadingScreen from '../UI/EnhancedLoadingScreen';
import useScrollToTop from '../../hooks/useScrollToTop';
import AssessmentRelation from './AssessmentRelation';

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
      description: 'Openness to experience mencerminkan keterbukaan terhadap pengalaman baru, kreativitas, dan kemauan untuk mencoba serta menerima ide-ide inovatif.',
      highTraits: [
        'Memiliki kreativitas tinggi dan terbuka terhadap pengalaman baru.',
        'Menyukai tantangan serta ide-ide inovatif.',
        'Berorientasi pada pemecahan masalah yang kompleks.',
        'Mengapresiasi konsep abstrak dan pengalaman artistik.'
      ],
      lowTraits: [
        'Kurang menyukai perubahan dan hal-hal baru.',
        'Cenderung menolak ide-ide yang tidak familiar.',
        'Kurang imajinatif dan lebih memilih rutinitas.',
        'Lebih nyaman dengan struktur dan prosedur yang jelas.'
      ],
      careerImplications: {
        high: 'Sangat sesuai untuk peran yang menuntut kreativitas, penelitian, inovasi, dan lingkungan kerja yang dinamis.',
        low: 'Lebih cocok untuk pekerjaan yang terstruktur, industri tradisional, dan tugas yang bersifat rutin.'
      }
    },
    conscientiousness: {
      name: 'Conscientiousness',
      subtitle: 'Organization & Discipline',
      icon: '📋',
      description: 'Conscientiousness ditandai dengan tingkat kehati-hatian yang tinggi, pengendalian diri yang baik, dan perilaku yang terarah pada tujuan. Karakteristik ini mencerminkan kecenderungan untuk terorganisir, bertanggung jawab, dan dapat diandalkan.',
      highTraits: [
        'Selalu mempersiapkan segala sesuatu dengan baik.',
        'Menyelesaikan tugas penting secara tepat waktu.',
        'Memiliki perhatian tinggi terhadap detail.',
        'Menyukai jadwal yang teratur dan konsisten.'
      ],
      lowTraits: [
        'Kurang menyukai struktur dan jadwal yang ketat.',
        'Cenderung menunda tugas-tugas penting.',
        'Lebih fleksibel dan spontan dalam bekerja.',
        'Merasa nyaman dalam situasi yang ambigu.'
      ],
      careerImplications: {
        high: 'Sangat sesuai untuk peran manajemen, koordinasi proyek, dan profesi yang membutuhkan ketelitian.',
        low: 'Lebih cocok untuk lingkungan kerja yang fleksibel, kreatif, dan adaptif.'
      }
    },
    extraversion: {
      name: 'Extraversion',
      subtitle: 'Social Energy & Assertiveness',
      icon: '🗣️',
      description: 'Extraversion ditandai dengan sifat mudah bersemangat, suka bersosialisasi, komunikatif, dan asertif. Karakteristik ini menunjukkan preferensi terhadap interaksi sosial dan memperoleh energi dari stimulasi eksternal.',
      highTraits: [
        'Menyukai perhatian dan interaksi sosial.',
        'Aktif memulai percakapan dan membangun relasi baru.',
        'Memiliki jejaring sosial yang luas.',
        'Merasa berenergi saat berada di lingkungan sosial.'
      ],
      lowTraits: [
        'Lebih menyukai kesendirian dan waktu pribadi.',
        'Mudah merasa lelah jika harus banyak bersosialisasi.',
        'Cenderung berpikir matang sebelum berbicara.',
        'Mampu bekerja secara mandiri dengan baik.'
      ],
      careerImplications: {
        high: 'Sangat sesuai untuk bidang penjualan, kepemimpinan, public speaking, dan peran yang berorientasi pada tim.',
        low: 'Lebih cocok untuk penelitian, penulisan, pekerjaan teknis, dan peran yang bersifat independen.'
      }
    },
    agreeableness: {
      name: 'Agreeableness',
      subtitle: 'Cooperation & Empathy',
      icon: '🤝',
      description: 'Agreeableness mencakup sifat dapat dipercaya, altruisme, kebaikan hati, dan kasih sayang. Karakteristik ini mencerminkan kecenderungan untuk kooperatif, mudah percaya, dan membantu dalam berinteraksi dengan orang lain.',
      highTraits: [
        'Memiliki ketertarikan tinggi terhadap orang lain.',
        'Peduli dan empati terhadap sesama.',
        'Senang membantu dan bekerja sama dalam tim.',
        'Mampu membangun hubungan yang harmonis.'
      ],
      lowTraits: [
        'Kurang tertarik pada permasalahan orang lain.',
        'Berkomunikasi secara langsung dan jujur.',
        'Memiliki sifat kompetitif dan mandiri.',
        'Lebih mengutamakan pemikiran independen.'
      ],
      careerImplications: {
        high: 'Sangat sesuai untuk bidang konseling, layanan kesehatan, pendidikan, dan peran yang berorientasi pada pelayanan.',
        low: 'Lebih cocok untuk bidang yang kompetitif, negosiasi, dan posisi kepemimpinan.'
      }
    },
    neuroticism: {
      name: 'Neuroticism',
      subtitle: 'Emotional Sensitivity',
      icon: '🌊',
      description: 'Neuroticism ditandai dengan ketidakstabilan emosi dan kecenderungan untuk mengalami emosi negatif. Karakteristik ini mengukur stabilitas emosional dan ketahanan terhadap stres.',
      highTraits: [
        'Sering mengalami stres dan kekhawatiran.',
        'Mudah merasa cemas atau tertekan.',
        'Perubahan suasana hati yang cukup signifikan.',
        'Sensitif terhadap kritik dan tekanan.'
      ],
      lowTraits: [
        'Stabil secara emosional dan jarang merasa cemas.',
        'Mampu mengelola stres dengan baik.',
        'Jarang merasa sedih atau tertekan.',
        'Tangguh dalam menghadapi tantangan.'
      ],
      careerImplications: {
        high: 'Sebaiknya bekerja di lingkungan yang suportif dan memiliki sumber daya manajemen stres.',
        low: 'Sangat sesuai untuk lingkungan kerja yang penuh tekanan, menuntut, dan tidak terduga.'
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
      title: 'Minat Karier',
      subtitle: 'RIASEC Assessment',
      description: 'Jelajahi minat karier dan preferensi lingkungan kerja Anda.',
      path: `/results/${resultId}/riasec`,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Kekuatan Karakter',
      subtitle: 'VIA-IS Assessment',
      description: 'Temukan kekuatan inti dan nilai-nilai karakter Anda.',
      path: `/results/${resultId}/via-is`,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Persona Karier',
      subtitle: 'Integrated Profile',
      description: 'Rekomendasi karier komprehensif berdasarkan profil Anda.',
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
          className="bg-white p-4 rounded shadow-lg border border-gray-200 max-w-sm"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    OCEAN Personality Assessment
                  </h1>
                  <p className="text-gray-600 max-w-2xl text-sm sm:text-base">
                    The Big Five personality model reveals your core traits and behavioral tendencies across five key dimensions.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => navigate(`/results/${resultId}`)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-sm sm:text-base"
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
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium self-start sm:self-auto">
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
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl sm:text-3xl mr-3">🧭</span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{oceanExplanation.title}</h2>
                      <p className="text-blue-700 font-medium text-sm sm:text-base">The Big Five Personality Model</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">{oceanExplanation.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 sm:p-4 rounded border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">👨‍🔬 Pengembang</h4>
                      <p className="text-xs sm:text-sm text-gray-700">{oceanExplanation.developer}</p>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">✅ Validitas Ilmiah</h4>
                      <p className="text-xs sm:text-sm text-gray-700">{oceanExplanation.validity}</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 sm:p-4 rounded border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">🎯 Tujuan Assessment</h4>
                    <p className="text-xs sm:text-sm text-gray-700">{oceanExplanation.purpose}</p>
                  </div>
                </div>
              </div>
            </motion.div>



            {/* Radar Chart Visualization */}
            {result.assessment_data?.ocean && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-8"
              >
                <div className="bg-white rounded border border-gray-200 shadow-sm p-4 sm:p-6">
                  <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Profil Kepribadian Anda</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Visualisasi lima dimensi kepribadian OCEAN</p>
                  </div>

                  <div className="h-64 sm:h-80 lg:h-96">
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

                  <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {prepareRadarData(result.assessment_data.ocean).map((item, index) => {
                      const scoreLevel = getScoreLevel(item.fullValue);
                      return (
                        <motion.div
                          key={item.trait}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                          className="text-center p-2 sm:p-3 bg-gray-50 rounded"
                        >
                          <div className="text-sm sm:text-base md:text-lg font-bold text-blue-600 mb-1">
                            {item.fullValue.toFixed(1)}
                          </div>
                          <div className="text-xs sm:text-xs text-gray-600 font-medium mb-1 leading-tight">{item.trait}</div>
                          <div className={`text-xs ${scoreLevel.intensity} leading-tight`}>
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
              <div className="space-y-4 sm:space-y-6">
                {/* First 3 cards in a row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
                        className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
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
                        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">{trait.description}</p>

                        {/* Progress Bar */}
                        <div className="mb-4 sm:mb-6">
                          <div className="bg-gray-200 rounded-sm h-2">
                            <motion.div
                              className="bg-gray-900 h-2 rounded-sm"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(score, 100)}%` }}
                              transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                            />
                          </div>
                        </div>

                        {/* Characteristics */}
                        <div className="mb-4 sm:mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                            {isHigh ? 'Your High Score Indicates:' : 'Your Low Score Indicates:'}
                          </h4>
                          <div className="space-y-2">
                            {relevantTraits.slice(0, 4).map((characteristic, idx) => (
                              <div key={idx} className="flex items-start text-xs sm:text-sm text-gray-700">
                                <span className="text-gray-400 mr-2 mt-0.5">•</span>
                                {characteristic}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Career Implications */}
                        <div className="bg-gray-50 rounded p-3 sm:p-4 border border-gray-100">
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Career Implications</h4>
                          <p className="text-xs sm:text-sm text-gray-700">
                            {isHigh ? trait.careerImplications.high : trait.careerImplications.low}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>

                {/* Last 2 cards taking full width */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                        className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Header */}
                        <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-xl sm:text-2xl mr-3">{trait.icon}</span>
                              <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{trait.name}</h3>
                                <p className="text-xs sm:text-sm text-gray-600">{trait.subtitle}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl sm:text-2xl font-bold text-gray-900">{score.toFixed(1)}</div>
                              <div className={`text-xs sm:text-sm ${scoreInfo.intensity}`}>{scoreInfo.level}</div>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6">
                          {/* Description */}
                          <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">{trait.description}</p>

                          {/* Progress Bar */}
                          <div className="mb-4 sm:mb-6">
                            <div className="bg-gray-200 rounded-sm h-2">
                              <motion.div
                                className="bg-gray-900 h-2 rounded-sm"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(score, 100)}%` }}
                                transition={{ duration: 1, delay: 0.7 + (index + 3) * 0.1 }}
                              />
                            </div>
                          </div>

                          {/* Characteristics */}
                          <div className="mb-4 sm:mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                              {isHigh ? 'Your High Score Indicates:' : 'Your Low Score Indicates:'}
                            </h4>
                            <div className="space-y-2">
                              {relevantTraits.slice(0, 4).map((characteristic, idx) => (
                                <div key={idx} className="flex items-start text-xs sm:text-sm text-gray-700">
                                  <span className="text-gray-400 mr-2 mt-0.5">•</span>
                                  {characteristic}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Career Implications */}
                          <div className="bg-gray-50 rounded p-3 sm:p-4 border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Career Implications</h4>
                            <p className="text-xs sm:text-sm text-gray-700">
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

            {/* OCEAN Accuracy and Validity Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16 mb-12"
            >
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                      <span className="text-white text-lg sm:text-xl font-semibold">✓</span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Akurasi dan Validitas Assessment</h2>
                      <p className="text-gray-600 font-medium text-sm sm:text-base">Mengapa OCEAN Sangat Tepat untuk Assessment Kepribadian</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-sm sm:text-base">
                        <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xs sm:text-sm">1</span>
                        </span>
                        Standar Emas Psikologi
                      </h4>
                      <ul className="text-xs sm:text-sm text-gray-700 space-y-3">
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Model kepribadian paling diterima dalam psikologi modern</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Validasi lintas budaya di 50+ negara dengan konsistensi tinggi</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Stabilitas temporal tinggi (r &gt; 0.75) sepanjang hidup dewasa</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm">2</span>
                        </span>
                        Keunggulan Metodologi
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-3">
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Berdasarkan analisis faktor empiris dari ribuan trait</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Prediksi akurat untuk perilaku kerja dan kepuasan hidup</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Tidak bias terhadap budaya, gender, atau usia</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">3</span>
                      </span>
                      Hubungan dengan Assessment Lain
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Dengan VIA IS (Kekuatan Karakter):</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">Trait kepribadian mempengaruhi ekspresi karakter. Openness mendukung "Creativity", Conscientiousness memperkuat "Perseverance", dan Agreeableness berkorelasi dengan "Kindness".</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Dengan RIASEC (Minat Karier):</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">Kepribadian membentuk preferensi lingkungan kerja. Extraversion tinggi cocok dengan Social/Enterprising, Openness dengan Artistic/Investigative, dan Conscientiousness dengan Conventional.</p>
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
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mb-12"
            >
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-md p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-md mb-4">
                    <span className="text-xl sm:text-2xl">🧭</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-3 tracking-tight">
                    Jelajahi Profil Lengkap Anda
                  </h2>
                  <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
                    Lanjutkan perjalanan Anda dengan mengeksplorasi aspek lain dari hasil assessment. Setiap assessment memberikan wawasan unik tentang berbagai sisi kepribadian dan potensi karier Anda.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
                {navigationCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
                    whileHover={{
                      y: -4,
                      transition: { duration: 0.15 }
                    }}
                    className="group cursor-pointer"
                    onClick={() => navigate(card.path)}
                  >
                    <div className="bg-white rounded-md p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 h-full">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-end mb-4">
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
                          <p className="text-xs sm:text-sm text-slate-500 mb-3 font-medium uppercase tracking-wide">
                            {card.subtitle}
                          </p>
                          <p className="text-slate-600 leading-relaxed font-normal text-sm sm:text-base">
                            {card.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
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

export default ResultOcean;