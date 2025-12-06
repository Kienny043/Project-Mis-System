import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Calendar, AlertCircle, Clock } from 'lucide-react';
import { notificationAPI } from '../services/api';
import { Link } from 'react-router-dom';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      console.log('Notifications response:', response); // Full response
      console.log('Response data:', response.data); // Just the data
      console.log('Is array?', Array.isArray(response.data)); // Check if array
      
      // Handle different response formats
      let notificationsData = [];
      
      if (Array.isArray(response.data)) {
        notificationsData = response.data;
      } else if (response.data?.notifications && Array.isArray(response.data.notifications)) {
        notificationsData = response.data.notifications;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        // Handle paginated response
        notificationsData = response.data.results;
      } else {
        console.error('Unexpected response format:', response.data);
        notificationsData = [];
      }
      
      const unread = notificationsData.filter(n => !n.is_read);
      setNotifications(unread);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.error('Error response:', error.response?.data);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (message) => {
    if (message.includes('scheduled')) return <Calendar className="w-5 h-5 text-blue-500" />;
    if (message.includes('assigned')) return <AlertCircle className="w-5 h-5 text-orange-500" />;
    if (message.includes('status')) return <Clock className="w-5 h-5 text-purple-500" />;
    return <Bell className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <Link
                  to="/notifications"
                  onClick={() => setShowDropdown(false)}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notif.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notif.message)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {notif.message}
                        </p>
                        {notif.request_details && (
                          <p className="text-xs text-gray-500 mt-1">
                            Request #{notif.request_details.id} - {notif.request_details.request_type}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {getTimeAgo(notif.created_at)}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          className="flex-shrink-0 p-1 rounded-full hover:bg-blue-100 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;