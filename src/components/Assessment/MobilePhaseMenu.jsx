import { ChevronRight, X } from 'lucide-react';

const MobilePhaseMenu = ({
  currentStep,
  onNavigateToPhase,
  onClose,
  isOpen
}) => {
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

  const handleNavigateToPhase = (phaseStep) => {
    if (onNavigateToPhase) {
      onNavigateToPhase(phaseStep);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      
      {/* Menu */}
      <div className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out rounded-l-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Assessment Phases
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Phase list */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {assessmentPhases.map((phase) => {
                const isCurrentPhase = phase.step === currentStep;

                return (
                  <div
                    key={phase.id}
                    className={`border rounded-xl p-4 transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md ${
                      isCurrentPhase
                        ? 'border-gray-400 bg-gray-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => handleNavigateToPhase(phase.step)}
                      className="w-full text-left transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className={`font-semibold ${
                            isCurrentPhase
                              ? 'text-gray-900'
                              : 'text-gray-700 hover:text-gray-900'
                          }`}>
                            {phase.title}
                          </h4>
                          <p className={`text-sm ${
                            isCurrentPhase
                              ? 'text-gray-700'
                              : 'text-gray-600 hover:text-gray-700'
                          }`}>
                            {phase.subtitle}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`text-sm font-medium ${
                            isCurrentPhase
                              ? 'text-gray-900'
                              : 'text-gray-500'
                          }`}>
                            {phase.totalQuestions} questions
                          </div>
                          {!isCurrentPhase && (
                            <ChevronRight className="h-4 w-4 text-gray-500 transition-transform duration-200 group-hover:translate-x-1" />
                          )}
                          {isCurrentPhase && (
                            <div className="w-2 h-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Navigate between assessment phases
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobilePhaseMenu;
