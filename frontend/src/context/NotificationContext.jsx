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
    const [lastChecked, setLastChecked] = useState(null);

    const fetchUnreadCount = useCallback(async (showToast = false) => {
        if (!user?.id) return;

        try {
            const notifications = await api.getNotificationsByUserId(user.id, user.role);
            const count = notifications.filter(n => !n.isRead).length;
            setUnreadCount(count);

            if (showToast && count > 0) {
                const message = t('unreadNotificationsToast').replace('{count}', count);
                addToast(message, 'info');
            }
        } catch (error) {
            console.error('Failed to fetch unread notifications:', error);
        }
    }, [user?.id, addToast, t]);

    // Initial fetch when user logs in or app loads
    useEffect(() => {
        if (user?.id) {
            fetchUnreadCount(true);
        } else {
            setUnreadCount(0);
        }
    }, [user?.id]); // Only trigger when user object itself changes (login/logout)

    return (
        <NotificationContext.Provider value={{ unreadCount, setUnreadCount, fetchUnreadCount }}>
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
