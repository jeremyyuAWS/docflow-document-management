import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, AlertTriangle, Info, X, Archive, Eye, Clock } from 'lucide-react';
import { notificationSystem, type Notification } from '../lib/notificationSystem';

interface SmartNotificationsProps {
  customerId: string;
  onNotificationClick?: (notification: Notification) => void;
}

function SmartNotifications({ customerId, onNotificationClick }: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

  useEffect(() => {
    loadNotifications();
  }, [customerId, filter]);

  const loadNotifications = async () => {
    const status = filter === 'all' ? undefined : filter;
    const results = await notificationSystem.getNotifications(customerId, { status });
    setNotifications(results);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    await notificationSystem.markAsRead(notification.id);
    loadNotifications();
  };

  const handleArchive = async (notification: Notification) => {
    await notificationSystem.archiveNotification(notification.id);
    loadNotifications();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bell className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Smart Notifications</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'unread'
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'archived'
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      <AnimatePresence>
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-gray-500"
          >
            No notifications to display
          </motion.div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white rounded-lg border p-4 ${
                  notification.status === 'unread'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mt-1 mr-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                        {notification.metadata.category && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {notification.metadata.category}
                          </span>
                        )}
                        {notification.priority === 'high' && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {notification.status === 'unread' && (
                      <button
                        onClick={() => handleMarkAsRead(notification)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Mark as read"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    {notification.status !== 'archived' && (
                      <button
                        onClick={() => handleArchive(notification)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Archive"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SmartNotifications;