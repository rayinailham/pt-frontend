import { useEffect } from 'react';

const NotificationToast = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 5000); // Auto close after 5 seconds

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className={`max-w-sm w-full ${getBgColor(notification.type)} border rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${getTextColor(notification.type)}`}>
              {notification.title}
            </p>
            <p className={`mt-1 text-sm ${getTextColor(notification.type)} opacity-75`}>
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`rounded-md inline-flex ${getTextColor(notification.type)} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={() => onClose(notification.id)}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
