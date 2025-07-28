import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, BookOpen } from 'lucide-react';
import AssessmentQuestion from './AssessmentQuestion';
import AssessmentSidebar from './AssessmentSidebar';
import MobileAssessmentNavbar from './MobileAssessmentNavbar';
import MobileBottomNavigation from './MobileBottomNavigation';
import MobilePhaseMenu from './MobilePhaseMenu';

const AssessmentForm = ({
  assessmentData,
  onSubmit,
  onNext,
  onPrevious,
  isLastAssessment = false,
  currentStep = 1,
  totalSteps = 3,
  isProcessingSubmit = false,
  onFillAllAssessments,
  prefilledAnswers = null, // New prop for prefilled answers from auto fill
  isAutoFillMode = false, // Flag indicating auto-fill mode
  onManualSubmit, // Manual submit function for auto-fill mode
  onNavigateToPhase, // New prop for phase navigation
}) => {
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isPhaseMenuOpen, setIsPhaseMenuOpen] = useState(false);
  // Remove fixed questionsPerPage - we'll use category-based pagination

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Reset to first category when assessment step changes (for better UX)
  useEffect(() => {
    setCurrentPage(0);
  }, [currentStep]);

  // Get categories as an array for pagination
  const categories = Object.entries(assessmentData.categories);
  const totalPages = categories.length;

  // Get current category and its questions
  const currentCategory = categories[currentPage];
  const currentCategoryKey = currentCategory ? currentCategory[0] : null;
  const currentCategoryData = currentCategory ? currentCategory[1] : null;

  // Get all questions for current category
  const currentQuestions = [];
  if (currentCategoryData) {
    // Regular questions
    currentCategoryData.questions.forEach((question, index) => {
      currentQuestions.push({
        question,
        categoryKey: currentCategoryKey,
        questionKey: `${currentCategoryKey}_${index}`,
        isReverse: false
      });
    });

    // Reverse questions (for Big Five)
    if (currentCategoryData.reverseQuestions) {
      currentCategoryData.reverseQuestions.forEach((question, index) => {
        currentQuestions.push({
          question,
          categoryKey: currentCategoryKey,
          questionKey: `${currentCategoryKey}_reverse_${index}`,
          isReverse: true
        });
      });
    }
  }

  // Flatten all questions from all categories (for compatibility with existing functions)
  const allQuestions = [];
  Object.entries(assessmentData.categories).forEach(([categoryKey, category]) => {
    // Regular questions
    category.questions.forEach((question, index) => {
      allQuestions.push({
        question,
        categoryKey,
        questionKey: `${categoryKey}_${index}`,
        isReverse: false
      });
    });

    // Reverse questions (for Big Five)
    if (category.reverseQuestions) {
      category.reverseQuestions.forEach((question, index) => {
        allQuestions.push({
          question,
          categoryKey,
          questionKey: `${categoryKey}_reverse_${index}`,
          isReverse: true
        });
      });
    }
  });

  // Auto-fill functionality removed - users must fill answers manually

  // Load prefilled answers when available (from auto fill all assessments)
  useEffect(() => {
    if (prefilledAnswers) {
      // Filter answers for current assessment
      const currentAssessmentAnswers = {};
      allQuestions.forEach((q) => {
        if (prefilledAnswers[q.questionKey] !== undefined) {
          currentAssessmentAnswers[q.questionKey] = prefilledAnswers[q.questionKey];
        }
      });
      setAnswers(currentAssessmentAnswers);
    }
  }, [prefilledAnswers, assessmentData.title]);

  // Auto-fill and auto-navigation functionality removed - users must navigate manually

  const handleAnswerChange = (questionKey, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const handleNextCategory = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousCategory = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const calculateScores = () => {
    const scores = {};
    
    Object.entries(assessmentData.categories).forEach(([categoryKey, category]) => {
      let totalScore = 0;
      let questionCount = 0;
      
      // Regular questions
      category.questions.forEach((_, index) => {
        const questionKey = `${categoryKey}_${index}`;
        if (answers[questionKey]) {
          totalScore += answers[questionKey];
          questionCount++;
        }
      });
      
      // Reverse questions (for Big Five)
      if (category.reverseQuestions) {
        category.reverseQuestions.forEach((_, index) => {
          const questionKey = `${categoryKey}_reverse_${index}`;
          if (answers[questionKey]) {
            // Reverse the score (6 - original score for 1-5 scale)
            totalScore += (6 - answers[questionKey]);
            questionCount++;
          }
        });
      }
      
      // Calculate average score (0-100 scale)
      if (questionCount > 0) {
        scores[categoryKey] = Math.round(((totalScore / questionCount) - 1) * (100 / 4)); // Convert 1-5 to 0-100
      }
    });
    
    return scores;
  };

  const handleSubmit = () => {
    const scores = calculateScores();
    onSubmit(scores);

    // If not the last assessment, automatically move to next
    if (!isLastAssessment) {
      onNext();
    }
  };

  const isAssessmentComplete = () => {
    return allQuestions.every(q => answers[q.questionKey] !== undefined);
  };

  // Function to find first unanswered category
  const findFirstUnansweredCategory = () => {
    for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
      const [categoryKey, categoryData] = categories[categoryIndex];

      // Check regular questions
      const hasUnansweredRegular = categoryData.questions.some((_, index) => {
        const questionKey = `${categoryKey}_${index}`;
        return answers[questionKey] === undefined;
      });

      if (hasUnansweredRegular) return categoryIndex;

      // Check reverse questions
      if (categoryData.reverseQuestions) {
        const hasUnansweredReverse = categoryData.reverseQuestions.some((_, index) => {
          const questionKey = `${categoryKey}_reverse_${index}`;
          return answers[questionKey] === undefined;
        });

        if (hasUnansweredReverse) return categoryIndex;
      }
    }
    return currentPage;
  };

  // Enhanced submit handler with validation
  const handleSubmitWithValidation = () => {
    if (!isAssessmentComplete()) {
      const firstUnansweredCategory = findFirstUnansweredCategory();
      setCurrentPage(firstUnansweredCategory);
      // You could also show a toast or alert here
      return;
    }
    handleSubmit();
  };

  // Function to fill all answers with random values
  const fillRandomAnswers = () => {
    const randomAnswers = {};

    // Generate random answers for all questions (1-5 range)
    allQuestions.forEach((q) => {
      randomAnswers[q.questionKey] = Math.floor(Math.random() * 5) + 1; // Random 1-5
    });

    setAnswers(randomAnswers);
  };

  return (
    <div className="min-h-screen bg-gray-50 mobile-container">
      {/* Mobile Navigation */}
      <MobileAssessmentNavbar
        assessmentData={assessmentData}
        currentStep={currentStep}
        totalSteps={totalSteps}
        answers={answers}
        onTogglePhaseMenu={() => setIsPhaseMenuOpen(true)}
      />

      {/* Mobile Phase Menu */}
      <MobilePhaseMenu
        currentStep={currentStep}
        onNavigateToPhase={onNavigateToPhase}
        onClose={() => setIsPhaseMenuOpen(false)}
        isOpen={isPhaseMenuOpen}
      />

      <div className="flex max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 lg:mr-80 p-2 sm:p-4 lg:p-8 pb-32 sm:pb-36 lg:pb-8">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8 bg-white border border-gray-200 rounded-2xs p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 border border-gray-200 rounded-2xs">
                  <BookOpen className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                    {assessmentData.title}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1 font-medium">
                    Assessment {currentStep} of {totalSteps} - {assessmentData.description}
                  </p>
                  {isAutoFillMode && (
                    <div className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded-2xs">
                      <Check className="h-3 w-3 mr-1" />
                      Auto-filled - You can edit answers manually
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>



          {/* Questions */}
          <div className="w-full max-w-full sm:max-w-2xl lg:max-w-3xl mx-auto px-1 sm:px-0">
            {currentQuestions.map((q, index) => {
              // Calculate the global question index for this question
              let globalIndex = 0;
              const categoriesArray = Object.entries(assessmentData.categories);

              // Count questions from previous categories
              for (let i = 0; i < currentPage; i++) {
                const [, categoryData] = categoriesArray[i];
                globalIndex += categoryData.questions.length;
                if (categoryData.reverseQuestions) {
                  globalIndex += categoryData.reverseQuestions.length;
                }
              }

              // Add current question index within current category
              globalIndex += index + 1;

              return (
                <AssessmentQuestion
                  key={q.questionKey}
                  question={q.question}
                  questionIndex={globalIndex}
                  totalQuestions={allQuestions.length}
                  scale={assessmentData.scale}
                  value={answers[q.questionKey]}
                  onChange={(value) => handleAnswerChange(q.questionKey, value)}
                  isReverse={q.isReverse}
                />
              );
            })}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex max-w-full sm:max-w-2xl lg:max-w-3xl mx-auto mt-8 justify-between items-center">
            <button
              onClick={handlePreviousCategory}
              disabled={currentPage === 0}
              className="flex items-center space-x-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-2xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous Category</span>
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-medium">
                {currentCategoryData?.name} ({currentPage + 1} of {totalPages})
              </span>

              {/* Previous Assessment Button */}
              {currentStep > 1 && currentPage === 0 && (
                <button
                  onClick={onPrevious}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-2xs hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span>Previous Assessment</span>
                </button>
              )}

              {/* Submit Assessment Button */}
              {currentPage === totalPages - 1 && isLastAssessment && !isAutoFillMode && (
                <button
                  onClick={handleSubmitWithValidation}
                  disabled={!isAssessmentComplete() || isProcessingSubmit}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-2xs hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Check className="h-5 w-5" />
                  <span>{isProcessingSubmit ? 'Submitting...' : 'Submit Assessment'}</span>
                </button>
              )}

              {/* Manual Submit Button for Auto-Fill Mode */}
              {isAutoFillMode && isLastAssessment && (
                <button
                  onClick={onManualSubmit}
                  disabled={isProcessingSubmit}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-2xs hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Check className="h-5 w-5" />
                  <span>{isProcessingSubmit ? 'Submitting...' : 'Submit All Assessments'}</span>
                </button>
              )}

              {/* Next Assessment Button */}
              {currentPage === totalPages - 1 && !isLastAssessment && (
                <button
                  onClick={handleSubmitWithValidation}
                  disabled={!isAssessmentComplete() || isProcessingSubmit}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-2xs hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span>{isProcessingSubmit ? 'Processing...' : 'Next Assessment'}</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}

              {/* Next Category Button */}
              {currentPage < totalPages - 1 && (
                <button
                  onClick={handleNextCategory}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-2xs hover:bg-gray-800 transition-all"
                >
                  <span>Next Category</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <AssessmentSidebar
          assessmentData={assessmentData}
          answers={answers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          currentStep={currentStep}
          totalSteps={totalSteps}
          onFillRandomAnswers={fillRandomAnswers}
          onFillAllAssessments={onFillAllAssessments}
          onNavigateToPhase={onNavigateToPhase}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation
        currentPage={currentPage}
        totalPages={totalPages}
        currentStep={currentStep}
        totalSteps={totalSteps}
        isLastAssessment={isLastAssessment}
        isAssessmentComplete={isAssessmentComplete}
        isProcessingSubmit={isProcessingSubmit}
        isAutoFillMode={isAutoFillMode}
        onPreviousCategory={handlePreviousCategory}
        onNextCategory={handleNextCategory}
        onPrevious={onPrevious}
        onSubmitWithValidation={handleSubmitWithValidation}
        onManualSubmit={onManualSubmit}
        currentCategoryData={currentCategoryData}
      />
    </div>
  );
};

export default AssessmentForm;
