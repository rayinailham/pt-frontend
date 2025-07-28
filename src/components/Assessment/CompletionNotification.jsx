import { useState, useEffect } from 'react';
import { CheckCircle, X, Send } from 'lucide-react';

const CompletionNotification = ({ 
  isVisible, 
  onClose, 
  onSubmit,
  totalQuestions = 200,
  totalSteps = 3 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto close after 10 seconds if user doesn't interact
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSubmit = () => {
    handleClose();
    onSubmit();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`bg-white border border-green-200 shadow-lg rounded-2xs p-4 max-w-sm transition-all duration-300 ${
          isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Assessment Complete!
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              You've successfully answered all {totalQuestions} questions across {totalSteps} assessment phases.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-600 mb-3">
              <Send className="h-3 w-3" />
              <span>Ready to submit for AI analysis</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-2xs hover:bg-green-700 transition-colors"
              >
                <Send className="h-3 w-3" />
                <span>Submit Now</span>
              </button>
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionNotification;
