import { useState, useEffect } from 'react';

/**
 * TriviaCard Component
 * Displays assessment trivia with smooth animations and transitions
 */
const TriviaCard = ({ trivia, isVisible = true }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayTrivia, setDisplayTrivia] = useState(trivia);

  useEffect(() => {
    if (trivia && trivia.id !== displayTrivia?.id) {
      // Start fade out animation
      setIsAnimating(true);
      
      // After fade out, update content and fade in
      const timer = setTimeout(() => {
        setDisplayTrivia(trivia);
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [trivia, displayTrivia]);

  if (!displayTrivia || !isVisible) {
    return null;
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'history':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'theory':
      case 'concept':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'statistics':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'research':
      case 'genetics':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'consistency':
      case 'objectivity':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'speed':
      case 'scalability':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'pattern':
      case 'integration':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        );
      case 'learning':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default:
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'history':
        return 'from-amber-50 to-orange-50 border-amber-200 text-amber-600 bg-amber-100';
      case 'theory':
      case 'concept':
        return 'from-purple-50 to-indigo-50 border-purple-200 text-purple-600 bg-purple-100';
      case 'statistics':
        return 'from-green-50 to-emerald-50 border-green-200 text-green-600 bg-green-100';
      case 'research':
      case 'genetics':
        return 'from-blue-50 to-cyan-50 border-blue-200 text-blue-600 bg-blue-100';
      case 'consistency':
      case 'objectivity':
        return 'from-teal-50 to-cyan-50 border-teal-200 text-teal-600 bg-teal-100';
      case 'speed':
      case 'scalability':
        return 'from-red-50 to-pink-50 border-red-200 text-red-600 bg-red-100';
      case 'pattern':
      case 'integration':
        return 'from-indigo-50 to-blue-50 border-indigo-200 text-indigo-600 bg-indigo-100';
      case 'learning':
        return 'from-violet-50 to-purple-50 border-violet-200 text-violet-600 bg-violet-100';
      default:
        return 'from-gray-50 to-slate-50 border-gray-200 text-gray-600 bg-gray-100';
    }
  };

  const colorClasses = getCategoryColor(displayTrivia.category);
  const [bgGradient, borderColor, iconColor, badgeColor] = colorClasses.split(' ');

  return (
    <div className="mb-6 sm:mb-10 px-2 sm:px-0">
      <div
        className={`bg-gradient-to-r ${bgGradient} border ${borderColor} rounded-xl p-4 sm:p-6 max-w-2xl mx-auto transition-all duration-500 ease-in-out transform
          ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
        style={{ minHeight: '180px' }} // Reduced minimum height for mobile
      >
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${badgeColor} rounded-lg flex items-center justify-center transition-all duration-300`}>
              <div className={`${iconColor} transition-colors duration-300`}>
                <div className="w-4 h-4 sm:w-5 sm:h-5">
                  {getCategoryIcon(displayTrivia.category)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Tahukah Anda?
              </h3>
              <span className={`text-xs ${iconColor} ${badgeColor} px-2 py-1 rounded-full transition-all duration-300 whitespace-nowrap`}>
                {displayTrivia.category}
              </span>
            </div>
            <h4 className={`text-base sm:text-lg font-semibold text-gray-900 mb-2 transition-all duration-300 leading-tight ${
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}>
              {displayTrivia.title}
            </h4>
            <p className={`text-sm sm:text-base text-gray-700 leading-relaxed transition-all duration-300 ${
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}>
              {displayTrivia.content}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TriviaCard;
