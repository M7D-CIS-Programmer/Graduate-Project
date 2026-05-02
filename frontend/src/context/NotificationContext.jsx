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

    // Initial fetch when user logs in or app loads
    useEffect(() => {
        if (user?.id) {
            fetchUnreadCount(true);
        } else {
            setUnreadCount(0);
            setNotifications([]);
        }
    }, [user?.id]); // Only trigger when user object itself changes (login/logout)

    return (
        <NotificationContext.Provider value={{ 
            unreadCount, 
            setUnreadCount, 
            fetchUnreadCount, 
            notifications, 
            markAsRead 
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
