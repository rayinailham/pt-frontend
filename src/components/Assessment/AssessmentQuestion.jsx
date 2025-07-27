
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
    <div className="bg-white border border-gray-200 p-8 mb-6 hover:border-gray-300 transition-all duration-200">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 border border-gray-200">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 leading-relaxed tracking-tight">
          {question}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-xs text-gray-600 mb-3 font-medium">
          <span>{scaleConfig.labels[0]}</span>
          <span>{scaleConfig.labels[scaleConfig.labels.length - 1]}</span>
        </div>

        <div className="flex justify-between items-center space-x-2">
          {Array.from({ length: scaleConfig.max - scaleConfig.min + 1 }, (_, i) => {
            const scaleValue = scaleConfig.min + i;
            const isSelected = value === scaleValue;

            return (
              <button
                key={scaleValue}
                onClick={() => onChange(scaleValue)}
                className={`
                  flex-1 h-12 border-2 transition-all duration-200 font-semibold text-sm
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
