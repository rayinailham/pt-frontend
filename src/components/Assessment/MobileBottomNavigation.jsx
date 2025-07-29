import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const MobileBottomNavigation = ({
  currentPage,
  totalPages,
  currentStep,
  totalSteps,
  isLastAssessment,
  isAssessmentComplete,
  isProcessingSubmit,
  isAutoFillMode,
  onPreviousCategory,
  onNextCategory,
  onPrevious,
  onNextAssessment,
  onSubmitWithValidation,
  onManualSubmit,
  currentCategoryData
}) => {
  return (
    <div className="lg:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30 rounded-t-xl overflow-hidden">
      <div className="px-3 sm:px-4 py-3 sm:py-4">
        {/* Header - Category info */}
        <div className="text-center mb-3">
          <div className="text-sm font-semibold text-gray-900">
            {currentCategoryData?.name}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Category {currentPage + 1} of {totalPages}
          </div>
        </div>

        {/* Navigation Layout: Previous | Position | Next */}
        <div className="grid grid-cols-3 items-center gap-2 max-w-sm mx-auto overflow-hidden">
          {/* Previous Button */}
          <div className="flex justify-start overflow-hidden">
            {currentPage === 0 && currentStep > 1 ? (
              <button
                onClick={onPrevious}
                className="flex items-center space-x-1 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-md hover:border-gray-400 transition-all duration-200 group"
              >
                <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                <span className="text-xs font-medium hidden sm:inline">Prev</span>
              </button>
            ) : currentPage > 0 ? (
              <button
                onClick={onPreviousCategory}
                className="flex items-center space-x-1 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-md hover:border-gray-400 transition-all duration-200 group"
              >
                <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                <span className="text-xs font-medium hidden sm:inline">Prev</span>
              </button>
            ) : (
              <div></div>
            )}
          </div>

          {/* Center Position Indicator */}
          <div className="flex justify-center">
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentPage
                      ? 'bg-gray-900'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Next/Submit Button */}
          <div className="flex justify-end overflow-hidden">
            {/* Submit Assessment Button */}
            {currentPage === totalPages - 1 && isLastAssessment && !isAutoFillMode ? (
              <div className="relative group">
                <button
                  onClick={isAssessmentComplete() ? onSubmitWithValidation : undefined}
                  disabled={!isAssessmentComplete() || isProcessingSubmit}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isAssessmentComplete() && !isProcessingSubmit
                      ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 hover:shadow-lg hover:brightness-110'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  } ${isProcessingSubmit ? 'opacity-75 animate-pulse' : ''}`}
                >
                  <Check className={`h-4 w-4 ${isProcessingSubmit ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-semibold">
                    {isProcessingSubmit ? 'Submit...' : 'Submit'}
                  </span>
                </button>
                {!isAssessmentComplete() && !isProcessingSubmit && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    Selesaikan semua pertanyaan
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-800"></div>
                  </div>
                )}
              </div>
            ) : /* Manual Submit Button for Auto-Fill Mode */
            isAutoFillMode && isLastAssessment ? (
              <button
                onClick={onManualSubmit}
                disabled={isProcessingSubmit}
                className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Check className={`h-4 w-4 ${isProcessingSubmit ? 'animate-spin' : ''}`} />
                <span className="text-xs font-semibold">
                  {isProcessingSubmit ? 'Submit...' : 'Submit All'}
                </span>
              </button>
            ) : /* Next Assessment Button */
            currentPage === totalPages - 1 && !isLastAssessment ? (
              <button
                onClick={onNextAssessment}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl transition-all duration-200 bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 hover:shadow-lg hover:brightness-110 group"
              >
                <span className="text-xs font-semibold">Next</span>
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            ) : /* Next Category Button */
            currentPage < totalPages - 1 ? (
              <button
                onClick={onNextCategory}
                className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 hover:shadow-lg hover:brightness-110 transition-all duration-200 group"
              >
                <span className="text-xs font-semibold hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNavigation;