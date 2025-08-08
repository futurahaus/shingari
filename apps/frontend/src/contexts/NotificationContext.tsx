"use client";

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { NotificationContainer } from '@/components/ui/NotificationContainer';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  position = 'top-right',
  maxNotifications = 5
}) => {
  const notificationUtils = useNotifications();

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => notificationUtils, [
    notificationUtils.notifications,
    notificationUtils.addNotification,
    notificationUtils.removeNotification,
    notificationUtils.clearAllNotifications,
    notificationUtils.showSuccess,
    notificationUtils.showError,
    notificationUtils.showInfo,
    notificationUtils.showWarning,
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer
        notifications={notificationUtils.notifications}
        onRemove={notificationUtils.removeNotification}
        position={position}
        maxNotifications={maxNotifications}
      />
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}; 