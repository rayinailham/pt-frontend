import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import apiService from '../../services/apiService';
import EnhancedLoadingScreen from '../UI/EnhancedLoadingScreen';
import useScrollToTop from '../../hooks/useScrollToTop';
import AssessmentRelation from './AssessmentRelation';

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



  // RIASEC traits data structure similar to OCEAN
  const riasecTraits = {
    'realistic': {
      icon: '🔧',
      name: 'Realistic',
      subtitle: 'The Doer',
      description: 'Menyukai pekerjaan langsung dan praktis dengan alat, mesin, atau hewan. Mengutamakan hasil nyata dan aktivitas fisik.',
      highTraits: [
        'Memiliki ketertarikan tinggi terhadap pekerjaan yang bersifat praktis dan langsung.',
        'Lebih menyukai tugas-tugas konkret daripada konsep yang abstrak.',
        'Merasa nyaman bekerja di luar ruangan atau dengan mesin.',
        'Mengutamakan efisiensi dan hasil yang nyata.',
        'Mampu menghadapi tantangan fisik dan pekerjaan manual.'
      ],
      lowTraits: [
        'Lebih memilih bekerja dengan ide atau konsep daripada objek fisik.',
        'Merasa lebih nyaman di lingkungan kantor atau dalam ruangan.',
        'Menyukai pemikiran abstrak dan pekerjaan konseptual.',
        'Kurang berminat pada tugas teknis yang bersifat langsung.',
        'Lebih menyukai aktivitas kolaboratif dan berorientasi pada manusia.'
      ],
      careerImplications: {
        high: 'Cocok untuk berkarier di bidang yang melibatkan aktivitas praktis, pembangunan, atau perakitan produk nyata, seperti teknik, pekerjaan terampil, atau bidang teknis.',
        low: 'Lebih sesuai untuk bidang yang berfokus pada ide, interaksi manusia, atau konsep abstrak daripada manipulasi fisik terhadap objek atau alat.'
      }
    },
    'investigative': {
      icon: '🔬',
      name: 'Investigative',
      subtitle: 'The Thinker',
      description: 'Senang menganalisis, meneliti, dan memecahkan masalah kompleks. Lebih menyukai tantangan intelektual dan pola pikir ilmiah.',
      highTraits: [
        'Memiliki minat besar dalam memecahkan masalah kompleks dan teka-teki.',
        'Menyukai penelitian serta berpikir secara analitis.',
        'Lebih memilih bekerja secara mandiri dalam tugas-tugas intelektual.',
        'Mengutamakan ketelitian dan metode ilmiah.',
        'Memiliki rasa ingin tahu yang tinggi terhadap cara kerja sesuatu.'
      ],
      lowTraits: [
        'Lebih menyukai tindakan praktis daripada analisis mendalam.',
        'Lebih tertarik pada hubungan sosial dan interaksi dengan orang lain.',
        'Menyukai tugas rutin yang terstruktur dengan panduan yang jelas.',
        'Lebih memilih kerja kolaboratif daripada penelitian mandiri.',
        'Fokus pada hasil langsung daripada penyelidikan jangka panjang.'
      ],
      careerImplications: {
        high: 'Sangat sesuai untuk berkarier di bidang penelitian, analisis, atau sains yang membutuhkan pemikiran analitis dan pemecahan masalah.',
        low: 'Lebih cocok untuk pekerjaan dengan prosedur yang jelas dan aplikasi langsung daripada penelitian atau pekerjaan teoretis yang mendalam.'
      }
    },
    'artistic': {
      icon: '🎨',
      name: 'Artistic',
      subtitle: 'The Creator',
      description: 'Menghargai kreativitas, ekspresi diri, dan pengalaman estetika. Lebih menyukai lingkungan yang tidak terstruktur dan karya orisinal.',
      highTraits: [
        'Memiliki kreativitas tinggi dan menghargai ekspresi diri.',
        'Menyukai lingkungan kerja yang fleksibel dan tidak terstruktur.',
        'Mengapresiasi keindahan dan pengalaman estetika.',
        'Lebih memilih pendekatan orisinal dan inovatif dalam menyelesaikan masalah.',
        'Mengutamakan kemandirian dan kebebasan berkreasi.'
      ],
      lowTraits: [
        'Lebih menyukai lingkungan kerja yang terstruktur dan terorganisir.',
        'Merasa lebih nyaman mengikuti prosedur yang telah ditetapkan.',
        'Mengutamakan hasil yang praktis daripada ekspresi kreatif.',
        'Menyukai panduan yang jelas dan pendekatan yang sistematis.',
        'Lebih fokus pada efisiensi daripada inovasi.'
      ],
      careerImplications: {
        high: 'Sangat cocok untuk berkarier di bidang kreatif yang memberikan ruang untuk ekspresi diri dan inovasi, seperti seni, desain, penulisan, atau industri kreatif.',
        low: 'Lebih sesuai untuk pekerjaan yang terstruktur dengan prosedur yang jelas dan hasil yang praktis daripada pekerjaan yang sangat kreatif atau artistik.'
      }
    },
    'social': {
      icon: '🤝',
      name: 'Social',
      subtitle: 'The Helper',
      description: 'Senang membantu, mengajar, dan bekerja dengan orang lain. Mengutamakan kerja sama, pemahaman, dan memberikan dampak positif.',
      highTraits: [
        'Memiliki kepedulian tinggi untuk membantu dan mendukung orang lain.',
        'Mampu berkomunikasi dan berinteraksi dengan baik.',
        'Mengutamakan kerja sama dan kolaborasi dalam tim.',
        'Termotivasi untuk memberikan dampak positif bagi sesama.',
        'Merasa nyaman di lingkungan yang berfokus pada interaksi manusia.'
      ],
      lowTraits: [
        'Lebih menyukai pekerjaan yang berhubungan dengan data, objek, atau ide.',
        'Merasa lebih nyaman bekerja secara mandiri.',
        'Kurang berminat pada aktivitas konseling atau mengajar.',
        'Lebih memilih tugas teknis atau analitis.',
        'Mengutamakan efisiensi daripada keharmonisan interpersonal.'
      ],
      careerImplications: {
        high: 'Sangat sesuai untuk berkarier di bidang yang berorientasi pada manusia, seperti pendidikan, layanan kesehatan, atau layanan sosial.',
        low: 'Lebih cocok untuk pekerjaan yang berfokus pada keterampilan teknis, analisis data, atau pekerjaan mandiri daripada interaksi interpersonal yang intensif.'
      }
    },
    'enterprising': {
      icon: '📈',
      name: 'Enterprising',
      subtitle: 'The Persuader',
      description: 'Menyukai peran memimpin, memengaruhi, dan mengelola orang lain. Mengutamakan pencapaian, persaingan, dan keberhasilan bisnis.',
      highTraits: [
        'Memiliki jiwa kepemimpinan dan senang mengambil inisiatif.',
        'Merasa nyaman dalam situasi yang kompetitif dan berorientasi pada pencapaian.',
        'Mampu memengaruhi dan meyakinkan orang lain.',
        'Mengutamakan keberhasilan bisnis dan penghargaan finansial.',
        'Menyukai tantangan dan peluang baru.'
      ],
      lowTraits: [
        'Lebih memilih peran yang mendukung daripada memimpin.',
        'Merasa lebih nyaman dengan kerja sama daripada persaingan.',
        'Kurang berminat pada aktivitas penjualan atau persuasi.',
        'Mengutamakan stabilitas daripada pengambilan risiko.',
        'Lebih suka mengikuti prosedur yang telah ditetapkan.'
      ],
      careerImplications: {
        high: 'Sangat cocok untuk berkarier di bidang kepemimpinan dan bisnis yang melibatkan persuasi dan pencapaian, seperti manajemen, penjualan, atau kewirausahaan.',
        low: 'Lebih sesuai untuk peran pendukung dengan prosedur yang jelas daripada lingkungan bisnis yang kompetitif dan bertekanan tinggi.'
      }
    },
    'conventional': {
      icon: '📊',
      name: 'Conventional',
      subtitle: 'The Organizer',
      description: 'Menyukai pekerjaan yang terorganisir dan terstruktur dengan prosedur yang jelas. Mengutamakan ketelitian, efisiensi, dan pendekatan yang sistematis.',
      highTraits: [
        'Memiliki kemampuan organisasi yang baik dan perhatian terhadap detail.',
        'Lebih menyukai prosedur yang jelas dan pendekatan yang sistematis.',
        'Mengutamakan ketelitian dan presisi dalam pekerjaan.',
        'Merasa nyaman dengan tugas rutin dan terstruktur.',
        'Mampu mengelola data dan informasi secara efektif.'
      ],
      lowTraits: [
        'Lebih menyukai lingkungan kerja yang fleksibel dan tidak terstruktur.',
        'Tertarik pada pendekatan yang kreatif atau inovatif.',
        'Kurang nyaman dengan tugas yang rutin dan berulang.',
        'Mengutamakan variasi dan perubahan daripada konsistensi.',
        'Lebih suka berpikir secara menyeluruh daripada fokus pada detail prosedural.'
      ],
      careerImplications: {
        high: 'Sangat sesuai untuk berkarier di bidang yang terorganisir dan berorientasi pada detail dengan prosedur yang jelas, seperti administrasi, keuangan, atau manajemen data.',
        low: 'Lebih cocok untuk pekerjaan yang dinamis dan fleksibel yang memberikan ruang untuk kreativitas dan variasi daripada pekerjaan yang sangat terstruktur atau rutin.'
      }
    }
  };



  // Navigation cards data
  const navigationCards = [
    {
      title: 'Kekuatan Karakter',
      subtitle: 'VIA-IS Assessment',
      description: 'Temukan kekuatan inti dan nilai-nilai karakter Anda.',
      path: `/results/${resultId}/via-is`,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Trait Kepribadian',
      subtitle: 'OCEAN Assessment',
      description: 'Pahami dimensi kepribadian utama Anda.',
      path: `/results/${resultId}/ocean`,
      color: 'from-blue-500 to-blue-600'
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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

        {/* Content State */}
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
                    RIASEC Career Interests Assessment
                  </h1>
                  <p className="text-gray-600 max-w-2xl text-sm sm:text-base">
                    Discover your natural career interests and work environments that align with your personality.
                    The RIASEC model identifies six key interest areas that guide career satisfaction and success.
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
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl sm:text-3xl mr-3">🎯</span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{riasecExplanation.title}</h2>
                      <p className="text-blue-700 font-medium text-sm sm:text-base">The RIASEC Career Interest Model</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">{riasecExplanation.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 sm:p-4 rounded border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">👨‍🔬 Pengembang</h4>
                      <p className="text-xs sm:text-sm text-gray-700">{riasecExplanation.developer}</p>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">✅ Validitas Ilmiah</h4>
                      <p className="text-xs sm:text-sm text-gray-700">{riasecExplanation.validity}</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 sm:p-4 rounded border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">🎯 Tujuan Assessment</h4>
                    <p className="text-xs sm:text-sm text-gray-700">{riasecExplanation.purpose}</p>
                  </div>
                </div>
              </div>
            </motion.div>



            {/* Radar Chart Visualization */}
            {result.assessment_data?.riasec && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-8"
              >
                <div className="bg-white rounded border border-gray-200 shadow-sm p-4 sm:p-6">
                  <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Profil Minat Karier Anda</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Visualisasi enam dimensi minat karier RIASEC</p>
                  </div>

                  <div className="h-64 sm:h-80 lg:h-96">
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

                  <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {prepareRadarData(result.assessment_data.riasec).map((item, index) => {
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

            {/* Career Interests Analysis */}
            {result.assessment_data?.riasec && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mb-8"
              >
                <div className="bg-white rounded border border-gray-200 shadow-sm p-4 sm:p-6">
                  <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Your RIASEC Interest Profile</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Detailed breakdown of your career interest areas</p>
                  </div>

                  {/* RIASEC Interest Cards - 3 columns 2 rows layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
                </div>
              </motion.div>
            )}

            {/* RIASEC Accuracy and Validity Section */}
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
                      <p className="text-gray-600 font-medium text-sm sm:text-base">Mengapa RIASEC Sangat Tepat untuk Assessment Minat Karier</p>
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
                        Standar Emas Konseling Karier
                      </h4>
                      <ul className="text-xs sm:text-sm text-gray-700 space-y-3">
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Digunakan oleh 90% konselor karier profesional di seluruh dunia</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Validasi empiris selama 60+ tahun dengan jutaan data responden</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Reliabilitas tinggi (r &gt; 0.80) dalam prediksi kepuasan karier</span>
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
                          <span>Mengukur minat intrinsik, bukan hanya kemampuan atau prestasi</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Model hexagonal yang komprehensif dan mudah dipahami</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Terbukti efektif lintas budaya dan generasi</span>
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
                        <p className="text-sm text-gray-700 leading-relaxed">Minat karier didorong oleh kekuatan karakter. Individu dengan "Curiosity" tinggi cenderung Investigative, "Social Intelligence" mengarah ke Social, dan "Leadership" ke Enterprising.</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Dengan OCEAN (Kepribadian):</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">Trait kepribadian mempengaruhi preferensi lingkungan kerja. Openness tinggi berkorelasi dengan Artistic, Extraversion dengan Social/Enterprising, dan Conscientiousness dengan Conventional.</p>
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
                    <span className="text-xl sm:text-2xl">🎯</span>
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

export default ResultRiasec;