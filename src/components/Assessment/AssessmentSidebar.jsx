import { ChevronRight, ChevronDown, Flag, Home, Zap, RotateCcw, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { viaQuestions, riasecQuestions, bigFiveQuestions } from '../../data/assessmentQuestions';

const AssessmentSidebar = ({
  assessmentData,
  answers,
  currentPage,
  setCurrentPage,
  currentStep,
  totalSteps,
  currentAssessmentType, // Add this prop to know which assessment we're in
  onNavigateToPhase, // New prop for phase navigation
  overallProgress, // Add this prop for total progress across all assessments
  flaggedQuestions, // Add this prop for flagged questions
  onFillRandomAnswers, // Function to fill current assessment
  onFillAllAssessments, // Function to fill all assessments
  onSubmit, // Function to submit assessment
  isAllComplete, // Boolean indicating if all assessments are complete
  isSubmitting // Boolean indicating if submission is in progress
}) => {
  const navigate = useNavigate();

  // Check if autofill is enabled via environment variable
  const isAutofillEnabled = import.meta.env.VITE_ENABLE_AUTOFILL === 'true';

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  // Assessment data mapping for progress calculation
  const assessmentDataMap = {
    via: viaQuestions,
    riasec: riasecQuestions,
    bigFive: bigFiveQuestions
  };

  // Define assessment phases mapping (ordered to match actual flow)
  const assessmentPhases = [
    {
      id: 1,
      title: "Phase 1",
      subtitle: "VIA Character Strengths",
      assessmentKey: "via",
      step: 1, // VIA is step 1 in the flow
      totalQuestions: 96
    },
    {
      id: 2,
      title: "Phase 2",
      subtitle: "RIASEC Holland Codes",
      assessmentKey: "riasec",
      step: 2, // RIASEC is step 2 in the flow
      totalQuestions: 60
    },
    {
      id: 3,
      title: "Phase 3",
      subtitle: "OCEAN Personality",
      assessmentKey: "bigFive",
      step: 3, // Big Five is step 3 in the flow
      totalQuestions: 44
    }
  ];

  // Calculate progress for any phase based on its assessment data
  const calculatePhaseProgress = (phaseAssessmentKey) => {
    const phaseData = assessmentDataMap[phaseAssessmentKey];
    if (!phaseData) return { answered: 0, total: 0 };

    let totalQuestions = 0;
    let answeredQuestions = 0;

    Object.entries(phaseData.categories).forEach(([categoryKey, category]) => {
      // Count regular questions
      category.questions.forEach((_, index) => {
        totalQuestions++;
        const questionKey = `${phaseAssessmentKey}_${categoryKey}_${index}`;
        if (answers[questionKey] !== undefined) {
          answeredQuestions++;
        }
      });

      // Count reverse questions (for Big Five)
      if (category.reverseQuestions) {
        category.reverseQuestions.forEach((_, index) => {
          totalQuestions++;
          const questionKey = `${phaseAssessmentKey}_${categoryKey}_reverse_${index}`;
          if (answers[questionKey] !== undefined) {
            answeredQuestions++;
          }
        });
      }
    });

    return { answered: answeredQuestions, total: totalQuestions };
  };

  // Calculate category progress
  const getCategoryProgress = (categoryKey) => {
    const category = assessmentData.categories[categoryKey];
    if (!category) return { answered: 0, total: 0 };

    let total = category.questions.length;
    if (category.reverseQuestions) {
      total += category.reverseQuestions.length;
    }

    let answered = 0;
    // Count regular questions - use correct format with assessmentType
    category.questions.forEach((_, index) => {
      const questionKey = `${currentAssessmentType}_${categoryKey}_${index}`;
      if (answers[questionKey] !== undefined) answered++;
    });

    // Count reverse questions - use correct format with assessmentType
    if (category.reverseQuestions) {
      category.reverseQuestions.forEach((_, index) => {
        const questionKey = `${currentAssessmentType}_${categoryKey}_reverse_${index}`;
        if (answers[questionKey] !== undefined) answered++;
      });
    }

    return { answered, total };
  };

  // Calculate total progress for current assessment
  const getTotalProgress = () => {
    const allQuestions = [];
    Object.entries(assessmentData.categories).forEach(([categoryKey, category]) => {
      // Regular questions - use correct format with assessmentType
      category.questions.forEach((_, index) => {
        allQuestions.push(`${currentAssessmentType}_${categoryKey}_${index}`);
      });

      // Reverse questions - use correct format with assessmentType
      if (category.reverseQuestions) {
        category.reverseQuestions.forEach((_, index) => {
          allQuestions.push(`${currentAssessmentType}_${categoryKey}_reverse_${index}`);
        });
      }
    });

    const answered = allQuestions.filter(questionKey => answers[questionKey] !== undefined).length;
    return { answered, total: allQuestions.length };
  };

  // Navigate to category (now category-based instead of question-based)
  const navigateToCategory = (categoryKey) => {
    const categories = Object.keys(assessmentData.categories);
    const categoryIndex = categories.findIndex(key => key === categoryKey);

    if (categoryIndex !== -1) {
      setCurrentPage(categoryIndex);
    }
  };

  // Navigate to specific phase
  const navigateToPhase = (phaseStep) => {
    if (onNavigateToPhase && phaseStep !== currentStep) {
      onNavigateToPhase(phaseStep);
    }
  };

  const totalProgress = getTotalProgress();

  // Navigate to specific question within a category
  const navigateToQuestion = (categoryKey, questionIndex, isReverse = false) => {
    const categories = Object.keys(assessmentData.categories);
    const categoryIndex = categories.findIndex(key => key === categoryKey);

    if (categoryIndex !== -1) {
      setCurrentPage(categoryIndex);
      // Scroll to specific question if needed
      setTimeout(() => {
        const questionId = isReverse
          ? `question-${currentAssessmentType}_${categoryKey}_reverse_${questionIndex}`
          : `question-${currentAssessmentType}_${categoryKey}_${questionIndex}`;
        const questionElement = document.getElementById(questionId);
        if (questionElement) {
          questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Get question status for quick navigation
  const getQuestionStatus = (categoryKey, questionIndex, isReverse = false) => {
    const questionKey = isReverse
      ? `${currentAssessmentType}_${categoryKey}_reverse_${questionIndex}`
      : `${currentAssessmentType}_${categoryKey}_${questionIndex}`;
    return answers[questionKey] !== undefined;
  };

  // Get question flag status
  const getQuestionFlagStatus = (categoryKey, questionIndex, isReverse = false) => {
    const questionKey = isReverse
      ? `${currentAssessmentType}_${categoryKey}_reverse_${questionIndex}`
      : `${currentAssessmentType}_${categoryKey}_${questionIndex}`;
    return !!flaggedQuestions[questionKey];
  };

  return (
    <div id="assessment-sidebar" className="hidden lg:block fixed right-0 top-0 h-full w-90 bg-white border-l border-gray-300 overflow-y-auto z-20 shadow-lg rounded-l-xl">
      <div id="sidebar-container" className="p-3 h-full flex flex-col">
        {/* Phase Structure */}
        <div id="sidebar-main-content" className="flex-1">
          <div id="sidebar-header" className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
            <h3 className="text-base font-bold text-gray-900">
              Assessment Progress
            </h3>
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 group transform hover:scale-105"
              aria-label="Back to Dashboard"
              title="Back to Dashboard"
            >
              <Home className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden xl:inline font-medium">Dashboard</span>
            </button>
          </div>

          <div id="assessment-phases-list" className="space-y-2">
            {assessmentPhases.map((phase) => {
              const isCurrentPhase = phase.step === currentStep;
              // Calculate actual progress for each phase
              const phaseProgress = isCurrentPhase ? totalProgress : calculatePhaseProgress(phase.assessmentKey);
              const progressPercentage = phaseProgress.total > 0 ? (phaseProgress.answered / phaseProgress.total) * 100 : 0;

              return (
                <div key={phase.id} id={`phase-${phase.id}`} className={`border rounded-xl transition-all duration-200 ${isCurrentPhase ? 'border-gray-400 bg-gray-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}`}>
                  <button
                    onClick={() => navigateToPhase(phase.step)}
                    className={`w-full text-left transition-all duration-200`}
                    disabled={isCurrentPhase}
                  >
                    <div id={`phase-${phase.id}-content`} className="p-2">
                      <div id={`phase-${phase.id}-header`} className="flex items-center justify-between mb-1.5">
                        <div id={`phase-${phase.id}-info`} className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold truncate ${isCurrentPhase ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'}`}>
                            {phase.title}
                          </h4>
                          <p className={`text-xs truncate ${isCurrentPhase ? 'text-gray-600' : 'text-gray-500 hover:text-gray-600'}`}>
                            {phase.subtitle}
                          </p>
                        </div>
                        <div id={`phase-${phase.id}-stats`} className="flex items-center space-x-1.5 ml-2">
                          <div className={`text-xs font-semibold ${isCurrentPhase ? 'text-gray-900' : 'text-gray-500'}`}>
                            {phaseProgress.answered}/{phaseProgress.total}
                          </div>
                          {!isCurrentPhase && (
                            <ChevronRight className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:translate-x-1" />
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div id={`phase-${phase.id}-progress-bar`} className="w-full bg-gray-200 h-1 rounded-full">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${isCurrentPhase ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gray-600'}`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>

                  {/* Categories for current phase */}
                  {isCurrentPhase && (
                    <div id={`phase-${phase.id}-categories`} className="mt-2 space-y-1">
                      {Object.entries(assessmentData.categories).map(([categoryKey, category]) => {
                        const isCurrentCategory = Object.keys(assessmentData.categories)[currentPage] === categoryKey;
                        const categoryProgress = getCategoryProgress(categoryKey);

                        return (
                          <div key={categoryKey} id={`category-${categoryKey}`} className="border border-gray-200 bg-white overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                            {/* Category Header */}
                            <button
                              onClick={() => navigateToCategory(categoryKey)}
                              className={`w-full text-left p-1.5 transition-all duration-200 group ${
                                isCurrentCategory
                                  ? 'bg-gray-50'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div id={`category-${categoryKey}-header`} className="flex items-center justify-between">
                                <div id={`category-${categoryKey}-name`} className="flex items-center min-w-0 flex-1">
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {category.name}
                                  </span>
                                </div>
                                <div id={`category-${categoryKey}-stats`} className="flex items-center space-x-1.5 ml-2">
                                  <span className="text-xs font-semibold text-gray-600">
                                    {categoryProgress.answered}/{categoryProgress.total}
                                  </span>
                                  {isCurrentCategory ? (
                                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:translate-x-1" />
                                  )}
                                </div>
                              </div>
                            </button>

                            {/* Quick Navigation Grid */}
                            {isCurrentCategory && (
                              <div id={`category-${categoryKey}-navigation`} className="border-t border-gray-100 bg-gradient-to-br from-slate-50 to-gray-50 p-3">
                                <div id={`category-${categoryKey}-questions-grid`} className="grid grid-cols-6 gap-1">
                                  {/* Regular Questions */}
                                  {category.questions.map((_, questionIndex) => {
                                    const isAnswered = getQuestionStatus(categoryKey, questionIndex);
                                    const isFlagged = getQuestionFlagStatus(categoryKey, questionIndex);
                                    return (
                                      <button
                                        key={`q-${questionIndex}`}
                                        id={`question-btn-${categoryKey}-${questionIndex}`}
                                        onClick={() => navigateToQuestion(categoryKey, questionIndex)}
                                        className={`group relative h-10 w-full aspect-square rounded-lg text-xs font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                          isAnswered
                                            ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md hover:shadow-lg focus:ring-slate-400'
                                            : 'bg-white text-slate-700 border border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-md hover:bg-slate-50 focus:ring-slate-300'
                                        }`}
                                        title={`Question ${questionIndex + 1}${isFlagged ? ' (Flagged)' : ''}`}
                                      >
                                        <span className="relative z-10">{questionIndex + 1}</span>
                                        {isAnswered && (
                                          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent rounded-lg"></div>
                                        )}
                                        {isFlagged && (
                                          <Flag className="absolute -top-0.5 -right-0.5 h-3 w-3 text-red-500 fill-current" />
                                        )}
                                      </button>
                                    );
                                  })}

                                  {/* Reverse Questions (for Big Five) */}
                                  {category.reverseQuestions && category.reverseQuestions.map((_, questionIndex) => {
                                    const isAnswered = getQuestionStatus(categoryKey, questionIndex, true);
                                    const isFlagged = getQuestionFlagStatus(categoryKey, questionIndex, true);
                                    const questionNumber = category.questions.length + questionIndex + 1;
                                    return (
                                      <button
                                        key={`r-${questionIndex}`}
                                        id={`question-btn-${categoryKey}-reverse-${questionIndex}`}
                                        onClick={() => navigateToQuestion(categoryKey, questionIndex, true)}
                                        className={`group relative h-10 w-full aspect-square rounded-lg text-xs font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                          isAnswered
                                            ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md hover:shadow-lg focus:ring-slate-400'
                                            : 'bg-white text-slate-700 border border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-md hover:bg-slate-50 focus:ring-slate-300'
                                        }`}
                                        title={`Question ${questionNumber}${isFlagged ? ' (Flagged)' : ''}`}
                                      >
                                        <span className="relative z-10">{questionNumber}</span>
                                        {isAnswered && (
                                          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent rounded-lg"></div>
                                        )}
                                        {isFlagged && (
                                          <Flag className="absolute -top-0.5 -right-0.5 h-3 w-3 text-red-500 fill-current" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section - Fixed to bottom */}
        <div id="sidebar-bottom-section" className="mt-auto pt-3 border-t border-gray-300">
          {/* Submit Assessment Button - Only show when all assessments are complete */}
          {isAllComplete && (
            <div id="submit-section" className="mb-4">
              <button
                id="submit-assessment-btn"
                onClick={onSubmit}
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg ${
                  !isSubmitting
                    ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 hover:shadow-xl hover:brightness-110 transform hover:scale-105 active:scale-95"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
                title="Submit your assessment"
              >
                <Send className={`h-5 w-5 transition-transform duration-200 ${isSubmitting ? 'animate-pulse' : 'group-hover:translate-x-1'}`} />
                <span className={isSubmitting ? 'animate-pulse' : ''}>
                  {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                </span>
              </button>
            </div>
          )}

          {/* Overall Progress - Now second */}
          <div id="overall-progress-section" className="text-center pt-3 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Overall Progress</h4>
            <div id="overall-progress-bar" className="w-full bg-gray-200 h-2.5 rounded-full">
              <div
                className="bg-gradient-to-r from-gray-800 to-gray-900 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${overallProgress ? overallProgress.percentage : 0}%` }}
              ></div>
            </div>
            <div id="overall-progress-percentage" className="text-sm text-gray-700 mt-2 font-semibold">
              {overallProgress ? overallProgress.percentage : 0}% Complete
            </div>
            <div id="overall-progress-count" className="text-xs text-gray-500 mt-1">
              {overallProgress ? `${overallProgress.totalAnswered}/${overallProgress.totalQuestions}` : '0/0'} questions answered
            </div>
          </div>

          {/* Development Tools */}
          {isAutofillEnabled && (
            <div id="autofill-section" className="mt-4 pt-3 border-t border-gray-200">
              <div id="autofill-header" className="text-center mb-2">
                <h5 className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                  Quick Fill Tools
                </h5>
              </div>
              <div id="autofill-buttons" className="space-y-2">
                {/* Fill Current Assessment Button */}
                <button
                  id="fill-current-btn"
                  onClick={onFillRandomAnswers}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 group transform hover:scale-105 active:scale-95"
                  title="Fill current assessment with random answers"
                >
                  <Zap className="h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                  <span>Fill Current</span>
                </button>

                {/* Fill All Assessments Button */}
                <button
                  id="fill-all-btn"
                  onClick={onFillAllAssessments}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 group transform hover:scale-105 active:scale-95"
                  title="Fill all assessments with random answers"
                >
                  <RotateCcw className="h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                  <span>Fill All</span>
                </button>
              </div>
              <div id="autofill-disclaimer" className="text-xs text-orange-500 mt-2 text-center font-medium">
                Quick testing tools
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentSidebar;