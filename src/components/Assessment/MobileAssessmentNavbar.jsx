import { Menu, ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileAssessmentNavbar = ({
  assessmentData,
  currentStep,
  totalSteps,
  answers,
  currentAssessmentType,
  onTogglePhaseMenu,
  onFillAllAssessments
}) => {
  const navigate = useNavigate();

  // Check if autofill is enabled via environment variable
  const isAutofillEnabled = import.meta.env.VITE_ENABLE_AUTOFILL === 'true';

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  // Define assessment phases mapping
  const assessmentPhases = [
    {
      id: 1,
      title: "Phase 1",
      subtitle: "VIA Character Strengths",
      assessmentKey: "via",
      step: 1,
      totalQuestions: 96
    },
    {
      id: 2,
      title: "Phase 2", 
      subtitle: "RIASEC Holland Codes",
      assessmentKey: "riasec",
      step: 2,
      totalQuestions: 60
    },
    {
      id: 3,
      title: "Phase 3",
      subtitle: "OCEAN Personality", 
      assessmentKey: "bigFive",
      step: 3,
      totalQuestions: 44
    }
  ];

  // Calculate total progress for current phase
  const getTotalProgress = () => {
    if (!assessmentData?.categories) return { answered: 0, total: 0 };

    let totalAnswered = 0;
    let totalQuestions = 0;

    Object.entries(assessmentData.categories).forEach(([categoryKey, category]) => {
      // Count regular questions - use correct format with assessmentType
      totalQuestions += category.questions.length;
      category.questions.forEach((_, index) => {
        const questionKey = `${currentAssessmentType}_${categoryKey}_${index}`;
        if (answers[questionKey] !== undefined) totalAnswered++;
      });

      // Count reverse questions - use correct format with assessmentType
      if (category.reverseQuestions) {
        totalQuestions += category.reverseQuestions.length;
        category.reverseQuestions.forEach((_, index) => {
          const questionKey = `${currentAssessmentType}_${categoryKey}_reverse_${index}`;
          if (answers[questionKey] !== undefined) totalAnswered++;
        });
      }
    });

    return { answered: totalAnswered, total: totalQuestions };
  };

  const currentPhase = assessmentPhases.find(phase => phase.step === currentStep);
  const progress = getTotalProgress();
  const progressPercentage = progress.total > 0 ? (progress.answered / progress.total) * 100 : 0;

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm rounded-b-xl">
      <div className="px-3 sm:px-4 py-3 sm:py-4">
        {/* Header Layout: Back Button | Title & Subtitle | Menu Button */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 mb-3">
          {/* Back to Dashboard Button */}
          <button
            onClick={handleBackToDashboard}
            className="p-2 bg-gray-100 border border-gray-200 rounded-lg flex-shrink-0 hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 active:scale-95 group"
            aria-label="Back to Dashboard"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4 text-gray-700 group-hover:text-gray-900 transition-transform duration-200 group-hover:-translate-x-1" />
          </button>

          {/* Title and Subtitle */}
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight truncate">
              {currentPhase?.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
              {currentPhase?.subtitle}
            </p>
          </div>

          {/* Menu Button */}
          <button
            onClick={onTogglePhaseMenu}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0 transform hover:scale-105 active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          {/* Progress Info */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-700">
              Assessment {currentStep} of {totalSteps}
            </span>
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
              {progress.answered}/{progress.total}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-gray-800 to-gray-900 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAssessmentNavbar;
