import { Clock, ChevronRight, Shuffle, Zap } from 'lucide-react';

const AssessmentSidebar = ({
  assessmentData,
  answers,
  currentPage,
  setCurrentPage,
  currentStep,
  onFillRandomAnswers,
  onFillAllAssessments,
  onNavigateToPhase // New prop for phase navigation
}) => {
  // Define assessment phases mapping (ordered to match actual flow)
  const assessmentPhases = [
    {
      id: 1,
      title: "Phase 1",
      subtitle: "VIAIS Character Strengths",
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

  // Calculate category progress
  const getCategoryProgress = (categoryKey) => {
    const category = assessmentData.categories[categoryKey];
    if (!category) return { answered: 0, total: 0 };
    
    let total = category.questions.length;
    if (category.reverseQuestions) {
      total += category.reverseQuestions.length;
    }
    
    let answered = 0;
    // Count regular questions
    category.questions.forEach((_, index) => {
      const questionKey = `${categoryKey}_${index}`;
      if (answers[questionKey] !== undefined) answered++;
    });
    
    // Count reverse questions
    if (category.reverseQuestions) {
      category.reverseQuestions.forEach((_, index) => {
        const questionKey = `${categoryKey}_reverse_${index}`;
        if (answers[questionKey] !== undefined) answered++;
      });
    }
    
    return { answered, total };
  };

  // Calculate total progress for current assessment
  const getTotalProgress = () => {
    const allQuestions = [];
    Object.entries(assessmentData.categories).forEach(([categoryKey, category]) => {
      // Regular questions
      category.questions.forEach((_, index) => {
        allQuestions.push(`${categoryKey}_${index}`);
      });
      
      // Reverse questions
      if (category.reverseQuestions) {
        category.reverseQuestions.forEach((_, index) => {
          allQuestions.push(`${categoryKey}_reverse_${index}`);
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

  return (
    <div className="hidden lg:block fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 overflow-y-auto z-20">
      <div className="p-6 h-full flex flex-col">
        {/* Assessment Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-3">
            <div className="p-2 bg-gray-100 border border-gray-200">
              <Clock className="h-4 w-4 text-gray-700" />
            </div>
            <span>Assessment Progress</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-4 bg-gray-50 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {totalProgress.answered}
              </div>
              <div className="text-xs text-gray-600 font-medium">Completed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">
                {totalProgress.total - totalProgress.answered}
              </div>
              <div className="text-xs text-gray-600 font-medium">Remaining</div>
            </div>
          </div>


        </div>

        {/* Phase Structure */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Assessment Structure
          </h3>

          <div className="space-y-3">
            {assessmentPhases.map((phase) => {
              const isCurrentPhase = phase.step === currentStep;
              // Show actual progress for current phase, total questions for others
              const phaseProgress = isCurrentPhase ? totalProgress : { answered: 0, total: phase.totalQuestions };

              return (
                <div key={phase.id} className={`border p-4 transition-all duration-200 ${isCurrentPhase ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <button
                    onClick={() => navigateToPhase(phase.step)}
                    className={`w-full text-left transition-all duration-200`}
                    disabled={isCurrentPhase}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className={`font-semibold ${isCurrentPhase ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'}`}>
                          {phase.title}
                        </h4>
                        <p className={`text-sm ${isCurrentPhase ? 'text-gray-700' : 'text-gray-600 hover:text-gray-700'}`}>
                          {phase.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`text-sm font-medium ${isCurrentPhase ? 'text-gray-900' : 'text-gray-500'}`}>
                          {phaseProgress.answered}/{phaseProgress.total}
                        </div>
                        {!isCurrentPhase && (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Categories for current phase */}
                  {isCurrentPhase && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(assessmentData.categories).map(([categoryKey, category]) => {
                        const categoryProgress = getCategoryProgress(categoryKey);
                        const isCompleted = categoryProgress.answered === categoryProgress.total;

                        return (
                          <button
                            key={categoryKey}
                            onClick={() => navigateToCategory(categoryKey)}
                            className={`w-full text-left p-3 border transition-all duration-200 ${
                              isCompleted
                                ? 'bg-gray-100 border-gray-300 text-gray-900'
                                : categoryProgress.answered > 0
                                ? 'bg-gray-50 border-gray-300 text-gray-800'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {category.name}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium">
                                  {categoryProgress.answered}/{categoryProgress.total}
                                </span>
                                <ChevronRight className="h-3 w-3" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Auto Fill Section */}
        {(import.meta.env.DEV || import.meta.env.VITE_ENABLE_AUTO_FILL) && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Quick Fill Options</span>
            </h4>
            <div className="space-y-2">
              {/* Fill Current Assessment */}
              <button
                onClick={onFillRandomAnswers}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
              >
                <Shuffle className="h-4 w-4" />
                <span>Fill Current Phase</span>
              </button>

              {/* Fill All Assessments */}
              <button
                onClick={() => onFillAllAssessments(true)} // Pass true to navigate to last question
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 text-sm font-medium"
              >
                <Zap className="h-4 w-4" />
                <span>Fill All 200 Questions</span>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Auto-filled answers can be edited manually
            </p>
          </div>
        )}

        {/* Total Progress - Bottom Section */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="text-center mb-4">
            <h4 className="text-base font-medium text-gray-900 mb-3">Current Phase Progress</h4>
            <div className="w-full bg-gray-200 h-3">
              <div
                className="bg-gray-900 h-3 transition-all duration-500 ease-out"
                style={{ width: `${totalProgress.total > 0 ? (totalProgress.answered / totalProgress.total) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-2 font-medium">
              {totalProgress.total > 0 ? Math.round((totalProgress.answered / totalProgress.total) * 100) : 0}% Complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSidebar;
