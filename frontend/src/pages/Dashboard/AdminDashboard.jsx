import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
    Users,
    Building2,
    Briefcase,
    DollarSign,
    TrendingUp,
    MoreVertical,
    CheckCircle,
    XCircle,
    Eye
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
import { useUsers } from '../../hooks/useUsers';
import { useJobs } from '../../hooks/useJobs';
import { useApplications } from '../../hooks/useApplications';

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

const AdminDashboard = () => {
    const { theme } = useTheme();
    const { t, dir } = useLanguage();
    const { data: rawUsers = [], isLoading: usersLoading } = useUsers();
    const { data: rawJobs = [], isLoading: jobsLoading } = useJobs();
    const { data: rawApplications = [], isLoading: appsLoading } = useApplications();
    const isLoading = usersLoading || jobsLoading || appsLoading;

    const stats = [
        { label: t('totalUsers'), value: rawUsers.length.toString(), icon: <Users />, color: '#6366f1', trend: '+12%' },
        { label: t('totalCompanies'), value: rawUsers.filter(u => u.role === 'Employer').length.toString(), icon: <Building2 />, color: '#10b981', trend: '+5%' },
        { label: t('activeJobs'), value: rawJobs.length.toString(), icon: <Briefcase />, color: '#f59e0b', trend: '+18%' },
    ];

    const recentUsers = rawUsers.slice(0, 4).map(u => ({
        id: u.id,
        name: u.name,
        role: u.role === 'Employer' ? t('employer') : t('jobSeeker'),
        date: t('justNow') || 'Recently',
        status: u.status === 'Active' ? t('active') : u.status || t('active')
    }));

    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const dynamicLabels = [];
    const dynamicActivityData = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        dynamicLabels.push(t(monthKeys[d.getMonth()]));

        const m = d.getMonth();
        const y = d.getFullYear();

        const uCount = rawUsers.filter(u => {
            const date = new Date(u.createdAt);
            return date.getMonth() === m && date.getFullYear() === y;
        }).length;
        const jCount = rawJobs.filter(j => {
            const date = new Date(j.postedDate);
            return date.getMonth() === m && date.getFullYear() === y;
        }).length;
        const aCount = rawApplications.filter(a => {
            const date = new Date(a.date);
            return date.getMonth() === m && date.getFullYear() === y;
        }).length;

        dynamicActivityData.push(uCount + jCount + aCount);
    }

    const chartData = {
        labels: dynamicLabels,
        datasets: [
            {
                label: t('platformActivity'),
                data: dynamicActivityData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#6366f1'
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: theme === 'dark' ? '#fff' : '#1e293b',
                bodyColor: theme === 'dark' ? '#fff' : '#1e293b',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderWidth: 1
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
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('adminDashboard')}</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t('overview')}</p>
                </div>
                <Link to="/dashboard/admin/users" className="btn-primary" style={{ textDecoration: 'none' }}>
                    <Users size={18} />
                    {t('manageUsers')}
                </Link>
            </div>

            <div className="dashboard-stats">
                {stats.map((stat, i) => (
                    <div key={i} className="card stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <span style={{
                                color: '#10b981',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '100px'
                            }}>
                                <TrendingUp size={14} />
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <h3 className="stat-value" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{stat.value}</h3>
                            <p className="stat-label">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <section className="dashboard-section" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>
                            <TrendingUp size={22} className="text-primary" />
                            {t('platformActivity')}
                        </h2>
                    </div>
                    <div className="chart-container" style={{ height: '350px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </section>

                <section className="dashboard-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>
                            <Users size={22} className="text-primary" />
                            {t('recentUsers')}
                        </h2>
                        <button className="btn-icon"><MoreVertical size={18} /></button>
                    </div>
                    <div className="activity-list">
                        {recentUsers.map(user => (
                            <div key={user.id} className="activity-item">
                                <div className="activity-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)' }}>
                                    <Users size={20} />
                                </div>
                                <div className="activity-content">
                                    <h4>{user.name}</h4>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {user.role}
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: '100px',
                                            background: user.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: user.status === 'Active' ? '#10b981' : '#f59e0b'
                                        }}>
                                            {user.status}
                                        </span>
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', opacity: 0.7 }}>
                                    <Link 
                                        to={rawUsers.find(ru => ru.id === user.id)?.role === 'Employer' ? `/profile/${user.id}` : `/resume/${user.id}`}
                                        className="btn-icon primary" 
                                        title={t('viewProfile')}
                                    >
                                        <Eye size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link 
                        to="/dashboard/admin/users" 
                        className="btn-primary" 
                        style={{ width: '100%',color:'var(--text-main)', marginTop: '1.5rem', background: 'var(bg-dark)', boxShadow: 'none', textAlign: 'center', textDecoration: 'none', display: 'block' }}
                    >
                        {t('viewAll')}
                    </Link>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
