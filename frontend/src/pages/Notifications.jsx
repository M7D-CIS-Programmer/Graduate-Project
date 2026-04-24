import React, { useState, useEffect } from 'react';
import {
    Bell,
    Briefcase,
    Building2,
    CheckCircle,
    Clock,
    MessageSquare,
    Trash2,
    Check,
    Users
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../api/api';
import Button from '../components/ui/Button';
import { formatTimeAgo } from '../utils/dateUtils';
import './User.css';

const Notifications = () => {
    const { t, dir } = useLanguage();
    const { user } = useAuth();
    const { setUnreadCount } = useNotifications();
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        if (!user?.id) return;
        
        try {
            const data = await api.getNotificationsByUserId(user.id, user.role);
            
            // Map backend notifications to UI structure
            const mappedNotifications = data.map(notif => {
                let icon = <Bell />;
                let title = notif.title;
                let message = notif.message;
                
                // Simple regex mapping for backend English strings
                if (message.includes("Your application for '") && message.includes("' has been updated to: ")) {
                    const match = message.match(/Your application for '(.+)' has been updated to: (.+)/);
                    if (match) {
                        title = t('applicationStatusUpdate');
                        message = t('applicationStatusUpdateMsg', { jobTitle: match[1], status: t(match[2].toLowerCase()) || match[2] });
                    }
                } else if (message.includes("viewed your resume")) {
                    const match = message.match(/(.+) viewed your resume/);
                    if (match) {
                        title = t('resumeViewed');
                        message = t('employerViewedResumeMsg', { company: match[1] });
                    }
                } else if (message.includes("Your application for ") && message.includes(" has been received")) {
                    const match = message.match(/Your application for (.+) has been received/);
                    if (match) {
                        title = t('applicationReceived');
                        message = t('applicationReceivedMsg', { jobTitle: match[1] });
                    }
                } else if (message.includes("An employer viewed your profile")) {
                    title = t('applicationViewed');
                    message = t('employerViewedProfileMsg');
                }
                
                if (notif.type === 'Application') icon = <Users />;
                else if (notif.type === 'StatusUpdate') icon = <CheckCircle />;
                else if (notif.type === 'ProfileView') icon = <Building2 />;
                else if (notif.type === 'ResumeView') icon = <Briefcase />;
                
                return {
                    id: notif.id,
                    title: title,
                    message: message,
                    time: formatTimeAgo(notif.createdAt, t, dir === 'rtl' ? 'ar' : 'en'),
                    unread: !notif.isRead,
                    icon: icon,
                    type: notif.type?.toLowerCase()
                };
            });

            setNotifications(mappedNotifications);
            setUnreadCount(mappedNotifications.filter(n => n.unread).length);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user?.id, t, setUnreadCount]);

    const markAsRead = async (id) => {
        try {
            await api.markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllRead = async () => {
        if (!user?.id) return;
        try {
            await api.markAllNotificationsAsRead(user.id);
            setNotifications(notifications.map(n => ({ ...n, unread: false })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const clearAll = async () => {
        if (!user?.id) return;
        try {
            await api.clearAllNotifications(user.id);
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to clear notifications:', err);
        }
    };

    const deleteOne = async (e, id) => {
        e.stopPropagation();
        try {
            await api.deleteNotification(id);
            setNotifications(prev => {
                const filtered = prev.filter(n => n.id !== id);
                setUnreadCount(filtered.filter(n => n.unread).length);
                return filtered;
            });
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    return (
        <div className={`user-page-container ${dir}`}>
            <div className="dashboard-header">
                <h1 className="dashboard-title">{t('notifications')}</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="secondary" onClick={markAllRead} disabled={notifications.length === 0}>
                        <Check size={18} />
                        {t('markAsRead')}
                    </Button>
                    <Button variant="secondary" onClick={clearAll} style={{ color: '#ef4444' }} disabled={notifications.length === 0}>
                        <Trash2 size={18} />
                        {t('clearAll')}
                    </Button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div 
                            key={notif.id} 
                            className={`notification-item ${notif.unread ? 'unread' : ''}`}
                            onClick={() => notif.unread && markAsRead(notif.id)}
                            style={{ cursor: notif.unread ? 'pointer' : 'default' }}
                        >
                            <div
                                className="notification-icon-wrapper"
                                style={{
                                    background: notif.unread ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    color: notif.unread ? 'var(--primary)' : 'var(--text-muted)'
                                }}
                            >
                                {notif.icon}
                            </div>
                            <div className="notification-content">
                                <h4>{notif.title}</h4>
                                <p>{notif.message}</p>
                                <span className="notification-date">{notif.time}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {notif.unread && <div className="notification-unread-dot"></div>}
                                <button 
                                    className="delete-notif-btn" 
                                    onClick={(e) => deleteOne(e, notif.id)}
                                    title="Delete"
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5 }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <Bell size={64} className="empty-icon" />
                        <h3>{t('noNotifications')}</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('allCaughtUp')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
