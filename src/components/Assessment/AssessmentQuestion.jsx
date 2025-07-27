
const AssessmentQuestion = ({
  question,
  questionIndex,
  totalQuestions,
  scale,
  value,
  onChange
}) => {
  // Convert scale array to min/max format for button-based selection
  const scaleConfig = {
    min: Math.min(...scale.map(s => s.value)),
    max: Math.max(...scale.map(s => s.value)),
    labels: scale.map(s => s.label)
  };

  return (
    <div className="bg-white border border-gray-200 p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 hover:border-gray-300 transition-all duration-200">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 sm:px-3 py-1 border border-gray-200 rounded">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 leading-relaxed tracking-tight">
          {question}
        </h3>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-between text-xs text-gray-600 mb-2 sm:mb-3 font-medium px-1">
          <span className="text-left">{scaleConfig.labels[0]}</span>
          <span className="text-right">{scaleConfig.labels[scaleConfig.labels.length - 1]}</span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 w-full">
          {Array.from({ length: scaleConfig.max - scaleConfig.min + 1 }, (_, i) => {
            const scaleValue = scaleConfig.min + i;
            const isSelected = value === scaleValue;

            return (
              <button
                key={scaleValue}
                onClick={() => onChange(scaleValue)}
                className={`
                  h-10 sm:h-12 border-2 transition-all duration-200 font-semibold text-xs sm:text-sm rounded
                  flex items-center justify-center w-full
                  ${isSelected
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }
                `}
              >
                {scaleValue}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuestion;
