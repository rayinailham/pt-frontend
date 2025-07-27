
const AssessmentQuestion = ({
  question,
  questionIndex,
  totalQuestions,
  scale,
  value,
  onChange,
  isReverse = false
}) => {
  // Convert scale array to min/max format for button-based selection
  const scaleConfig = {
    min: Math.min(...scale.map(s => s.value)),
    max: Math.max(...scale.map(s => s.value)),
    labels: scale.map(s => s.label)
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 hover:shadow-md transition-shadow duration-200">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          {isReverse && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              Reverse scored
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
          {question}
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
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
                  flex-1 h-12 rounded-lg border-2 transition-all duration-200 font-medium text-sm
                  ${isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
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
