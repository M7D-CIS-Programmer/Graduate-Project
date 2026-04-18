import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    Briefcase,
    CheckCircle,
    Clock,
    Bookmark,
    Bell,
    Star,
    TrendingUp
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const JobSeekerDashboard = () => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { user } = useAuth();
    const stats = [
        { label: t('appliedJobs'), value: user?.appliedJobs?.length || '0', icon: <Briefcase />, color: '#6366f1' },
        { label: t('interviews'), value: '3', icon: <CheckCircle />, color: '#10b981' },
        { label: t('pending'), value: '5', icon: <Clock />, color: '#f59e0b' },
        { label: t('saved'), value: '24', icon: <Bookmark />, color: '#ec4899' },
    ];

    const dynamicAppliedActivity = (user?.appliedJobs || []).map((job, index) => ({
        id: `applied-${index}`,
         title: t('appliedSuccess') || 'Application Sent',
         company: job.company,
         status: t('appliedJobs'),
         time: job.time || t('justNow') || 'Just now', // Can use a relative time parser here, or just basic mapping
         icon: <Briefcase />,
         color: '#6366f1'
    }));
    
    const recentActivity = [
        ...dynamicAppliedActivity,
<<<<<<< HEAD:frontend/src/pages/Dashboard/JobSeekerDashboard.jsx
        { id: 1, title: t('applicationSent'), company: 'TechVision', status: t('appliedJobs'), time: t('twoHoursAgo'), icon: <Briefcase />, color: '#6366f1' },
        { id: 2, title: t('interviewScheduled'), company: 'CreativePulse', status: t('upcoming'), time: t('oneDayAgo'), icon: <Clock />, color: '#f59e0b' },
        { id: 3, title: t('resumeViewed'), company: 'DataFlow', status: t('applicationViewed'), time: t('twoDaysAgo'), icon: <Star />, color: '#10b981' },
=======
        { id: 1, title: 'Application Sent', company: 'TechVision', status: t('appliedJobs'), time: '2 hours ago', icon: <Briefcase />, color: '#6366f1' },
        { id: 2, title: 'Interview Scheduled', company: 'CreativePulse', status: 'Upcoming', time: '1 day ago', icon: <Clock />, color: '#f59e0b' },
        { id: 3, title: 'Resume Viewed', company: 'DataFlow', status: 'Viewed', time: '2 days ago', icon: <Star />, color: '#10b981' },
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Dashboard/JobSeekerDashboard.jsx
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('welcomeBack')}, {user?.name || t('jobSeeker')}!</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('dashboardSubtitle')}</p>
                </div>
            </div>


            <div className="dashboard-stats">
                {stats.map((stat, i) => (
                    <div key={i} className="card stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div>
                            <h3 className="stat-value">{stat.value}</h3>
                            <p className="stat-label">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <section className="dashboard-section" style={{ marginBottom: '2rem' }}>
                <h2 className="section-title">
                    <TrendingUp size={22} className="text-primary" />
                    {t('overview')} - {t('appliedJobs')}
                </h2>
                <div className="chart-container">
                    <Line
                        data={{
                            labels: [t('jan'), t('feb'), t('mar'), t('apr'), t('may'), t('jun')],
                            datasets: [{
                                fill: true,
                                label: t('appliedJobs'),
                                data: [4, 7, 5, 12, 8, 15],
                                borderColor: '#6366f1',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                tension: 0.4,
                                pointBackgroundColor: '#6366f1',
                                pointBorderColor: '#fff',
                                pointHoverRadius: 6,
                            }]
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                    titleColor: theme === 'dark' ? '#fff' : '#1e293b',
                                    bodyColor: theme === 'dark' ? '#fff' : '#1e293b',
                                    padding: 12,
                                    cornerRadius: 8,
                                }
                            },
                            scales: {
                                y: {
                                    grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                                    ticks: { color: theme === 'dark' ? '#94a3b8' : '#1e293b' }
                                },
                                x: {
                                    grid: { display: false },
                                    ticks: { color: theme === 'dark' ? '#94a3b8' : '#1e293b' }
                                }
                            }
                        }}
                    />
                </div>
            </section>

            <div className="dashboard-grid">
                <section className="dashboard-section">
                    <h2 className="section-title">
                        <Briefcase size={22} className="text-primary" />
                        {t('recentApplications')}
                    </h2>
                    <div className="activity-list">
                        {recentActivity.map(activity => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-icon" style={{ backgroundColor: `${activity.color}15`, color: activity.color }}>
                                    {activity.icon}
                                </div>
                                <div className="activity-content">
                                    <h4>{activity.title}</h4>
                                    <p>{activity.company} • {activity.status}</p>
                                </div>
                                <span className="activity-time">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">
                        <Bell size={22} className="text-primary" />
                        {t('notifications')}
                    </h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-content">
                                <h4>{t('newJobMatch')}</h4>
                                <p>{t('seniorReactDev')} at WebSync {t('jobMatchSubtitle')}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default JobSeekerDashboard;
