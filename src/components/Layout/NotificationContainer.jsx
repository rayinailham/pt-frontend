import { useWebSocket } from '../../context/WebSocketContext';
import NotificationToast from './NotificationToast';

const NotificationContainer = () => {
  const { notifications, clearNotification } = useWebSocket();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={clearNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
