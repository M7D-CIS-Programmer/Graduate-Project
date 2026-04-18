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
import Button from '../components/ui/Button';
import './User.css';

const Notifications = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Load role-specific notifications
        if (user?.role === 'Admin') {
            setNotifications([
                {
                    id: 1,
                    title: t('adminJobsApproval'),
                    message: t('adminJobsApprovalMsg'),
                    time: t('twoHoursAgo'),
                    type: 'jobs',
                    unread: true,
                    icon: <Briefcase />
                },
                {
                    id: 2,
                    title: t('adminCompanyApproval'),
                    message: t('adminCompanyApprovalMsg'),
                    time: t('oneDayAgo'),
                    type: 'companies',
                    unread: true,
                    icon: <Building2 />
                },
                {
                    id: 3,
                    title: t('systemUpdate'),
                    message: t('systemUpdateMsg'),
                    time: t('twoDaysAgo'),
                    type: 'system',
                    unread: false,
                    icon: <CheckCircle />
                },
            ]);
        } else if (user?.role === 'Employer') {
            setNotifications([
                {
                    id: 1,
                    title: t('newApplication'),
                    message: t('newApplicantsSummary').replace('{count}', '5'),
                    time: t('twoHoursAgo'),
                    type: 'applicants',
                    unread: true,
                    icon: <Users />
                },
                {
                    id: 2,
                    title: t('interviewReminder'),
                    message: t('interviewReminderMsg').replace('{name}', 'Muna Mohamed').replace('{time}', '2:00 PM'),
                    time: t('twoDaysAgo'),
                    type: 'interview',
                    unread: false,
                    icon: <Clock />
                },
            ]);
        } else {
            const dynamicNotifications = (user?.notifications || []).map(notif => ({
                ...notif, 
                icon: notif.iconName === 'CheckCircle' ? <CheckCircle /> : <Briefcase />
            }));
            
            setNotifications([
                ...dynamicNotifications,
                { id: 1, title: t('applicationViewed'), message: t('applicationViewedMsg'), time: t('twoHoursAgo'), type: 'view', unread: true, icon: <Briefcase /> },
                { id: 2, title: t('interviewScheduled'), message: t('interviewScheduledMsg'), time: t('twoDaysAgo'), type: 'interview', unread: false, icon: <Clock /> },
            ]);
        }
    }, [user, t]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <div className="user-page-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">{t('notifications')}</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="secondary" onClick={markAllRead}>
                        <Check size={18} />
                        {t('markAsRead')}
                    </Button>
                    <Button variant="secondary" onClick={clearAll} style={{ color: '#ef4444' }}>
                        <Trash2 size={18} />
                        {t('clearAll')}
                    </Button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
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
                            {notif.unread && (
                                <div style={{
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '1.5rem',
                                    width: '8px',
                                    height: '8px',
                                    background: 'var(--primary)',
                                    borderRadius: '50%'
                                }}></div>
                            )}
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
