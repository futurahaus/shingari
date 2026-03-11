"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number; // Optional duration in milliseconds, if not provided, notification won't auto-dismiss
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const MAX_STORED_NOTIFICATIONS = 20;
  const DEFAULT_DURATION = 5000;

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timerId) => clearTimeout(timerId));
      timersRef.current.clear();
    };
  }, []);

  const addNotification = useCallback((
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const effectiveDuration = duration ?? (type === 'error' ? undefined : DEFAULT_DURATION);
    const notification: Notification = { id, type, title, message, duration: effectiveDuration };

    setNotifications(prev => [...prev, notification].slice(-MAX_STORED_NOTIFICATIONS));

    // Auto-remove notification after duration if specified
    if (effectiveDuration && effectiveDuration > 0) {
      const timeoutId = setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        timersRef.current.delete(id);
      }, effectiveDuration);
      timersRef.current.set(id, timeoutId);
    }
  }, [DEFAULT_DURATION, MAX_STORED_NOTIFICATIONS]);

  const removeNotification = useCallback((id: string) => {
    const timerId = timersRef.current.get(id);
    if (timerId) {
      clearTimeout(timerId);
      timersRef.current.delete(id);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    timersRef.current.forEach((timerId) => clearTimeout(timerId));
    timersRef.current.clear();
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    addNotification('success', title, message, duration);
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    addNotification('error', title, message, duration);
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    addNotification('info', title, message, duration);
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    addNotification('warning', title, message, duration);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};