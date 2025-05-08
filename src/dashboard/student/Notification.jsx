import React, { useState, useEffect, useRef } from 'react';
import { GetAllNotifications, MarkNotificationAsRead } from '../../service/api'; // Adjust the import path as needed

function Notification({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const notificationRef = useRef(null); // Ref to track the notification panel

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await GetAllNotifications();
        console.log('API Response from GetAllNotifications:', data); // Debug log
        const transformedData = data.map(notification => ({
          id: notification._id,
          text: `${notification.title}: ${notification.message}`,
          isRead: notification.isRead,
        }));
        setNotifications(transformedData);
      } catch (err) {
        setError(err.message || 'Failed to load notifications');
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Handle marking notification as read
  const handleMarkAsRead = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Attempting to mark notification ${id} as read`); // Debug log
      await MarkNotificationAsRead(id);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
      console.log(`Notification ${id} marked as read in state`); // Debug log
    } catch (err) {
      setError('Failed to mark notification as read. Please try again.');
      console.error('Error marking notification as read:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        onClose(); // Call onClose when clicking outside
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Calculate number of unread notifications (used only for internal logic, not display)
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      ref={notificationRef} // Attach ref to the notification panel
      className="absolute right-0 mt-2 bg-white rounded-lg shadow-md p-6 w-[400px] z-40"
    >
      {isLoading && (
        <div className="text-center text-gray-500 text-sm">Loading...</div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm mb-3">
          {error}
        </div>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {notifications.length === 0 && !isLoading ? (
          <div className="text-center text-gray-500 text-sm">
            {error ? 'Error loading notifications' : 'No notifications available'}
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between bg-white rounded-md p-2 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center flex-1">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      notification.isRead ? 'bg-gray-300' : 'bg-black'
                    }`}
                  ></span>
                </div>
                <span className="text-sm font-medium text-gray-900 flex-1">{notification.text}</span>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="bg-white border border-gray-400 text-gray-800 text-sm font-semibold py-1 px-4 rounded-lg hover:bg-gray-100 transition-colors w-32 min-w-[128px] flex-shrink-0 text-center"
                  disabled={isLoading}
                >
                  Mark As Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notification;