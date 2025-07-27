import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import EnhancedLoadingScreen from '../UI/EnhancedLoadingScreen';
import RiasecRadarChart from './RiasecRadarChart';
import OceanBarChart from './OceanBarChart';
import ViaisChart from './ViaisChart';
import AssessmentExplanations from './AssessmentExplanations';
import Chatbot from '../Chatbot/Chatbot';


const ResultsPage = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async (retryCount = 0) => {
      const maxRetries = 5;
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s

      try {
        console.log(`🔍 Fetching result for ID: ${resultId} (attempt ${retryCount + 1})`);
        const response = await apiService.getResultById(resultId);

        if (response.success) {
          console.log('✅ Result fetched successfully:', response.data);
          setResult(response.data);
        }
      } catch (err) {
        console.error(`❌ Fetch attempt ${retryCount + 1} failed:`, err);

        // If it's a 404 and we haven't exceeded max retries, try again
        if (err.response?.status === 404 && retryCount < maxRetries) {
          console.log(`⏳ Retrying in ${retryDelay}ms... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            fetchResult(retryCount + 1);
          }, retryDelay);
        } else {
          // Final error after all retries or non-404 error
          const errorMessage = retryCount >= maxRetries
            ? `Result not found after ${maxRetries + 1} attempts. The analysis may still be processing.`
            : err.response?.data?.message || 'Failed to load results';
          setError(errorMessage);
        }
      }
    };

    if (resultId) {
      fetchResult();
    } else {
      navigate('/dashboard');
    }
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



  const renderPersonaProfile = (personaProfile) => {
    if (!personaProfile) {
      return <p className="text-gray-600">No persona profile available.</p>;
    }

    const getProspectColor = (level) => {
      const colors = {
        'super high': 'text-green-600 bg-green-100',
        'high': 'text-green-500 bg-green-50',
        'moderate': 'text-yellow-600 bg-yellow-100',
        'low': 'text-orange-600 bg-orange-100',
        'super low': 'text-red-600 bg-red-100'
      };
      return colors[level] || 'text-gray-600 bg-gray-100';
    };

    const formatProspectLabel = (key) => {
      const labels = {
        jobAvailability: 'Job Availability',
        salaryPotential: 'Salary Potential',
        careerProgression: 'Career Progression',
        industryGrowth: 'Industry Growth',
        skillDevelopment: 'Skill Development'
      };
      return labels[key] || key;
    };

    return (
      <div className="space-y-8">
        {/* Archetype & Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl shadow-lg border border-indigo-100"
        >
          <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            {personaProfile.archetype}
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg">
            {personaProfile.shortSummary}
          </p>
        </motion.div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-lg border border-green-100 h-full"
          >
            <h4 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Strengths
            </h4>
            {personaProfile.strengthSummary && (
              <p className="text-green-700 mb-4 text-sm italic bg-white p-3 rounded-lg">
                {personaProfile.strengthSummary}
              </p>
            )}
            <ul className="space-y-3">
              {personaProfile.strengths?.map((strength, idx) => (
                <li key={idx} className="text-gray-700 flex items-start bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-green-500 mr-3 text-lg">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl shadow-lg border border-orange-100 h-full"
          >
            <h4 className="text-xl font-semibold text-orange-700 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Areas for Development
            </h4>
            {personaProfile.weaknessSummary && (
              <p className="text-orange-700 mb-4 text-sm italic bg-white p-3 rounded-lg">
                {personaProfile.weaknessSummary}
              </p>
            )}
            <ul className="space-y-3">
              {personaProfile.weaknesses?.map((weakness, idx) => (
                <li key={idx} className="text-gray-700 flex items-start bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-orange-500 mr-3 text-lg">⚡</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Career Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl shadow-lg border border-blue-100"
        >
          <h4 className="text-2xl font-semibold text-gray-800 mb-8 flex items-center">
            <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1zm-3 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Career Recommendations
          </h4>
          <div className="grid gap-6">
            {personaProfile.careerRecommendation?.map((career, idx) => (
              <div key={idx} className="bg-white border border-blue-200 rounded-xl p-6 shadow-md">
                <h5 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  {career.careerName}
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(career.careerProspect || {}).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className={`px-3 py-2 rounded-full text-xs font-semibold shadow-sm ${getProspectColor(value)}`}>
                        {value}
                      </div>
                      <div className="text-xs text-gray-600 mt-2 font-medium">
                        {formatProspectLabel(key)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Development Insights & Skills/Pitfalls Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Development Insights */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
            <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Development Insights
            </h4>
            <ul className="space-y-3">
              {personaProfile.insights?.map((insight, idx) => (
                <li key={idx} className="text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">💡</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Skill Suggestions */}
          {personaProfile.skillSuggestion && personaProfile.skillSuggestion.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
              <h4 className="text-lg font-semibold text-teal-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recommended Skills to Develop
              </h4>
              <div className="flex flex-wrap gap-2">
                {personaProfile.skillSuggestion.map((skill, idx) => (
                  <span key={idx} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Possible Pitfalls - Full Width */}
        {personaProfile.possiblePitfalls && personaProfile.possiblePitfalls.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Potential Pitfalls to Avoid
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {personaProfile.possiblePitfalls.map((pitfall, idx) => (
                <div key={idx} className="text-gray-700 flex items-start bg-red-50 p-3 rounded-lg">
                  <span className="text-red-500 mr-2">⚠️</span>
                  {pitfall}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Tolerance */}
        {personaProfile.riskTolerance && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
              </svg>
              Risk Tolerance
            </h4>
            <div className="flex items-center">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                personaProfile.riskTolerance === 'high' ? 'bg-red-100 text-red-800' :
                personaProfile.riskTolerance === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {personaProfile.riskTolerance.charAt(0).toUpperCase() + personaProfile.riskTolerance.slice(1)} Risk Tolerance
              </span>
            </div>
          </div>
        )}

        {/* Work Environment & Role Models */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Work Environment */}
          {personaProfile.workEnvironment && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
              <h4 className="text-lg font-semibold text-purple-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
                Ideal Work Environment
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {personaProfile.workEnvironment}
              </p>
            </div>
          )}

          {/* Role Models */}
          {personaProfile.roleModel && personaProfile.roleModel.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
              <h4 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Inspirational Role Models
              </h4>
              <div className="flex flex-wrap gap-2">
                {personaProfile.roleModel.map((model, idx) => (
                  <span key={idx} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
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

  const renderAssessmentData = (assessmentData) => {
    if (!assessmentData) return null;

    return (
      <div className="space-y-12">
        {/* Assessment Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* RIASEC Section */}
          {assessmentData.riasec && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <RiasecRadarChart data={assessmentData.riasec} />
            </motion.div>
          )}

          {/* OCEAN Section */}
          {assessmentData.ocean && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <OceanBarChart data={assessmentData.ocean} />
            </motion.div>
          )}
        </div>

        {/* VIA-IS Section - Full Width */}
        {assessmentData.viaIs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ViaisChart data={assessmentData.viaIs} />
          </motion.div>
        )}

        {/* Assessment Explanations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AssessmentExplanations />
        </motion.div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Unable to Load Results</h3>
                <div className="mt-2 text-sm text-red-700">
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
                    className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-100 text-gray-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
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
              className="mb-8"
            >
              <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Hasil Assessment
                </h1>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors duration-200 shadow-lg"
                >
                  Back to Dashboard
                </button>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>Completed: {formatDate(result.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      result.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'
                    }`}></div>
                    <span>Status: <span className="capitalize font-medium">{result.status}</span></span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Persona Profile - Moved up for better flow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
                  Profil Karier Detail Anda
                </h2>
                {renderPersonaProfile(result.persona_profile)}
              </motion.div>

              {/* Assessment Data */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
                  Wawasan Assessment
                </h2>
                {renderAssessmentData(result.assessment_data)}
              </motion.div>
            </div>
          </>
        )}
      </main>

      {/* Chatbot Component */}
      {result && <Chatbot assessmentId={resultId} />}

    </div>
  );
};

export default ResultsPage;
