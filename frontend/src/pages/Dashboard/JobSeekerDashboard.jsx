import React, { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useApplications } from '../../hooks/useApplications';
import { useSavedJobs } from '../../hooks/useSavedJobs';
import Spinner from '../../components/ui/Spinner';
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
    const { data: allApplications = [], isLoading } = useApplications();
    const { data: savedJobs = [], isLoading: isLoadingSavedJobs } = useSavedJobs();

    const userApplications = useMemo(() => {
        return allApplications.filter(app => app.userId === user?.id);
    }, [allApplications, user]);

    const stats = [
        { label: t('appliedJobs'), value: userApplications.length, icon: <Briefcase />, color: '#6366f1' },
        { label: t('interviews'), value: userApplications.filter(a => a.candidateStatus === 'Shortlisted').length, icon: <CheckCircle />, color: '#10b981' },
        { label: t('pending'), value: userApplications.filter(a => a.candidateStatus === 'Applied').length, icon: <Clock />, color: '#f59e0b' },
        { label: t('saved'), value: savedJobs.length || 0, icon: <Bookmark />, color: '#ec4899' },
    ];

    const chartData = useMemo(() => {
        const months = [];
        const data = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            months.push(t(monthName.toLowerCase()) || monthName);
            
            const count = userApplications.filter(app => {
                const appDate = new Date(app.date);
                return appDate.getMonth() === d.getMonth() && appDate.getFullYear() === d.getFullYear();
            }).length;
            data.push(count);
        }
        
        return { months, data };
    }, [userApplications, t]);

    const recentActivity = useMemo(() => {
        return userApplications
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4)
            .map(app => ({
                id: app.id,
                title: app.job?.title || 'Job Application',
                company: app.job?.company || 'Company',
                status: app.candidateStatus,
                time: new Date(app.date).toLocaleDateString(),
                icon: <Briefcase />,
                color: '#6366f1'
            }));
    }, [userApplications]);

    if (isLoading || isLoadingSavedJobs) return <Spinner />;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('welcomeBack')}, {user?.name}!</h1>
                    <p className="subtitle">{t('dashboardSubtitle')}</p>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card glass">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-details">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-section main-chart glass">
                    <div className="section-header">
                        <h2>
                            <TrendingUp size={20} />
                            {t('applicationActivity')}
                        </h2>
                    </div>
                    <div className="chart-container">
                        <Line
                            data={{
                                labels: chartData.months,
                                datasets: [{
                                    fill: true,
                                    label: t('appliedJobs'),
                                    data: chartData.data,
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
                                        beginAtZero: true,
                                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                                        ticks: { 
                                            stepSize: 1,
                                            color: 'var(--text-muted)' 
                                        }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: 'var(--text-muted)' }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="dashboard-section glass">
                    <div className="section-header">
                        <h2>
                            <Clock size={20} />
                            {t('recentActivity')}
                        </h2>
                    </div>
                    <div className="activity-list">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-icon" style={{ backgroundColor: `${activity.color}15`, color: activity.color }}>
                                    {activity.icon}
                                </div>
                                <div className="activity-details">
                                    <h4>{activity.title}</h4>
                                    <p>{activity.company} • {activity.time}</p>
                                </div>
                                <span className={`status-badge ${activity.status.toLowerCase()}`}>
                                    {activity.status}
                                </span>
                            </div>
                        ))}
                        {recentActivity.length === 0 && (
                            <p className="empty-msg">{t('noActivity') || 'No recent activity found.'}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobSeekerDashboard;
