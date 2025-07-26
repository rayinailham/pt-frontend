const ErrorMessage = ({ 
  title = 'Error', 
  message, 
  onRetry, 
  retryText = 'Try Again',
  showIcon = true 
}) => {
  return (
    <div className="text-center py-8">
      {showIcon && (
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <h2 className="text-lg font-medium text-red-900 mb-2">{title}</h2>
      
      {message && (
        <p className="text-red-700 mb-4 max-w-md mx-auto">{message}</p>
      )}
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {retryText}
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
