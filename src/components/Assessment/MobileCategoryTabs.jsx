import { Check } from 'lucide-react';

const MobileCategoryTabs = ({
  assessmentData,
  answers,
  currentPage,
  setCurrentPage
}) => {
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

  const categories = Object.entries(assessmentData.categories);

  return (
    <div className="lg:hidden bg-white border-b border-gray-200">
      <div className="px-3 sm:px-4 py-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>

        {/* Horizontal scrollable tabs */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(([categoryKey, category], index) => {
            const progress = getCategoryProgress(categoryKey);
            const isActive = index === currentPage;
            const isCompleted = progress.answered === progress.total;
            const hasProgress = progress.answered > 0;

            return (
              <button
                key={categoryKey}
                onClick={() => setCurrentPage(index)}
                className={`flex-shrink-0 px-2 sm:px-3 md:px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-900 text-white border-gray-900'
                    : isCompleted
                    ? 'bg-green-50 text-green-800 border-green-200'
                    : hasProgress
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {isCompleted && !isActive && (
                    <Check className="h-3 w-3 flex-shrink-0" />
                  )}
                  <span className="whitespace-nowrap text-xs sm:text-sm">
                    {category.name}
                  </span>
                  <span className={`text-xs px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0 ${
                    isActive
                      ? 'bg-white bg-opacity-20 text-white'
                      : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : hasProgress
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {progress.answered}/{progress.total}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileCategoryTabs;
