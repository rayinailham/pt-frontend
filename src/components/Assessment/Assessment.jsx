import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, BookOpen, Send } from 'lucide-react';
import AssessmentQuestion from './AssessmentQuestion';
import AssessmentSidebar from './AssessmentSidebar';
import MobileAssessmentNavbar from './MobileAssessmentNavbar';
import MobileBottomNavigation from './MobileBottomNavigation';
import MobilePhaseMenu from './MobilePhaseMenu';
import AutoFillNotification from './AutoFillNotification';
import CompletionNotification from './CompletionNotification';
import { viaQuestions, riasecQuestions, bigFiveQuestions } from '../../data/assessmentQuestions';
import apiService from '../../services/apiService';
import ErrorMessage from '../UI/ErrorMessage';
import LoadingSpinner from '../UI/LoadingSpinner';
import { transformAssessmentScores, validateAssessmentData } from '../../utils/assessmentTransformers';
import { secureStorage, migrateToEncrypted } from '../../utils/encryption';

/**
 * Assessment Component
 * 
 * Single unified component that handles the complete assessment process following Assessment-Processing-Logic.md:
 * 
 * Data Flow:
 * 1. User Input Handling - Radio button selection updates answers state
 * 2. Auto-Save to localStorage - Automatic persistence of answers
 * 3. Real-time Score Calculation - Calculates category scores on every answer change
 * 4. Update Assessment Data - Updates internal state with scores and completion status
 * 5. Progress Tracking - Tracks overall progress across all assessments
 * 6. Data Transformation for API - Transforms scores to API format when ready
 * 7. API Submission - Submits to backend when all assessments complete
 * 
 * Features:
 * - Single component managing all assessment logic
 * - Preserves existing UI structure and mobile responsiveness
 * - Real-time score calculation and progress tracking
 * - Auto-save functionality to prevent data loss
 * - Automatic submission when all assessments complete
 * - Error handling and retry functionality
 */
