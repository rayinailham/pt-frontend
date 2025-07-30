import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import apiService from "../../services/apiService";
import EnhancedLoadingScreen from "../UI/EnhancedLoadingScreen";
import useScrollToTop from "../../hooks/useScrollToTop";
import AssessmentRelation from "./AssessmentRelation";

const ResultPersona = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
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
          const errorMessage =
            retryCount >= maxRetries
              ? `Result not found after ${
                  maxRetries + 1
                } attempts. The analysis may still be processing.`
              : err.response?.data?.message || "Failed to load results";
          setError(errorMessage);
          fetchInProgressRef.current = false;
        }
      }
    };

    if (resultId) {
      fetchResult();
    } else {
      navigate("/dashboard");
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
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProspectColor = (level) => {
    const colors = {
      "super high": "text-slate-800 bg-slate-50 border-slate-200",
      high: "text-slate-700 bg-slate-50 border-slate-200",
      moderate: "text-slate-600 bg-slate-50 border-slate-200",
      low: "text-slate-600 bg-slate-50 border-slate-200",
      "super low": "text-slate-600 bg-slate-50 border-slate-200",
    };
    return colors[level] || "text-slate-600 bg-slate-50 border-slate-200";
  };



  const formatProspectLabel = (key) => {
    const labels = {
      aiOvertake: "Risiko Digantikan AI",
      jobAvailability: "Ketersediaan Pekerjaan",
      salaryPotential: "Potensi Penghasilan",
      careerProgression: "Peluang Pengembangan Karier",
      industryGrowth: "Pertumbuhan Industri",
      skillDevelopment: "Pengembangan Keahlian",
    };
    return labels[key] || key;
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

  // Navigation cards data
  const navigationCards = [
    {
      title: 'Minat Karier',
      subtitle: 'RIASEC Assessment',
      description: 'Jelajahi minat karier dan preferensi lingkungan kerja Anda.',
      path: `/results/${resultId}/riasec`,
      color: 'from-slate-100 to-slate-200'
    },
    {
      title: 'Trait Kepribadian',
      subtitle: 'OCEAN Assessment',
      description: 'Pahami dimensi kepribadian utama Anda.',
      path: `/results/${resultId}/ocean`,
      color: 'from-slate-100 to-slate-200'
    },
    {
      title: 'Kekuatan Karakter',
      subtitle: 'VIA-IS Assessment',
      description: 'Temukan kekuatan inti dan nilai-nilai karakter Anda.',
      path: `/results/${resultId}/via-is`,
      color: 'from-slate-100 to-slate-200'
    }
  ];

  const renderPersonaProfile = (personaProfile) => {
    if (!personaProfile) {
      return <p className="text-gray-600">No persona profile available.</p>;
    }

    return (
      <div id="persona-profile-container" className="space-y-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6 auto-rows-min">

          {/* Hero Section - Archetype & Summary (Full Width) */}
          <motion.div
            id="career-archetype-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <span className="text-slate-600 text-lg">✦</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-1">
                      {personaProfile.archetype}
                    </h3>
                    <p className="text-slate-500 text-sm">Profile Archetype Persona</p>
                  </div>
                </div>
                {/* Core Motivators Pills */}
                {personaProfile.coreMotivators && personaProfile.coreMotivators.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {personaProfile.coreMotivators.map((motivator, idx) => (
                      <span
                        key={idx}
                        className="text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium"
                      >
                        {motivator}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-slate-700 text-base leading-relaxed mb-6">
                {personaProfile.shortSummary}
              </p>

              {/* Learning Style */}
              {personaProfile.learningStyle && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                    <span className="w-5 h-5 bg-slate-50 rounded-lg flex items-center justify-center mr-2">
                      <span className="text-slate-600 text-xs">🎯</span>
                    </span>
                    Gaya Belajar
                  </h4>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {personaProfile.learningStyle}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Strengths Section (Large) */}
          <motion.div
            id="core-strengths-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-slate-50 border-b border-slate-200 p-5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                  <span className="text-slate-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">Kekuatan Utama</h4>
                  <p className="text-slate-600 text-xs">Core Strengths</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <p className="text-slate-700 text-sm leading-relaxed">
                  {personaProfile.strengthSummary || "Kekuatan inti yang mendefinisikan keunggulan utama dalam profil karier Anda."}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personaProfile.strengths?.map((strength, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200"
                  >
                    <div className="w-2 h-2 bg-slate-600 rounded-full flex-shrink-0"></div>
                    <span className="text-slate-700 text-sm font-medium">{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Skill Development Section (Medium) */}
          {personaProfile.skillSuggestion && personaProfile.skillSuggestion.length > 0 && (
            <motion.div
              id="skill-development-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="bg-slate-50 border-b border-slate-200 p-5">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                    <span className="text-slate-600 text-sm">⚡</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Pengembangan Keahlian</h4>
                    <p className="text-slate-600 text-xs">Skill Development</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Rekomendasi keahlian yang dirancang khusus untuk memperkokoh fondasi keunggulan utama yang telah Anda miliki.
                  </p>
                </div>
                <div className="space-y-3">
                  {personaProfile.skillSuggestion.map((skill, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-sm font-medium text-slate-700"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Career Recommendations Section (Full Width) */}
          <motion.div
            id="career-recommendations-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-slate-50 border-b border-slate-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <span className="text-slate-600 text-lg">💼</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-slate-900">Rekomendasi Karier</h4>
                  <p className="text-slate-600 text-sm">Jalur Karier yang Sesuai dengan Profil Persona Anda</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {personaProfile.careerRecommendation?.map((career, idx) => (
                  <div
                    key={idx}
                    className={`bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${
                      personaProfile.careerRecommendation.length === 3 && idx === 2 ? 'xl:col-span-2' : ''
                    }`}
                  >
                    {/* Career Header */}
                    <div className="bg-white border-b border-slate-200 p-6">
                      <h5 className="text-2xl font-bold text-slate-900 text-center">
                        {career.careerName}
                      </h5>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Justification */}
                      {career.justification && (
                        <div>
                          <h6 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Mengapa Cocok untuk Anda</h6>
                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {career.justification}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Career Prospects */}
                      <div>
                        <h6 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Prospek Karier</h6>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                          {Object.entries(career.careerProspect || {}).map(([key, value]) => (
                            <div key={key} className="text-center bg-white p-3 rounded-lg border border-slate-200">
                              <div className={`text-sm font-semibold mb-2 px-3 py-1.5 rounded-full ${getProspectColor(value)}`}>
                                {value}
                              </div>
                              <div className="text-xs text-slate-600 leading-tight font-medium">
                                {formatProspectLabel(key)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* First Steps */}
                      {career.firstSteps && career.firstSteps.length > 0 && (
                        <div>
                          <h6 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Langkah Pertama</h6>
                          <div className="space-y-3">
                            {career.firstSteps.slice(0, 3).map((step, stepIdx) => (
                              <div
                                key={stepIdx}
                                className="flex items-start text-sm text-slate-700 bg-white p-4 rounded-xl border border-slate-200"
                              >
                                <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                                  <span className="text-slate-600 text-sm font-bold">{stepIdx + 1}</span>
                                </div>
                                <span className="leading-relaxed">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Related Majors */}
                      {career.relatedMajors && career.relatedMajors.length > 0 && (
                        <div>
                          <h6 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Jurusan Terkait</h6>
                          <div className="flex flex-wrap gap-2">
                            {career.relatedMajors.slice(0, 4).map((major, majorIdx) => (
                              <span
                                key={majorIdx}
                                className="text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-full text-sm font-medium"
                              >
                                {major}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Development Areas (Medium) */}
          <motion.div
            id="development-areas-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-slate-50 border-b border-slate-200 p-5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                  <span className="text-slate-600 text-sm">⚠</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">Area Pengembangan</h4>
                  <p className="text-slate-600 text-xs">Development Areas</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <p className="text-slate-700 text-sm leading-relaxed">
                  {personaProfile.weaknessSummary || "Area-area yang memerlukan perhatian khusus untuk pengembangan diri yang lebih optimal."}
                </p>
              </div>
              <div className="space-y-4">
                {personaProfile.weaknesses?.map((weakness, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200"
                  >
                    <div className="w-2 h-2 bg-slate-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700 text-sm leading-relaxed">{weakness}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Development Insights (Medium) */}
          <motion.div
            id="development-insights-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-slate-50 border-b border-slate-200 p-5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                  <span className="text-slate-600 text-sm">💡</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">Wawasan Pengembangan</h4>
                  <p className="text-slate-600 text-xs">Development Insights</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <p className="text-slate-700 text-sm leading-relaxed">
                  Bahkan berdasarkan hasil analisis data OCEAN, RIASEC, dan VIA-IS, kami memberikan wawasan strategis yang mendalam untuk membantu Anda mengenali serta menyikapi area-area yang perlu dikembangkan.
                </p>
              </div>
              <div className="space-y-4">
                {personaProfile.insights?.map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200"
                  >
                    <div className="w-2 h-2 bg-slate-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700 text-sm leading-relaxed">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Potential Challenges (Full Width) */}
          {personaProfile.possiblePitfalls && personaProfile.possiblePitfalls.length > 0 && (
            <motion.div
              id="potential-challenges-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="bg-slate-50 border-b border-slate-200 p-5">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                    <span className="text-slate-600 text-sm">⚠</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Tantangan Potensial</h4>
                    <p className="text-slate-600 text-xs">Area yang Perlu Diwaspadai</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {personaProfile.possiblePitfalls.map((pitfall, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 bg-slate-50 p-5 rounded-xl border border-slate-200"
                    >
                      <div className="w-2 h-2 bg-slate-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-700 text-sm leading-relaxed">{pitfall}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Work Environment (Medium) */}
          {personaProfile.workEnvironment && (
            <motion.div
              id="work-environment-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="bg-slate-50 border-b border-slate-200 p-5">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                    <span className="text-slate-600 text-sm">🏢</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Lingkungan Kerja</h4>
                    <p className="text-slate-600 text-xs">Work Environment</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {personaProfile.workEnvironment}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Role Models (Small) */}
          {personaProfile.roleModel && personaProfile.roleModel.length > 0 && (
            <motion.div
              id="role-models-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="bg-slate-50 border-b border-slate-200 p-5">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                    <span className="text-slate-600 text-sm">👥</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Panutan Profil Persona</h4>
                    <p className="text-slate-600 text-xs">Role Models Profil Persona</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {personaProfile.roleModel.map((model, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 text-slate-700 border border-slate-200 px-4 py-3 rounded-xl text-sm font-medium text-center"
                    >
                      {model}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Development Activities Section - Bento Layout */}
          {personaProfile.developmentActivities && (
            <>
              {/* Extracurricular Activities (Medium) */}
              {personaProfile.developmentActivities.extracurricular &&
               personaProfile.developmentActivities.extracurricular.length > 0 && (
                <motion.div
                  id="extracurricular-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-slate-50 border-b border-slate-200 p-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                        <span className="text-slate-600 text-sm">🎯</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">Ekstrakurikuler</h4>
                        <p className="text-slate-600 text-xs">Extracurricular</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {personaProfile.developmentActivities.extracurricular.slice(0, 3).map((activity, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200"
                        >
                          <div className="w-2 h-2 bg-slate-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-slate-700 text-sm leading-relaxed">{activity}</span>
                        </div>
                      ))}
                      {personaProfile.developmentActivities.extracurricular.length > 3 && (
                        <div className="text-center pt-3">
                          <span className="text-xs text-slate-500">+{personaProfile.developmentActivities.extracurricular.length - 3} lainnya</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Project Ideas (Large) */}
              {personaProfile.developmentActivities.projectIdeas &&
               personaProfile.developmentActivities.projectIdeas.length > 0 && (
                <motion.div
                  id="project-ideas-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-slate-50 border-b border-slate-200 p-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                        <span className="text-slate-600 text-sm">💡</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">Ide Proyek</h4>
                        <p className="text-slate-600 text-xs">Project Ideas</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {personaProfile.developmentActivities.projectIdeas.map((project, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200"
                        >
                          <div className="w-2 h-2 bg-slate-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-slate-700 text-sm leading-relaxed">{project}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Book Recommendations (Full Width) */}
              {personaProfile.developmentActivities.bookRecommendations &&
               personaProfile.developmentActivities.bookRecommendations.length > 0 && (
                <motion.div
                  id="book-recommendations-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-slate-50 border-b border-slate-200 p-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                        <span className="text-slate-600 text-sm">📚</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">Rekomendasi Buku</h4>
                        <p className="text-slate-600 text-xs">Book Recommendations</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {personaProfile.developmentActivities.bookRecommendations.map((book, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow duration-200"
                        >
                          <h6 className="text-sm font-semibold text-slate-900 mb-3 leading-tight line-clamp-2">
                            {book.title}
                          </h6>
                          <p className="text-xs text-slate-500 mb-4">
                            oleh {book.author}
                          </p>
                          <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                            {book.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
        {/* Close Bento Grid */}
      </div>
    );
  };

  return (
    <div id="result-persona-page" className="min-h-screen bg-slate-50">
      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-6 py-8">
        {/* Loading State */}
        {!result && !error && (
          <motion.div
            id="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedLoadingScreen
              title="Loading Career Persona..."
              subtitle="Fetching your detailed career profile"
              skeletonCount={4}
              className="min-h-[600px]"
            />
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            id="error-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-red-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-slate-900">
                  Unable to Load Results
                </h3>
                <div className="mt-2 text-sm text-slate-600">
                  <p>{error}</p>
                </div>
                <div className="mt-4 space-x-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-all duration-200"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate(`/results/${resultId}`)}
                    className="bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-100 transition-all duration-200 border border-slate-200"
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
              id="page-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-4 sm:space-y-0">
                <div>
                  <h1 className="text-2xl font-medium text-slate-900 mb-2">
                    Profile Persona
                  </h1>
                  <p className="text-slate-600 max-w-2xl text-sm leading-relaxed">
                    Discover your comprehensive profile persona based on integrated assessment results from RIASEC, OCEAN, and VIA-IS evaluations.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate(`/results/${resultId}`)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 text-sm"
                  >
                    Dashboard
                  </button>
                </div>
              </div>

              <div id="header-info-card" className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-600 space-y-3 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-slate-800 rounded-full mr-2"></div>
                      <span>Completed: {formatDate(result.created_at)}</span>
                    </div>
                    {(() => {
                      const riskTolerance = result.persona_profile?.riskTolerance || result.persona_profile?.risk_tolerance;
                      return riskTolerance && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                          <span>Risk Profile: <span className="font-medium capitalize text-slate-800">{riskTolerance}</span></span>
                        </div>
                      );
                    })()}
                  </div>
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-xs font-medium uppercase tracking-wider">
                    Integrated Profile
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Persona Profile Content */}
            <motion.div
              id="persona-profile-main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-medium text-slate-900 mb-2">
                  Profil Persona Lengkap Anda
                </h2>
                <div className="w-16 h-0.5 bg-slate-300 mx-auto rounded-full"></div>
              </div>
              {renderPersonaProfile(result.persona_profile)}
            </motion.div>

            

            {/* Navigation to Other Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mb-6"
            >
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-slate-100 rounded-lg mb-2">
                    <span className="text-lg">🎯</span>
                  </div>
                  <h2 className="text-xl font-medium text-slate-900 mb-2">
                    Jelajahi Profil Lengkap Anda
                  </h2>
                  <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
                    Lanjutkan perjalanan Anda dengan mengeksplorasi aspek lain dari hasil assessment. Setiap assessment memberikan wawasan unik tentang berbagai sisi kepribadian dan potensi karier Anda.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
                {navigationCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
                    whileHover={{
                      y: -2,
                      transition: { duration: 0.15 }
                    }}
                    className="group cursor-pointer"
                    onClick={() => navigate(card.path)}
                  >
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 h-full">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-end mb-2">
                          <motion.svg
                            className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </motion.svg>
                        </div>

                        <div className="flex-grow">
                          <h3 className="text-lg font-medium text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
                            {card.subtitle}
                          </p>
                          <p className="text-slate-600 leading-relaxed text-sm">
                            {card.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                            <span>Lihat Assessment</span>
                            <motion.svg
                              className="w-3 h-3 ml-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              whileHover={{ x: 1 }}
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
      </main>
    </div>
  );
};

export default ResultPersona;
