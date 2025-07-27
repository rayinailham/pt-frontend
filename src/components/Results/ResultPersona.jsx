import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import apiService from "../../services/apiService";
import EnhancedLoadingScreen from "../UI/EnhancedLoadingScreen";
import useScrollToTop from "../../hooks/useScrollToTop";

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
      jobAvailability: "Job Availability",
      salaryPotential: "Salary Potential",
      careerProgression: "Career Progression",
      industryGrowth: "Industry Growth",
      skillDevelopment: "Skill Development",
    };
    return labels[key] || key;
  };

  const renderPersonaProfile = (personaProfile) => {
    if (!personaProfile) {
      return <p className="text-gray-600">No persona profile available.</p>;
    }

    return (
      <div className="space-y-12">
        {/* Archetype & Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-800 to-slate-600"></div>
          <h3 className="text-4xl font-light text-slate-900 mb-8 tracking-tight">
            {personaProfile.archetype}
          </h3>
          <p className="text-slate-700 leading-relaxed font-normal">
            {personaProfile.shortSummary}
          </p>
        </motion.div>

        {/* Core Strengths & Development Insights */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Core Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800"></div>
            <h4 className="text-3xl font-light text-slate-900 mb-6 flex items-center">
              <div className="w-10 h-10 mr-4 bg-slate-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-slate-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              Core Strengths
            </h4>
            {personaProfile.strengthSummary && (
              <p className="text-slate-700 mb-6 text-base font-normal bg-slate-50 p-4 rounded-xl border border-slate-200">
                {personaProfile.strengthSummary}
              </p>
            )}
            <ul className="space-y-4">
              {personaProfile.strengths?.map((strength, idx) => (
                <li
                  key={idx}
                  className="text-slate-800 flex items-start bg-slate-50 p-4 rounded-xl border border-slate-200"
                >
                  <div className="w-3 h-3 bg-slate-600 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                  <span className="font-normal text-base">{strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Skill Suggestions */}
          {personaProfile.skillSuggestion &&
            personaProfile.skillSuggestion.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-700"></div>
                <h4 className="text-3xl font-light text-slate-900 mb-6 flex items-center">
                  <div className="w-10 h-10 mr-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-slate-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Skill Development
                </h4>
                <p className="text-slate-700 mb-6 text-base font-normal bg-slate-50 p-4 rounded-xl border border-slate-200">
                  Rekomendasi keahlian yang dirancang khusus untuk memperkokoh fondasi keunggulan utama yang telah Anda miliki. Penguasaan keterampilan akan meningkatkan daya saing Anda secara signifikan.
                </p>
                <div className="flex flex-wrap gap-3">
                  {personaProfile.skillSuggestion.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-slate-800 flex items-start bg-slate-50 p-4 rounded-xl border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Career Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-800 to-slate-600"></div>
          <h4 className="text-4xl font-light text-slate-900 mb-10 flex items-center">
            <div className="w-12 h-12 mr-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-slate-700"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1zm-3 4a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            Career Recommendations
          </h4>
          <div className="grid gap-8">
            {personaProfile.careerRecommendation?.map((career, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-8 relative"
              >
                <h5 className="text-3xl font-light text-slate-900 mb-8 text-center tracking-tight">
                  {career.careerName}
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {Object.entries(career.careerProspect || {}).map(
                    ([key, value]) => (
                      <div key={key} className="text-center">
                        {/* Elegant progress indicator */}
                        <div className="mb-3">
                          <div className="w-full bg-gray-300 rounded-full h-2 mb-3">
                            <div
                              className="bg-slate-700 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  (getProspectLevel(value) / 5) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div
                            className={`px-4 py-2 rounded-xl text-sm font-medium border ${getProspectColor(
                              value
                            )}`}
                          >
                            {value}
                          </div>
                        </div>
                        <div className="text-sm text-slate-700 font-medium tracking-wide">
                          {formatProspectLabel(key)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Development Areas & Skills Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Development Areas (moved from above) */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-600"></div>
            <h4 className="text-3xl font-light text-slate-900 mb-6 flex items-center">
              <div className="w-10 h-10 mr-4 bg-slate-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-slate-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              Development Areas
            </h4>
            {personaProfile.weaknessSummary && (
              <p className="text-slate-700 mb-6 text-base font-normal bg-slate-50 p-4 rounded-xl border border-slate-200">
                {personaProfile.weaknessSummary}
              </p>
            )}
            <ul className="space-y-4">
              {personaProfile.weaknesses?.map((weakness, idx) => (
                <li
                  key={idx}
                  className="text-slate-800 flex items-start bg-slate-50 p-4 rounded-xl border border-slate-200"
                >
                  <div className="w-3 h-3 bg-slate-600 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                  <span className="font-normal text-base">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Development Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-700"></div>
            <h4 className="text-3xl font-light text-slate-900 mb-6 flex items-center">
              <div className="w-10 h-10 mr-4 bg-slate-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-slate-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              Development Insights
            </h4>
            <p className="text-slate-700 mb-6 text-base font-normal bg-slate-50 p-4 rounded-xl border border-slate-200">
              Wawasan strategis yang mendalam untuk membantu Anda mengenali dan menyikapi area-area yang perlu dikembangkan.
            </p>
            <ul className="space-y-4">
              {personaProfile.insights?.map((insight, idx) => (
                <li
                  key={idx}
                  className="text-slate-800 flex items-start bg-slate-50 p-4 rounded-xl border border-slate-200"
                >
                  <div className="w-3 h-3 bg-slate-600 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                  <span className="font-normal text-base">{insight}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Possible Pitfalls - Full Width */}
        {personaProfile.possiblePitfalls &&
          personaProfile.possiblePitfalls.length > 0 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-600"></div>
              <h4 className="text-3xl font-light text-slate-900 mb-6 flex items-center">
                <div className="w-10 h-10 mr-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-slate-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Potential Challenges
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                {personaProfile.possiblePitfalls.map((pitfall, idx) => (
                  <div
                    key={idx}
                    className="text-slate-800 flex items-start bg-slate-50 p-4 rounded-xl border border-slate-200"
                  >
                    <div className="w-3 h-3 bg-slate-600 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                    <span className="font-normal text-base">{pitfall}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Work Environment & Role Models */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Work Environment */}
          {personaProfile.workEnvironment && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-700"></div>
              <h4 className="text-3xl font-light text-slate-900 mb-6 flex items-center">
                <div className="w-10 h-10 mr-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-slate-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Work Environment
              </h4>
              <p className="text-slate-700 leading-relaxed font-normal text-base">
                {personaProfile.workEnvironment}
              </p>
            </div>
          )}

          {/* Role Models */}
          {personaProfile.roleModel && personaProfile.roleModel.length > 0 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-700"></div>
              <h4 className="text-3xl font-light text-slate-900 mb-6 flex items-center">
                <div className="w-10 h-10 mr-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-slate-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Role Models
              </h4>
              <div className="flex flex-wrap gap-3">
                {personaProfile.roleModel.map((model, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 text-slate-800 px-4 py-3 rounded-xl text-base font-medium border border-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
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
                    className="bg-slate-800 text-white px-6 py-2 rounded-xl text-sm font-light hover:bg-slate-700 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate(`/results/${resultId}`)}
                    className="bg-slate-100 text-slate-700 px-6 py-2 rounded-xl text-sm font-light hover:bg-slate-200 transition-colors border border-slate-200"
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
              className="mb-12"
            >
              <div className="flex justify-between items-center">
                <h1 className="text-5xl font-light text-slate-800 tracking-tight">
                  Career Persona Profile
                </h1>
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate(`/results/${resultId}`)}
                    className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors duration-200 border border-slate-200 font-light"
                  >
                    Back to Overview
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 transition-colors duration-200 font-light"
                  >
                    Dashboard
                  </button>
                </div>
              </div>

              <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8 text-base text-slate-600">
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-3 bg-slate-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-slate-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="font-medium">
                        Completed: {formatDate(result.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full mr-3"></div>
                      <span className="text-slate-700 font-medium">
                        Career Profile Analysis
                      </span>
                    </div>
                  </div>
                  {result.persona_profile?.riskTolerance && (
                    <div className="flex items-center">
                      <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2">
                        <span className="text-slate-800 font-medium text-base">
                          {result.persona_profile.riskTolerance
                            .charAt(0)
                            .toUpperCase() +
                            result.persona_profile.riskTolerance.slice(1)}{" "}
                          Risk Taker
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Persona Profile Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-3xl font-light text-slate-800 mb-12 tracking-tight">
                Your Complete Career Profile
              </h2>
              {renderPersonaProfile(result.persona_profile)}
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default ResultPersona;