const Assessment = () => {
  const navigate = useNavigate();
  
  // Core state management following Assessment-Processing-Logic.md
  const [currentAssessmentType, setCurrentAssessmentType] = useState('via'); // 'via', 'riasec', 'bigFive'
  const [currentPage, setCurrentPage] = useState(0); // Category pagination
  const [answers, setAnswers] = useState({}); // All answers from all assessments
  const [assessmentData, setAssessmentData] = useState({
    via: {},
    riasec: {},
    bigFive: {}
  });
  const [completionStatus, setCompletionStatus] = useState({
    via: false,
    riasec: false,
    bigFive: false
  });
  
  // UI and submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isPhaseMenuOpen, setIsPhaseMenuOpen] = useState(false);
  const [showAutoFillNotification, setShowAutoFillNotification] = useState(false);
  const [isAutoFillMode, setIsAutoFillMode] = useState(false);
  const [showCompletionNotification, setShowCompletionNotification] = useState(false);

  // Flagging system state
  const [flaggedQuestions, setFlaggedQuestions] = useState({});

  // Assessment configurations
  const assessments = {
    via: { 
      data: viaQuestions, 
      title: 'VIA Character Strengths', 
      step: 1,
      description: 'Character strengths assessment with 96 questions'
    },
    riasec: { 
      data: riasecQuestions, 
      title: 'RIASEC Holland Codes', 
      step: 2,
      description: 'Career interests assessment with 60 questions'
    },
    bigFive: { 
      data: bigFiveQuestions, 
      title: 'Big Five Personality', 
      step: 3,
      description: 'Personality traits assessment with 44 questions'
    }
  };

  const currentAssessment = assessments[currentAssessmentType];
  const totalSteps = Object.keys(assessments).length;

  // Step 1: User Input Handling - Radio Button Selection
  const handleAnswer = (questionKey, value) => {
    const newAnswers = {
      ...answers,
      [questionKey]: value
    };
    setAnswers(newAnswers);
  };

  // Flagging system - Toggle flag for questions
  const handleToggleFlag = (questionKey) => {
    const newFlaggedQuestions = {
      ...flaggedQuestions,
      [questionKey]: !flaggedQuestions[questionKey]
    };

    // Remove false values to keep object clean
    if (!newFlaggedQuestions[questionKey]) {
      delete newFlaggedQuestions[questionKey];
    }

    setFlaggedQuestions(newFlaggedQuestions);
  };

  // Step 2: Auto-Save to localStorage with encryption
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      try {
        secureStorage.setItem('assessmentAnswers', answers);
      } catch (error) {
        console.error('Failed to save encrypted answers:', error);
        // Fallback to unencrypted storage if encryption fails
        localStorage.setItem('assessmentAnswers', JSON.stringify(answers));
      }
    }
  }, [answers]);

  // Auto-Save flagged questions to localStorage with encryption
  useEffect(() => {
    try {
      secureStorage.setItem('assessmentFlaggedQuestions', flaggedQuestions);
    } catch (error) {
      console.error('Failed to save encrypted flagged questions:', error);
      // Fallback to unencrypted storage if encryption fails
      localStorage.setItem('assessmentFlaggedQuestions', JSON.stringify(flaggedQuestions));
    }
  }, [flaggedQuestions]);

  // Load saved answers and flagged questions on component mount with encryption support
  useEffect(() => {
    // Migrate existing unencrypted data to encrypted storage
    migrateToEncrypted('assessmentAnswers', secureStorage);
    migrateToEncrypted('assessmentFlaggedQuestions', secureStorage);

    // Load encrypted answers
    try {
      const savedAnswers = secureStorage.getItem('assessmentAnswers');
      if (savedAnswers) {
        setAnswers(savedAnswers);
      }
    } catch (error) {
      console.error('Failed to load encrypted answers, trying unencrypted fallback:', error);
      // Fallback to unencrypted storage
      const savedAnswers = localStorage.getItem('assessmentAnswers');
      if (savedAnswers) {
        try {
          const parsedAnswers = JSON.parse(savedAnswers);
          setAnswers(parsedAnswers);
        } catch (parseError) {
          console.error('Failed to load saved answers:', parseError);
        }
      }
    }

    // Load encrypted flagged questions
    try {
      const savedFlaggedQuestions = secureStorage.getItem('assessmentFlaggedQuestions');
      if (savedFlaggedQuestions) {
        setFlaggedQuestions(savedFlaggedQuestions);
      }
    } catch (error) {
      console.error('Failed to load encrypted flagged questions, trying unencrypted fallback:', error);
      // Fallback to unencrypted storage
      const savedFlaggedQuestions = localStorage.getItem('assessmentFlaggedQuestions');
      if (savedFlaggedQuestions) {
        try {
          const parsedFlaggedQuestions = JSON.parse(savedFlaggedQuestions);
          setFlaggedQuestions(parsedFlaggedQuestions);
        } catch (parseError) {
          console.error('Failed to load saved flagged questions:', parseError);
        }
      }
    }
  }, []);

  // Step 3: Real-time Score Calculation
  const calculateCategoryScores = (assessmentType) => {
    const assessment = assessments[assessmentType];
    const categoryScores = {};
    
    Object.entries(assessment.data.categories).forEach(([categoryKey, category]) => {
      let totalScore = 0;
      let questionCount = 0;
      
      // Regular questions
      category.questions.forEach((_, index) => {
        const questionKey = `${assessmentType}_${categoryKey}_${index}`;
        if (answers[questionKey]) {
          totalScore += answers[questionKey];
          questionCount++;
        }
      });
      
      // Reverse questions (for Big Five)
      if (category.reverseQuestions) {
        category.reverseQuestions.forEach((_, index) => {
          const questionKey = `${assessmentType}_${categoryKey}_reverse_${index}`;
          if (answers[questionKey]) {
            // Reverse the score (6 - original score for 1-5 scale)
            totalScore += (6 - answers[questionKey]);
            questionCount++;
          }
        });
      }
      
      // Calculate average score (0-100 scale)
      if (questionCount > 0) {
        const average = totalScore / questionCount;
        // Convert from 1-5 scale to 0-100 scale
        categoryScores[categoryKey] = Math.round(((average - 1) / 4) * 100);
      } else {
        categoryScores[categoryKey] = 0;
      }
    });
    
    return categoryScores;
  };

  // Check if assessment is complete
  const isAssessmentComplete = (assessmentType) => {
    const assessment = assessments[assessmentType];
    let totalQuestions = 0;
    let answeredQuestions = 0;
    
    Object.entries(assessment.data.categories).forEach(([categoryKey, category]) => {
      // Regular questions
      category.questions.forEach((_, index) => {
        totalQuestions++;
        const questionKey = `${assessmentType}_${categoryKey}_${index}`;
        if (answers[questionKey]) {
          answeredQuestions++;
        }
      });
      
      // Reverse questions
      if (category.reverseQuestions) {
        category.reverseQuestions.forEach((_, index) => {
          totalQuestions++;
          const questionKey = `${assessmentType}_${categoryKey}_reverse_${index}`;
          if (answers[questionKey]) {
            answeredQuestions++;
          }
        });
      }
    });
    
    return totalQuestions > 0 && answeredQuestions === totalQuestions;
  };

  // Step 4: Update Assessment Data (real-time)
  useEffect(() => {
    // Calculate scores for all assessment types
    Object.keys(assessments).forEach(assessmentType => {
      const scores = calculateCategoryScores(assessmentType);
      const isComplete = isAssessmentComplete(assessmentType);
      
      setAssessmentData(prev => ({
        ...prev,
        [assessmentType]: scores
      }));
      
      setCompletionStatus(prev => ({
        ...prev,
        [assessmentType]: isComplete
      }));
    });
  }, [answers]);

  // Step 5: Progress Tracking
  const calculateOverallProgress = () => {
    let totalAnswered = 0;
    let totalQuestions = 0;
    
    Object.keys(assessments).forEach(assessmentType => {
      const assessment = assessments[assessmentType];
      Object.entries(assessment.data.categories).forEach(([categoryKey, category]) => {
        // Count total questions
        totalQuestions += category.questions.length;
        if (category.reverseQuestions) {
          totalQuestions += category.reverseQuestions.length;
        }
        
        // Count answered questions
        category.questions.forEach((_, index) => {
          const questionKey = `${assessmentType}_${categoryKey}_${index}`;
          if (answers[questionKey]) totalAnswered++;
        });
        
        if (category.reverseQuestions) {
          category.reverseQuestions.forEach((_, index) => {
            const questionKey = `${assessmentType}_${categoryKey}_reverse_${index}`;
            if (answers[questionKey]) totalAnswered++;
          });
        }
      });
    });
    
    return { 
      totalAnswered, 
      totalQuestions, 
      percentage: totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0 
    };
  };

  const isAllComplete = completionStatus.via && completionStatus.riasec && completionStatus.bigFive;

  // Navigation functions
  const handleNavigateToAssessment = (assessmentType) => {
    if (assessments[assessmentType]) {
      setCurrentAssessmentType(assessmentType);
      setCurrentPage(0); // Reset to first category
    }
  };

  const handleNavigateToPhase = (step) => {
    const assessmentTypes = ['via', 'riasec', 'bigFive'];
    const assessmentType = assessmentTypes[step - 1];
    if (assessmentType) {
      handleNavigateToAssessment(assessmentType);
    }
  };

  const handleNextAssessment = () => {
    const types = ['via', 'riasec', 'bigFive'];
    const currentIndex = types.indexOf(currentAssessmentType);
    if (currentIndex < types.length - 1) {
      setCurrentAssessmentType(types[currentIndex + 1]);
      setCurrentPage(0);
    }
  };

  const handlePreviousAssessment = () => {
    const types = ['via', 'riasec', 'bigFive'];
    const currentIndex = types.indexOf(currentAssessmentType);
    if (currentIndex > 0) {
      setCurrentAssessmentType(types[currentIndex - 1]);
      setCurrentPage(0);
    }
  };

  const handleNextCategory = () => {
    const categories = Object.entries(currentAssessment.data.categories);
    if (currentPage < categories.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousCategory = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Step 6: Data Transformation for API
  const transformScoresToApiFormat = () => {
    try {
      const apiData = transformAssessmentScores(assessmentData);

      // Validate the transformed data
      const validation = validateAssessmentData(apiData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      return apiData;
    } catch (error) {
      throw error;
    }
  };

  // Step 7: API Submission
  const handleSubmit = async () => {
    if (!isAllComplete) {
      setSubmitError('All assessments must be completed');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setShowCompletionNotification(false); // Hide completion notification when submitting

    try {
      // Transform scores to API format
      const transformedData = transformScoresToApiFormat();

      // Submit to API
      const response = await apiService.submitAssessment(transformedData);

      if (response.success && response.data?.jobId) {
        // Clear saved progress from both encrypted and unencrypted storage
        try {
          secureStorage.removeItem('assessmentAnswers');
          secureStorage.removeItem('assessmentFlaggedQuestions');
        } catch (error) {
          console.error('Failed to clear encrypted storage:', error);
        }

        // Also clear unencrypted fallback storage
        localStorage.removeItem('assessmentAnswers');
        localStorage.removeItem('assessmentFlaggedQuestions');

        // Navigate to status page
        navigate(`/assessment/status/${response.data.jobId}`, {
          state: { fromSubmission: true }
        });
      } else {
        throw new Error(response.message || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('Assessment submission error:', error);

      // Handle specific error cases
      let errorMessage = 'Failed to submit assessment';

      if (error.response?.status === 402) {
        errorMessage = 'Insufficient tokens to process your assessment. Please contact support or try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Removed auto-submit functionality - users must manually submit
  // This prevents accidental submissions when all questions are answered

  // Show completion notification when all assessments are complete
  useEffect(() => {
    if (isAllComplete && !isSubmitting && !submitError && !isAutoFillMode && !showCompletionNotification) {
      setShowCompletionNotification(true);
    }
  }, [isAllComplete, isSubmitting, submitError, isAutoFillMode, showCompletionNotification]);

  // Auto-fill function for testing
  const fillAllAssessments = () => {
    const allAnswers = {};

    Object.keys(assessments).forEach(assessmentType => {
      const assessment = assessments[assessmentType];
      Object.entries(assessment.data.categories).forEach(([categoryKey, category]) => {
        // Regular questions
        category.questions.forEach((_, index) => {
          const questionKey = `${assessmentType}_${categoryKey}_${index}`;
          allAnswers[questionKey] = Math.floor(Math.random() * 5) + 1; // Random 1-5
        });

        // Reverse questions
        if (category.reverseQuestions) {
          category.reverseQuestions.forEach((_, index) => {
            const questionKey = `${assessmentType}_${categoryKey}_reverse_${index}`;
            allAnswers[questionKey] = Math.floor(Math.random() * 5) + 1; // Random 1-5
          });
        }
      });
    });

    setAnswers(allAnswers);
    setIsAutoFillMode(true);
    setShowAutoFillNotification(true);
  };

  // Show error screen if submission failed
  if (submitError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            title="Submission Failed"
            message={submitError}
            onRetry={() => {
              setSubmitError(null);
              handleSubmit();
            }}
            retryText="Try Again"
          />
        </div>
      </div>
    );
  }

  // Get current category and questions
  const categories = Object.entries(currentAssessment.data.categories);
  const totalPages = categories.length;
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
        questionKey: `${currentAssessmentType}_${currentCategoryKey}_${index}`,
        isReverse: false
      });
    });

    // Reverse questions (for Big Five)
    if (currentCategoryData.reverseQuestions) {
      currentCategoryData.reverseQuestions.forEach((question, index) => {
        currentQuestions.push({
          question,
          categoryKey: currentCategoryKey,
          questionKey: `${currentAssessmentType}_${currentCategoryKey}_reverse_${index}`,
          isReverse: true
        });
      });
    }
  }

  // Calculate global question indices for display
  const allQuestions = [];
  Object.keys(assessments).forEach(assessmentType => {
    const assessment = assessments[assessmentType];
    Object.entries(assessment.data.categories).forEach(([categoryKey, category]) => {
      category.questions.forEach((question, index) => {
        allQuestions.push({
          question,
          categoryKey,
          questionKey: `${assessmentType}_${categoryKey}_${index}`,
          isReverse: false
        });
      });

      if (category.reverseQuestions) {
        category.reverseQuestions.forEach((question, index) => {
          allQuestions.push({
            question,
            categoryKey,
            questionKey: `${assessmentType}_${categoryKey}_reverse_${index}`,
            isReverse: true
          });
        });
      }
    });
  });

  const currentAssessmentQuestions = allQuestions.filter(q =>
    q.questionKey.startsWith(currentAssessmentType)
  );

  const isCurrentAssessmentComplete = isAssessmentComplete(currentAssessmentType);
  const isLastAssessment = currentAssessmentType === 'bigFive';

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);



  return (
    <div className="min-h-screen bg-gray-50 mobile-container">
      {/* Mobile Navigation */}
      <MobileAssessmentNavbar
        assessmentData={currentAssessment.data}
        currentStep={currentAssessment.step}
        totalSteps={totalSteps}
        answers={answers}
        currentAssessmentType={currentAssessmentType}
        onTogglePhaseMenu={() => setIsPhaseMenuOpen(true)}
      />

      {/* Mobile Phase Menu */}
      <MobilePhaseMenu
        currentStep={currentAssessment.step}
        onNavigateToPhase={handleNavigateToPhase}
        onClose={() => setIsPhaseMenuOpen(false)}
        isOpen={isPhaseMenuOpen}
      />

      <div className="flex max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 lg:mr-80 p-2 sm:p-4 lg:p-8 pb-32 sm:pb-36 lg:pb-8">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8 bg-white border border-gray-300 rounded-2xs shadow-sm p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 border border-gray-300 rounded-2xs">
                  <BookOpen className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {currentAssessment.title}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1 font-semibold">
                    Assessment {currentAssessment.step} of {totalSteps} - {currentAssessment.description}
                  </p>
                  {isAutoFillMode && (
                    <div className="mt-2 inline-flex items-center px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300 rounded-2xs">
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
              const categoriesArray = Object.entries(currentAssessment.data.categories);

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
                  totalQuestions={currentAssessmentQuestions.length}
                  scale={currentAssessment.data.scale}
                  value={answers[q.questionKey]}
                  onChange={(value) => handleAnswer(q.questionKey, value)}
                  isReverse={q.isReverse}
                  questionKey={q.questionKey}
                  isFlagged={!!flaggedQuestions[q.questionKey]}
                  onToggleFlag={handleToggleFlag}
                />
              );
            })}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex max-w-full sm:max-w-2xl lg:max-w-3xl mx-auto mt-8 justify-between items-center">
            <button
              onClick={handlePreviousCategory}
              disabled={currentPage === 0}
              className="flex items-center space-x-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-2xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous Category</span>
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-medium">
                {currentCategoryData?.name} ({currentPage + 1} of {totalPages})
              </span>

              {/* Previous Assessment Button */}
              {currentAssessment.step > 1 && currentPage === 0 && (
                <button
                  onClick={handlePreviousAssessment}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-2xs hover:bg-gray-50 transition-colors font-medium"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span>Previous Assessment</span>
                </button>
              )}

              {/* Submit Assessment Button */}
              {currentPage === totalPages - 1 && isLastAssessment && isAllComplete && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-2xs hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Submitting Assessment...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Submit Assessment
                    </>
                  )}
                </button>
              )}

              {/* Next Assessment Button */}
              {currentPage === totalPages - 1 && !isLastAssessment && (
                <button
                  onClick={handleNextAssessment}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-2xs hover:bg-gray-800 transition-all font-medium"
                >
                  <span>Next Assessment</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}

              {/* Next Category Button */}
              {currentPage < totalPages - 1 && (
                <button
                  onClick={handleNextCategory}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-2xs hover:bg-gray-800 transition-all font-medium"
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
          assessmentData={currentAssessment.data}
          answers={answers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          currentStep={currentAssessment.step}
          totalSteps={totalSteps}
          currentAssessmentType={currentAssessmentType}
          overallProgress={calculateOverallProgress()}
          flaggedQuestions={flaggedQuestions}
          onFillRandomAnswers={() => {
            // Fill current assessment only
            const currentAnswers = {};
            Object.entries(currentAssessment.data.categories).forEach(([categoryKey, category]) => {
              category.questions.forEach((_, index) => {
                const questionKey = `${currentAssessmentType}_${categoryKey}_${index}`;
                currentAnswers[questionKey] = Math.floor(Math.random() * 5) + 1;
              });
              if (category.reverseQuestions) {
                category.reverseQuestions.forEach((_, index) => {
                  const questionKey = `${currentAssessmentType}_${categoryKey}_reverse_${index}`;
                  currentAnswers[questionKey] = Math.floor(Math.random() * 5) + 1;
                });
              }
            });
            setAnswers(prev => ({ ...prev, ...currentAnswers }));
          }}
          onFillAllAssessments={fillAllAssessments}
          onNavigateToPhase={handleNavigateToPhase}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation
        currentPage={currentPage}
        totalPages={totalPages}
        currentStep={currentAssessment.step}
        totalSteps={totalSteps}
        isLastAssessment={isLastAssessment}
        isAssessmentComplete={() => isCurrentAssessmentComplete}
        isProcessingSubmit={isSubmitting}
        isAutoFillMode={isAutoFillMode}
        onPreviousCategory={handlePreviousCategory}
        onNextCategory={handleNextCategory}
        onPrevious={handlePreviousAssessment}
        onNextAssessment={handleNextAssessment}
        onSubmitWithValidation={() => {
          if (isAllComplete) {
            handleSubmit();
          }
        }}
        onManualSubmit={handleSubmit}
        currentCategoryData={currentCategoryData}
      />

      {/* Auto Fill Success Notification */}
      <AutoFillNotification
        isVisible={showAutoFillNotification}
        onClose={() => setShowAutoFillNotification(false)}
        totalQuestions={allQuestions.length}
        currentStep={currentAssessment.step}
        totalSteps={totalSteps}
      />

      {/* Assessment Completion Notification */}
      <CompletionNotification
        isVisible={showCompletionNotification}
        onClose={() => setShowCompletionNotification(false)}
        onSubmit={handleSubmit}
        totalQuestions={allQuestions.length}
        totalSteps={totalSteps}
      />
    </div>
  );
};

export default Assessment;
