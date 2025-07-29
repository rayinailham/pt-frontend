import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import apiService from "../../services/apiService";
import EnhancedLoadingScreen from "../UI/EnhancedLoadingScreen";
import useScrollToTop from "../../hooks/useScrollToTop";
import AssessmentRelation from "./AssessmentExplanations";

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
      "super high": "text-slate-900 bg-slate-100 border-slate-300",
      high: "text-slate-800 bg-slate-100 border-slate-300",
      moderate: "text-slate-700 bg-slate-100 border-slate-300",
      low: "text-slate-700 bg-slate-100 border-slate-300",
      "super low": "text-slate-700 bg-slate-100 border-slate-300",
    };
    return colors[level] || "text-slate-700 bg-slate-100 border-slate-300";
  };

  const getProspectLevel = (level) => {
    const levels = {
      "super high": 5,
      high: 4,
      moderate: 3,
      low: 2,
      "super low": 1,
    };
    return levels[level] || 0;
  };

  const formatProspectLabel = (key) => {
    const labels = {
      jobAvailability: "Ketersediaan Pekerjaan",
      salaryPotential: "Potensi Penghasilan",
      careerProgression: "Peluang Pengembangan Karier",
      industryGrowth: "Pertumbuhan Industri",
      skillDevelopment: "Pengembangan Keahlian",
    };
    return labels[key] || key;
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
      title: 'Trait Kepribadian',
      subtitle: 'OCEAN Assessment',
      description: 'Pahami dimensi kepribadian utama Anda.',
      path: `/results/${resultId}/ocean`,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Kekuatan Karakter',
      subtitle: 'VIA-IS Assessment',
      description: 'Temukan kekuatan inti dan nilai-nilai karakter Anda.',
      path: `/results/${resultId}/via-is`,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const renderPersonaProfile = (personaProfile) => {
    if (!personaProfile) {
      return <p className="text-gray-600">No persona profile available.</p>;
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Tipe Karier & Ringkasan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {personaProfile.archetype}
            </h3>
          </div>
          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {personaProfile.shortSummary}
            </p>

            {/* Core Motivators */}
            {personaProfile.coreMotivators && personaProfile.coreMotivators.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Motivator Utama:</h4>
                <div className="flex flex-wrap gap-2">
                  {personaProfile.coreMotivators.map((motivator, idx) => (
                    <span
                      key={idx}
                      className="text-gray-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded text-xs sm:text-sm font-medium"
                    >
                      {motivator}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Style */}
            {personaProfile.learningStyle && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Gaya Belajar:</h4>
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded border border-gray-100">
                  {personaProfile.learningStyle}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Core Strengths & Development Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Kekuatan Utama */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden h-full"
          >
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                <span className="text-xl mr-3">✅</span>
                Kekuatan Utama
              </h4>
            </div>
            {/* Content */}
            <div className="p-4 sm:p-6">
              {personaProfile.strengthSummary && (
                <p className="text-gray-700 mb-4 text-sm sm:text-base bg-gray-50 p-3 sm:p-4 rounded border border-gray-100">
                  {personaProfile.strengthSummary}
                </p>
              )}
              <div className="space-y-2">
                {personaProfile.strengths?.map((strength, idx) => (
                  <div
                    key={idx}
                    className="flex items-start text-xs sm:text-sm text-gray-700"
                  >
                    <span className="text-gray-400 mr-2 mt-0.5">•</span>
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Pengembangan Keahlian */}
          {personaProfile.skillSuggestion &&
            personaProfile.skillSuggestion.length > 0 && (
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden h-full">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                    <span className="text-xl mr-3">🎯</span>
                    Pengembangan Keahlian
                  </h4>
                </div>
                {/* Content */}
                <div className="p-4 sm:p-6">
                  <p className="text-gray-700 mb-4 text-sm sm:text-base bg-gray-50 p-3 sm:p-4 rounded border border-gray-100">
                    Rekomendasi keahlian yang dirancang khusus untuk memperkokoh fondasi keunggulan utama yang telah Anda miliki.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {personaProfile.skillSuggestion.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-gray-800 bg-gray-100 px-3 py-1.5 rounded text-xs sm:text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Rekomendasi Karier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
              <span className="text-xl mr-3">💼</span>
              Rekomendasi Karier
            </h4>
          </div>
          {/* Content */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              {personaProfile.careerRecommendation?.map((career, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded border border-gray-100 overflow-hidden"
                >
                  {/* Career Header */}
                  <div className="bg-white border-b border-gray-200 p-4">
                    <h5 className="text-lg font-bold text-gray-900 text-center">
                      {career.careerName}
                    </h5>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Justification */}
                    {career.justification && (
                      <div>
                        <h6 className="text-sm font-semibold text-gray-900 mb-2">Mengapa Cocok untuk Anda:</h6>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-white p-3 rounded border border-gray-200">
                          {career.justification}
                        </p>
                      </div>
                    )}

                    {/* Career Prospects */}
                    <div>
                      <h6 className="text-sm font-semibold text-gray-900 mb-3">Prospek Karier:</h6>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {Object.entries(career.careerProspect || {}).map(
                          ([key, value]) => (
                            <div key={key} className="text-center bg-white p-3 rounded border border-gray-200">
                              <div className="text-lg font-bold text-gray-900 mb-1">
                                {getProspectLevel(value)}/5
                              </div>
                              <div className={`text-xs font-medium mb-2 px-2 py-1 rounded ${getProspectColor(value)}`}>
                                {value}
                              </div>
                              <div className="text-xs text-gray-600 font-medium leading-tight">
                                {formatProspectLabel(key)}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* First Steps */}
                    {career.firstSteps && career.firstSteps.length > 0 && (
                      <div>
                        <h6 className="text-sm font-semibold text-gray-900 mb-2">Langkah Pertama:</h6>
                        <div className="space-y-2">
                          {career.firstSteps.map((step, stepIdx) => (
                            <div
                              key={stepIdx}
                              className="flex items-start text-xs sm:text-sm text-gray-700 bg-white p-3 rounded border border-gray-200"
                            >
                              <span className="text-blue-600 mr-2 mt-0.5 font-bold">{stepIdx + 1}.</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Majors */}
                    {career.relatedMajors && career.relatedMajors.length > 0 && (
                      <div>
                        <h6 className="text-sm font-semibold text-gray-900 mb-2">Jurusan Terkait:</h6>
                        <div className="flex flex-wrap gap-2">
                          {career.relatedMajors.map((major, majorIdx) => (
                            <span
                              key={majorIdx}
                              className="text-gray-800 bg-white border border-gray-200 px-3 py-1.5 rounded text-xs sm:text-sm font-medium"
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

        {/* Development Areas & Skills Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Area Pengembangan */}
          <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden h-full">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                <span className="text-xl mr-3">⚠️</span>
                Area Pengembangan
              </h4>
            </div>
            {/* Content */}
            <div className="p-4 sm:p-6">
              {personaProfile.weaknessSummary && (
                <p className="text-gray-700 mb-4 text-sm sm:text-base bg-gray-50 p-3 sm:p-4 rounded border border-gray-100">
                  {personaProfile.weaknessSummary}
                </p>
              )}
              <div className="space-y-2">
                {personaProfile.weaknesses?.map((weakness, idx) => (
                  <div
                    key={idx}
                    className="flex items-start text-xs sm:text-sm text-gray-700"
                  >
                    <span className="text-gray-400 mr-2 mt-0.5">•</span>
                    <span>{weakness}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Wawasan Pengembangan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden h-full"
          >
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                <span className="text-xl mr-3">💡</span>
                Wawasan Pengembangan
              </h4>
            </div>
            {/* Content */}
            <div className="p-4 sm:p-6">
              <p className="text-gray-700 mb-4 text-sm sm:text-base bg-gray-50 p-3 sm:p-4 rounded border border-gray-100">
                Wawasan strategis yang mendalam untuk membantu Anda mengenali dan menyikapi area-area yang perlu dikembangkan.
              </p>
              <div className="space-y-2">
                {personaProfile.insights?.map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start text-xs sm:text-sm text-gray-700"
                  >
                    <span className="text-gray-400 mr-2 mt-0.5">•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tantangan Potensial - Full Width */}
        {personaProfile.possiblePitfalls &&
          personaProfile.possiblePitfalls.length > 0 && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <span className="text-xl mr-3">🚨</span>
                  Tantangan Potensial
                </h4>
              </div>
              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {personaProfile.possiblePitfalls.map((pitfall, idx) => (
                    <div
                      key={idx}
                      className="flex items-start text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 sm:p-4 rounded border border-gray-100"
                    >
                      <span className="text-gray-400 mr-2 mt-0.5">•</span>
                      <span>{pitfall}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* Work Environment & Role Models */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Lingkungan Kerja */}
          {personaProfile.workEnvironment && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden h-full">
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <span className="text-xl mr-3">🏢</span>
                  Lingkungan Kerja
                </h4>
              </div>
              {/* Content */}
              <div className="p-4 sm:p-6">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {personaProfile.workEnvironment}
                </p>
              </div>
            </div>
          )}

          {/* Panutan Karier */}
          {personaProfile.roleModel && personaProfile.roleModel.length > 0 && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden h-full">
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <span className="text-xl mr-3">👥</span>
                  Panutan Karier
                </h4>
              </div>
              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  {personaProfile.roleModel.map((model, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Development Activities Section */}
        {personaProfile.developmentActivities && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                <span className="text-xl mr-3">🚀</span>
                Aktivitas Pengembangan
              </h4>
            </div>
            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Extracurricular Activities */}
                {personaProfile.developmentActivities.extracurricular &&
                 personaProfile.developmentActivities.extracurricular.length > 0 && (
                  <div className="bg-gray-50 rounded border border-gray-100 p-4">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🎯</span>
                      Ekstrakurikuler
                    </h5>
                    <div className="space-y-2">
                      {personaProfile.developmentActivities.extracurricular.map((activity, idx) => (
                        <div
                          key={idx}
                          className="flex items-start text-xs sm:text-sm text-gray-700"
                        >
                          <span className="text-gray-400 mr-2 mt-0.5">•</span>
                          <span>{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Ideas */}
                {personaProfile.developmentActivities.projectIdeas &&
                 personaProfile.developmentActivities.projectIdeas.length > 0 && (
                  <div className="bg-gray-50 rounded border border-gray-100 p-4">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">💡</span>
                      Ide Proyek
                    </h5>
                    <div className="space-y-2">
                      {personaProfile.developmentActivities.projectIdeas.map((project, idx) => (
                        <div
                          key={idx}
                          className="flex items-start text-xs sm:text-sm text-gray-700"
                        >
                          <span className="text-gray-400 mr-2 mt-0.5">•</span>
                          <span>{project}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Recommendations */}
                {personaProfile.developmentActivities.bookRecommendations &&
                 personaProfile.developmentActivities.bookRecommendations.length > 0 && (
                  <div className="bg-gray-50 rounded border border-gray-100 p-4">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">📚</span>
                      Rekomendasi Buku
                    </h5>
                    <div className="space-y-3">
                      {personaProfile.developmentActivities.bookRecommendations.map((book, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded border border-gray-200"
                        >
                          <h6 className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
                            {book.title}
                          </h6>
                          <p className="text-xs text-gray-600 mb-2">
                            oleh {book.author}
                          </p>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {book.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Loading State */}
        {!result && !error && (
          <motion.div
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-gray-200 rounded-md p-8 shadow-sm"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-slate-600"
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
                <h3 className="text-lg font-light text-slate-800">
                  Unable to Load Results
                </h3>
                <div className="mt-2 text-sm text-slate-600 font-light">
                  <p>{error}</p>
                </div>
                <div className="mt-6 space-x-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-slate-800 text-white px-6 py-2 rounded text-sm font-light hover:bg-slate-700 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate(`/results/${resultId}`)}
                    className="bg-slate-100 text-slate-700 px-6 py-2 rounded text-sm font-light hover:bg-slate-200 transition-colors border border-slate-200"
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
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Career Persona Profile
                  </h1>
                  <p className="text-gray-600 max-w-2xl text-sm sm:text-base">
                    Discover your comprehensive career persona based on integrated assessment results from RIASEC, OCEAN, and VIA-IS evaluations.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => navigate(`/results/${resultId}`)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-sm sm:text-base"
                  >
                    Dashboard
                  </button>
                </div>
              </div>

              <div className="bg-white rounded p-3 sm:p-4 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600 space-y-3 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-gray-900 rounded-sm mr-2"></span>
                      Completed: {formatDate(result.created_at)}
                    </div>
                    {(() => {
                      const riskTolerance = result.persona_profile?.riskTolerance || result.persona_profile?.risk_tolerance;
                      return riskTolerance && (
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-sm mr-2"></span>
                          Risk Profile: <span className="font-medium ml-1 capitalize">{riskTolerance}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium self-start sm:self-auto">
                    Integrated Profile
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Persona Profile Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
                Your Complete Career Profile
              </h2>
              {renderPersonaProfile(result.persona_profile)}
            </motion.div>

            {/* Assessment Validation Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-16 mb-12"
            >
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-6 sm:px-8 py-4 sm:py-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                      <span className="text-white text-lg sm:text-xl font-semibold">✓</span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Validitas Analisis Assessment</h2>
                      <p className="text-gray-600 font-medium text-sm sm:text-base">Mengapa Hasil Analisis Persona Profile Ini Sangat Valid dan Akurat</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
                      <div className="flex items-center mb-3 sm:mb-4">
                        <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <span className="text-white text-xs sm:text-sm">1</span>
                        </span>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">VIA Character Strengths</h4>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 leading-relaxed">Mengidentifikasi 24 kekuatan karakter yang menjadi fondasi kepribadian dan motivasi intrinsik Anda.</p>
                      <ul className="text-xs text-gray-600 space-y-1 sm:space-y-2">
                        <li className="flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          <span>Validasi empiris 1M+ responden</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          <span>Reliabilitas tinggi (α &gt; 0.85)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
                      <div className="flex items-center mb-3 sm:mb-4">
                        <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <span className="text-white text-xs sm:text-sm">2</span>
                        </span>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">RIASEC Career Interests</h4>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 leading-relaxed">Mengukur minat karier berdasarkan preferensi lingkungan kerja dan aktivitas profesional.</p>
                      <ul className="text-xs text-gray-600 space-y-1 sm:space-y-2">
                        <li className="flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          <span>Standar emas konseling karier</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          <span>Prediksi kepuasan karier (r &gt; 0.80)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
                      <div className="flex items-center mb-3 sm:mb-4">
                        <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <span className="text-white text-xs sm:text-sm">3</span>
                        </span>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">OCEAN Personality</h4>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 leading-relaxed">Menganalisis lima dimensi kepribadian yang stabil dan memprediksi perilaku kerja.</p>
                      <ul className="text-xs text-gray-600 space-y-1 sm:space-y-2">
                        <li className="flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          <span>Model paling diterima psikologi</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          <span>Stabilitas temporal (r &gt; 0.75)</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                        <span className="text-white text-xs sm:text-sm">4</span>
                      </span>
                      Triangulasi Assessment untuk Validitas Maksimal
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Integrasi Multi-Dimensi:</h5>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">Persona profile Anda dibangun dari triangulasi tiga dimensi psikologis yang saling melengkapi: karakter (VIA), minat (RIASEC), dan kepribadian (OCEAN). Pendekatan ini memberikan gambaran komprehensif yang tidak dapat dicapai oleh satu assessment saja.</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Validasi Silang:</h5>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">Setiap insight dalam profil Anda dikonfirmasi oleh minimal dua assessment yang berbeda. Misalnya, preferensi karier Investigative (RIASEC) dikuatkan oleh Openness tinggi (OCEAN) dan Love of Learning (VIA), menciptakan konsistensi yang tinggi.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Assessment Integration Section */}
            <div className="mb-12">
              <AssessmentRelation delay={0.85} />
            </div>

            {/* Navigation to Other Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mb-12"
            >
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-md p-6 sm:p-8 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-md mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl">🎯</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2 sm:mb-3 tracking-tight">
                    Jelajahi Profil Lengkap Anda
                  </h2>
                  <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
                    Lanjutkan perjalanan Anda dengan mengeksplorasi aspek lain dari hasil assessment. Setiap assessment memberikan wawasan unik tentang berbagai sisi kepribadian dan potensi karier Anda.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
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
                    <div
                      className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border-0 hover:shadow-lg transition-all duration-300 h-full"
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.02)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.02)';
                      }}
                    >
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
                          <p className="text-slate-600 leading-relaxed font-normal text-sm sm:text-base">
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
      </main>
    </div>
  );
};

export default ResultPersona;
