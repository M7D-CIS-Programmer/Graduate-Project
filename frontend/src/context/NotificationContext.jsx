import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const { t } = useLanguage();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [lastChecked, setLastChecked] = useState(null);

    const fetchUnreadCount = useCallback(async (showToast = false) => {
        if (!user?.id) return;

        try {
            const data = await api.getNotificationsByUserId(user.id, user.role);
            setNotifications(data);
            const count = data.filter(n => !n.isRead).length;
            setUnreadCount(count);

            if (showToast && count > 0) {
                const message = t('unreadNotificationsToast').replace('{count}', count);
                addToast(message, 'info');
            }
        } catch (error) {
            console.error('Failed to fetch unread notifications:', error);
        }
    }, [user?.id, addToast, t]);

    const markAsRead = async (notificationId) => {
        try {
            await api.markNotificationAsRead(notificationId);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.deleteNotification(id);
            setNotifications(prev => {
                const updated = prev.filter(n => n.id !== id);
                setUnreadCount(updated.filter(n => !n.isRead).length);
                return updated;
            });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const clearAll = async () => {
        if (!user?.id) return;
        try {
            await api.clearAllNotifications(user.id);
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    const markAllRead = async () => {
        if (!user?.id) return;
        try {
            await api.markAllNotificationsAsRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        if (!user?.id) {
            setUnreadCount(0);
            setNotifications([]);
            return;
        }

        // Fetch immediately
        fetchUnreadCount(true);

        // Set up polling interval (every 5 seconds)
        const interval = setInterval(() => {
            fetchUnreadCount(false); // Don't show toast on background polling
        }, 5000);

        return () => clearInterval(interval);
    }, [user?.id, fetchUnreadCount]);

    return (
        <NotificationContext.Provider value={{ 
            unreadCount, 
            setUnreadCount, 
            fetchUnreadCount, 
            notifications, 
            markAsRead,
            deleteNotification,
            clearAll,
            markAllRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
