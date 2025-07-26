import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Clock, BookOpen } from 'lucide-react';
import AssessmentQuestion from './AssessmentQuestion';

const AssessmentForm = ({
  assessmentData,
  onSubmit,
  onNext,
  onPrevious,
  isLastAssessment = false,
  currentStep = 1,
  totalSteps = 3,
  isDebugMode = false,
}) => {
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Auto-fill answers in debug mode
  useEffect(() => {
    if (isDebugMode && import.meta.env.DEV) {
      const autoAnswers = {};

      // Generate random answers for all questions (3-5 range for good scores)
      allQuestions.forEach((q) => {
        autoAnswers[q.questionKey] = Math.floor(Math.random() * 3) + 3; // Random 3-5
      });

      setAnswers(autoAnswers);
      setCurrentPage(Math.max(0, Math.ceil(allQuestions.length / questionsPerPage) - 1)); // Go to last page
    }
  }, [isDebugMode, assessmentData.title]);
  
  // Flatten all questions from all categories
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

  const totalPages = Math.ceil(allQuestions.length / questionsPerPage);
  const currentQuestions = allQuestions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const handleAnswerChange = (questionKey, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
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
        scores[categoryKey] = Math.round((totalScore / questionCount) * 20); // Convert 1-5 to 0-100
      }
    });
    
    return scores;
  };

  const handleSubmit = () => {
    const scores = calculateScores();
    onSubmit(scores);
  };

  const isAssessmentComplete = () => {
    return allQuestions.every(q => answers[q.questionKey] !== undefined);
  };

  // Function to find first unanswered question
  const findFirstUnansweredQuestion = () => {
    for (let i = 0; i < allQuestions.length; i++) {
      if (answers[allQuestions[i].questionKey] === undefined) {
        return Math.floor(i / questionsPerPage);
      }
    }
    return currentPage;
  };

  // Enhanced submit handler with validation
  const handleSubmitWithValidation = () => {
    if (!isAssessmentComplete()) {
      const firstUnansweredPage = findFirstUnansweredQuestion();
      setCurrentPage(firstUnansweredPage);
      // You could also show a toast or alert here
      return;
    }
    handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 lg:mr-80 p-4 lg:p-8">
          {/* Desktop Header */}
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {assessmentData.title}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Assessment {currentStep} of {totalSteps} - {assessmentData.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="max-w-3xl mx-auto">
            {currentQuestions.map((q, index) => (
              <AssessmentQuestion
                key={q.questionKey}
                question={q.question}
                questionIndex={currentPage * questionsPerPage + index}
                totalQuestions={allQuestions.length}
                scale={assessmentData.scale}
                value={answers[q.questionKey]}
                onChange={(value) => handleAnswerChange(q.questionKey, value)}
                isReverse={q.isReverse}
              />
            ))}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex max-w-3xl mx-auto mt-8 justify-between items-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous Page</span>
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Page {currentPage + 1} of {totalPages}
              </span>

              {/* Previous Assessment Button */}
              {currentStep > 1 && currentPage === 0 && (
                <button
                  onClick={onPrevious}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span>Previous Assessment</span>
                </button>
              )}

              {/* Submit Assessment Button */}
              {currentPage === totalPages - 1 && isLastAssessment && (
                <button
                  onClick={handleSubmitWithValidation}
                  disabled={!isAssessmentComplete()}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <Check className="h-5 w-5" />
                  <span>Submit Assessment</span>
                </button>
              )}

              {/* Next Assessment Button */}
              {currentPage === totalPages - 1 && !isLastAssessment && (
                <button
                  onClick={onNext}
                  disabled={!isAssessmentComplete()}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <span>Next Assessment</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}

              {/* Next Page Button */}
              {currentPage < totalPages - 1 && (
                <button
                  onClick={handleNextPage}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  <span>Next Page</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed right-0 top-0 h-full w-80 bg-white shadow-xl border-l border-gray-100 overflow-y-auto z-20">
          <div className="p-6 h-full flex flex-col">
            {/* Assessment Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                <div className="p-1 bg-indigo-100 rounded">
                  <Clock className="h-4 w-4 text-indigo-600" />
                </div>
                <span>Assessment Progress</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {Object.keys(answers).length}
                  </div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-400">
                    {allQuestions.length - Object.keys(answers).length}
                  </div>
                  <div className="text-xs text-gray-500">Remaining</div>
                </div>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Navigation
              </h3>

              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${currentPage === i
                        ? 'bg-indigo-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                      }
                    `}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Progress - Bottom Section */}
            <div className="mt-auto pt-6 border-t border-gray-200">
              <div className="text-center mb-4">
                <h4 className="text-base font-medium text-gray-600 mb-3">Total Progress</h4>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gray-400 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(Object.keys(answers).length / allQuestions.length) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {Math.round((Object.keys(answers).length / allQuestions.length) * 100)}% Complete
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentForm;
