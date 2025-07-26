```
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Clock, BookOpen } from 'lucide-react';

// Mock data for demonstration
const mockAssessmentData = {
  title: "Personality Assessment",
  description: "This assessment will help us understand your personality traits and preferences.",
  scale: { min: 1, max: 5, labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] }
};

const mockQuestions = [
  { questionKey: 'q1', question: 'I enjoy meeting new people', isReverse: false },
  { questionKey: 'q2', question: 'I prefer working alone', isReverse: true },
  { questionKey: 'q3', question: 'I am comfortable in social situations', isReverse: false },
  { questionKey: 'q4', question: 'I find it easy to start conversations', isReverse: false },
  { questionKey: 'q5', question: 'I prefer quiet environments', isReverse: true },
  { questionKey: 'q6', question: 'I enjoy group activities', isReverse: false },
  { questionKey: 'q7', question: 'I am energized by social interactions', isReverse: false },
  { questionKey: 'q8', question: 'I need time alone to recharge', isReverse: true },
];

const ProgressBar = ({ progress, label, showPercentage }) => (
  <div className="w-full">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {showPercentage && (
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      )}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

const AssessmentQuestion = ({ question, questionIndex, totalQuestions, scale, value, onChange, isReverse }) => (
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
        <span>{scale.labels[0]}</span>
        <span>{scale.labels[scale.labels.length - 1]}</span>
      </div>
      
      <div className="flex justify-between items-center space-x-2">
        {Array.from({ length: scale.max - scale.min + 1 }, (_, i) => {
          const scaleValue = scale.min + i;
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
      
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        {scale.labels.map((label, index) => (
          <span key={index} className="text-center flex-1">
            {label}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default function ImprovedAssessment() {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  
  const questionsPerPage = 3;
  const totalPages = Math.ceil(mockQuestions.length / questionsPerPage);
  const currentQuestions = mockQuestions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );
  const progress = (Object.keys(answers).length / mockQuestions.length) * 100;
  
  const handleAnswerChange = (questionKey, value) => {
    setAnswers(prev => ({ ...prev, [questionKey]: value }));
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const isAssessmentComplete = () => {
    return Object.keys(answers).length === mockQuestions.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold text-gray-900">Assessment</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Page {currentPage + 1}/{totalPages}</span>
            </div>
          </div>
          
          <ProgressBar
            progress={progress}
            label={`${Object.keys(answers).length}/${mockQuestions.length} completed`}
            showPercentage={true}
          />
          
          <div className="flex justify-between mt-3">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 lg:mr-80 p-4 lg:p-8">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {mockAssessmentData.title}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Complete this assessment to help us understand your preferences
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <ProgressBar
                progress={progress}
                label={`Progress: ${Object.keys(answers).length}/${mockQuestions.length} questions`}
                showPercentage={true}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="max-w-3xl mx-auto pt-4 lg:pt-0">
            {currentQuestions.map((q, index) => (
              <AssessmentQuestion
                key={q.questionKey}
                question={q.question}
                questionIndex={currentPage * questionsPerPage + index}
                totalQuestions={mockQuestions.length}
                scale={mockAssessmentData.scale}
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
              
              {currentPage === totalPages - 1 && (
                <button
                  onClick={() => alert('Assessment submitted!')}
                  disabled={!isAssessmentComplete()}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <Check className="h-5 w-5" />
                  <span>Submit Assessment</span>
                </button>
              )}
              
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
                    {mockQuestions.length - Object.keys(answers).length}
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

              <div className="grid grid-cols-4 gap-2 mb-6">
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

              {/* Question Overview */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Question Overview
                </h3>
                {mockQuestions.map((q, index) => (
                  <div
                    key={q.questionKey}
                    className={`
                      p-2 rounded-lg text-sm transition-colors
                      ${answers[q.questionKey]
                        ? 'bg-green-50 border-l-4 border-green-500 text-green-800'
                        : 'bg-gray-50 text-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Q{index + 1}</span>
                      {answers[q.questionKey] && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-xs opacity-75 mt-1 line-clamp-2">
                      {q.question}
                    </div>
                  </div>
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
                    style={{ width: `${(Object.keys(answers).length / mockQuestions.length) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {Math.round((Object.keys(answers).length / mockQuestions.length) * 100)}% Complete
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```