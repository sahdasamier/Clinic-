import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../types/models';
import { notificationsApi } from '../api/notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<Notification[]>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user data - replace with actual user context
  const currentUser = {
    id: 'user-1',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getAll(currentUser.clinicId, currentUser.branchId);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead(currentUser.clinicId, currentUser.branchId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  const refreshNotifications = async () => {
    try {
      const data = await notificationsApi.refresh(currentUser.clinicId, currentUser.branchId);
      setNotifications(data);
      return data;
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Listen for data updates to refresh notifications in real-time
    const handleDataUpdate = (event: CustomEvent) => {
      console.log('Data updated, refreshing notifications:', event.detail);
      // Small delay to ensure data is saved before refreshing notifications
      setTimeout(() => {
        loadNotifications();
      }, 100);
    };
    
    window.addEventListener('dataUpdated', handleDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate as EventListener);
    };
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    setNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 