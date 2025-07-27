import { useState, useEffect } from 'react';
import { CheckCircle, X, Edit3 } from 'lucide-react';

const AutoFillNotification = ({ 
  isVisible, 
  onClose, 
  totalQuestions = 200,
  currentStep = 1,
  totalSteps = 3 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm transition-all duration-300 ${
          isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Auto Fill Complete!
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Successfully filled all {totalQuestions} questions across {totalSteps} assessment phases.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Edit3 className="h-3 w-3" />
              <span>You can now review and edit answers manually</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Current Phase: {currentStep} of {totalSteps}</span>
            <span>100% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full w-full transition-all duration-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoFillNotification;
