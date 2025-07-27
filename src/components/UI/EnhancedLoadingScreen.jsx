import { motion } from 'framer-motion';

const EnhancedLoadingScreen = ({ 
  title = "Loading...", 
  subtitle = "Please wait while we prepare your content",
  skeletonCount = 3,
  showSpinner = true,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`space-y-8 ${className}`}
    >
      {/* Enhanced Loading skeleton */}
      <div className="space-y-6">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: i * 0.1,
              ease: "easeOut"
            }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="animate-pulse">
              {/* Title skeleton */}
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/3 mb-4 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></div>
              
              {/* Content skeleton */}
              <div className="space-y-3">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-full bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></div>
              </div>
              
              {/* Additional elements for variety */}
              {i % 2 === 0 && (
                <div className="mt-4 flex space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></div>
                  <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-24 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Loading indicator with spinner */}
      {showSpinner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center text-gray-600 py-8"
        >
          <div className="inline-flex items-center space-x-3">
            {/* Enhanced spinner with gradient */}
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200"></div>
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <span className="text-lg font-medium text-gray-700">{title}</span>
          </div>
          
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="text-sm mt-3 text-gray-500"
            >
              {subtitle}
            </motion.p>
          )}
          
          {/* Animated dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex justify-center space-x-1 mt-4"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-indigo-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
      
      {/* Custom CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default EnhancedLoadingScreen;
