"use client";

import React from 'react';
import { Notification } from '@/hooks/useNotifications';

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onRemove,
  position = 'top-right',
  maxNotifications = 5
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'fixed top-4 left-4 z-50 flex flex-col items-start space-y-2';
      case 'bottom-left':
        return 'fixed bottom-4 left-4 z-50 flex flex-col items-start space-y-2';
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2';
      case 'top-center':
        return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center space-y-2';
      case 'bottom-center':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center space-y-2';
      case 'top-right':
      default:
        return 'fixed top-4 right-4 z-50 flex flex-col items-end space-y-2';
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getNotificationRingColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'ring-green-500';
      case 'error':
        return 'ring-red-500';
      case 'warning':
        return 'ring-yellow-500';
      case 'info':
      default:
        return 'ring-blue-500';
    }
  };

  // Limit the number of notifications shown
  const visibleNotifications = notifications.slice(0, maxNotifications);

  // Note: Auto-removal is handled by useNotifications hook based on duration parameter
  // If duration is 0 or undefined, notification won't auto-dismiss

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`${getPositionClasses()} w-full max-w-xs md:max-w-sm`}>
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`w-full max-w-xs md:max-w-sm bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-visible ${getNotificationRingColor(notification.type)}`}
          style={{ wordBreak: 'break-word' }}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => onRemove(notification.id)}
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
      ))}
    </div>
  );
}; 