const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-32 w-32'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-gray-600 text-center">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
