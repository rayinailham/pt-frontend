import { ChevronRight, Flag, Home } from 'lucide-react';
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
  flaggedQuestions // Add this prop for flagged questions
}) => {
  const navigate = useNavigate();

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
    <div className="hidden lg:block fixed right-0 top-0 h-full w-90 bg-white border-l border-gray-300 overflow-y-auto z-20 shadow-lg">
      <div className="p-3 h-full flex flex-col">
        {/* Phase Structure */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
            <h3 className="text-base font-bold text-gray-900">
              Assessment Progress
            </h3>
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-200 border border-gray-200 hover:border-gray-300 group"
              aria-label="Back to Dashboard"
              title="Back to Dashboard"
            >
              <Home className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden xl:inline font-medium">Dashboard</span>
            </button>
          </div>

          <div className="space-y-2">
            {assessmentPhases.map((phase) => {
              const isCurrentPhase = phase.step === currentStep;
              // Calculate actual progress for each phase
              const phaseProgress = isCurrentPhase ? totalProgress : calculatePhaseProgress(phase.assessmentKey);
              const progressPercentage = phaseProgress.total > 0 ? (phaseProgress.answered / phaseProgress.total) * 100 : 0;

              return (
                <div key={phase.id} className={`border rounded-2xs transition-all duration-200 ${isCurrentPhase ? 'border-gray-400 bg-gray-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}>
                  <button
                    onClick={() => navigateToPhase(phase.step)}
                    className={`w-full text-left transition-all duration-200`}
                    disabled={isCurrentPhase}
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold truncate ${isCurrentPhase ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'}`}>
                            {phase.title}
                          </h4>
                          <p className={`text-xs truncate ${isCurrentPhase ? 'text-gray-600' : 'text-gray-500 hover:text-gray-600'}`}>
                            {phase.subtitle}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          <div className={`text-xs font-semibold ${isCurrentPhase ? 'text-gray-900' : 'text-gray-500'}`}>
                            {phaseProgress.answered}/{phaseProgress.total}
                          </div>
                          {!isCurrentPhase && (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 h-1.5 rounded-2xs">
                        <div
                          className={`h-1.5 rounded-2xs transition-all duration-300 ${isCurrentPhase ? 'bg-gray-800' : 'bg-gray-600'}`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>

                  {/* Categories for current phase */}
                  {isCurrentPhase && (
                    <div className="mt-3 space-y-1">
                      {Object.entries(assessmentData.categories).map(([categoryKey, category]) => {
                        const isCurrentCategory = Object.keys(assessmentData.categories)[currentPage] === categoryKey;
                        const categoryProgress = getCategoryProgress(categoryKey);

                        return (
                          <div key={categoryKey} className="border border-gray-200 bg-white overflow-hidden rounded-2xs">
                            {/* Category Header */}
                            <button
                              onClick={() => navigateToCategory(categoryKey)}
                              className={`w-full text-left p-2 transition-all duration-200 ${
                                isCurrentCategory
                                  ? 'bg-gray-50'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center min-w-0 flex-1">
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {category.name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 ml-2">
                                  <span className="text-xs font-semibold text-gray-600">
                                    {categoryProgress.answered}/{categoryProgress.total}
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                              </div>
                            </button>

                            {/* Quick Navigation Grid */}
                            {isCurrentCategory && (
                              <div className="border-t border-gray-100 bg-gradient-to-br from-slate-50 to-gray-50 p-4">
                                <div className="grid grid-cols-5 gap-2.5">
                                  {/* Regular Questions */}
                                  {category.questions.map((_, questionIndex) => {
                                    const isAnswered = getQuestionStatus(categoryKey, questionIndex);
                                    const isFlagged = getQuestionFlagStatus(categoryKey, questionIndex);
                                    return (
                                      <button
                                        key={`q-${questionIndex}`}
                                        onClick={() => navigateToQuestion(categoryKey, questionIndex)}
                                        className={`group relative h-9 w-9 rounded-2xs text-xs font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                          isAnswered
                                            ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg hover:shadow-xl focus:ring-slate-400'
                                            : 'bg-white text-slate-600 border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md hover:bg-slate-50 focus:ring-slate-300'
                                        }`}
                                        title={`Question ${questionIndex + 1}${isFlagged ? ' (Flagged)' : ''}`}
                                      >
                                        <span className="relative z-10">{questionIndex + 1}</span>
                                        {isAnswered && (
                                          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent rounded-2xs"></div>
                                        )}
                                        {isFlagged && (
                                          <Flag className="absolute -top-1 -right-1 h-3 w-3 text-red-500 fill-current" />
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
                                        onClick={() => navigateToQuestion(categoryKey, questionIndex, true)}
                                        className={`group relative h-9 w-9 rounded-2xs text-xs font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                          isAnswered
                                            ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg hover:shadow-xl focus:ring-slate-400'
                                            : 'bg-white text-slate-600 border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md hover:bg-slate-50 focus:ring-slate-300'
                                        }`}
                                        title={`Question ${questionNumber}${isFlagged ? ' (Flagged)' : ''}`}
                                      >
                                        <span className="relative z-10">{questionNumber}</span>
                                        {isAnswered && (
                                          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent rounded-2xs"></div>
                                        )}
                                        {isFlagged && (
                                          <Flag className="absolute -top-1 -right-1 h-3 w-3 text-red-500 fill-current" />
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

        {/* Total Progress - Bottom Section */}
        <div className="mt-auto pt-3 border-t border-gray-300">
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Overall Progress</h4>
            <div className="w-full bg-gray-200 h-2.5 rounded-2xs">
              <div
                className="bg-gray-900 h-2.5 rounded-2xs transition-all duration-500 ease-out"
                style={{ width: `${overallProgress ? overallProgress.percentage : 0}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-700 mt-2 font-semibold">
              {overallProgress ? overallProgress.percentage : 0}% Complete
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {overallProgress ? `${overallProgress.totalAnswered}/${overallProgress.totalQuestions}` : '0/0'} questions answered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSidebar;