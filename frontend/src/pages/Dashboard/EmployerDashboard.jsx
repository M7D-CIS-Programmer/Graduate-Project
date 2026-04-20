import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    FileText,
    Users,
    TrendingUp,
    MessageSquare,
    PlusCircle,
    Eye,
    CheckCircle,
    XCircle
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const EmployerDashboard = () => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const stats = [
        { label: t('totalPostings'), value: '8', icon: <FileText />, color: '#6366f1' },
        { label: t('appliedJobs'), value: '145', icon: <Users />, color: '#10b981' },
        { label: t('activeJobs'), value: '3', icon: <TrendingUp />, color: '#f59e0b' },

    ];

    const [applications, setApplications] = React.useState(() => {
        try {
            return JSON.parse(localStorage.getItem('allApplications') || '[]');
        } catch (e) { return []; }
    });

    const dynamicApplicants = applications.map((app, index) => ({
        id: `dyn-${app.id || index}`,
        originalId: app.id,
        name: app.applicantName,
        role: app.role,
        time: app.time || t('justNow') || 'Just now',
        status: app.status || t('newApplication') || 'New'
    }));

    const handleAction = (actionType, applicant) => {
        if (actionType === 'view') {
            navigate('/profile');
            return;
        }

        if (actionType === 'accept' || actionType === 'reject') {
            if (!applicant.originalId) {
                addToast(
                    t(actionType === 'accept' ? 'candidateAccepted' : 'candidateRejected') ||
                    `Applicant ${actionType === 'accept' ? 'Accepted' : 'Rejected'}`,
                    'success'
                );
                return;
            }

            const updatedStatus = actionType === 'accept' ? 'Hired' : 'Rejected';
            const updatedApps = applications.map(app => {
                if (app.id === applicant.originalId) {
                    return { ...app, status: updatedStatus };
                }
                return app;
            });
            localStorage.setItem('allApplications', JSON.stringify(updatedApps));
            setApplications(updatedApps);

            addToast(
                t(actionType === 'accept' ? 'candidateAccepted' : 'candidateRejected') ||
                `Applicant ${actionType === 'accept' ? 'Accepted' : 'Rejected'}`,
                'success'
            );
        }
    };

    const recentApplicants = [
        ...dynamicApplicants,
        { id: 1, name: 'Ali Hassan', role: t('seniorReactDev'), time: t('oneHourAgo') || '1 hour ago', status: t('reviewing') },
        { id: 2, name: 'Ahmed Ali', role: t('uiDesigner'), time: '3 hours ago', status: t('pendingApproval') || 'New' },
        { id: 3, name: 'Muna Mohamed', role: t('backendDeveloper'), time: '5 hours ago', status: t('shortlisted') },
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">{t('dashboard')}</h1>
                <Link to="/jobs/post" className="btn-primary" style={{ textDecoration: 'none' }}>
                    <PlusCircle size={20} />
                    {t('postNewJob')}
                </Link>
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

            <div className="dashboard-grid">
                <section className="dashboard-section">
                    <h2 className="section-title">
                        <Users size={22} className="text-primary" />
                        {t('recentApplicants')}
                    </h2>
                    <div className="activity-list">
                        {recentApplicants.map(applicant => (
                            <div key={applicant.id} className="activity-item">
                                <div className="activity-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)' }}>
                                    <Users size={20} />
                                </div>
                                <div className="activity-content">
                                    <h4>{applicant.name}</h4>
                                    <p>{applicant.role} • {applicant.status}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-icon" title={t('viewProfile')} onClick={() => handleAction('view', applicant)}><Eye size={18} /></button>
                                    <button className="btn-icon" title={t('accept')} style={{ color: '#10b981' }} onClick={() => handleAction('accept', applicant)}><CheckCircle size={18} /></button>
                                    <button className="btn-icon" title={t('reject')} style={{ color: '#ef4444' }} onClick={() => handleAction('reject', applicant)}><XCircle size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2 className="section-title">
                        <TrendingUp size={22} className="text-primary" />
                        {t('jobPerformance')}
                    </h2>
                    <div className="chart-container">
                        <Bar
                            data={{
                                labels: [t('seniorReactDev'), t('uiDesigner'), t('backendDeveloper')],
                                datasets: [
                                    {
                                        label: t('views'),
                                        data: [450, 290, 310],
                                        backgroundColor: '#6366f1',
                                        borderRadius: 6,
                                    },
                                    {
                                        label: t('appliedJobs'),
                                        data: [84, 42, 38],
                                        backgroundColor: '#10b981',
                                        borderRadius: 6,
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                        labels: { 
                                            color: theme === 'dark' ? '#94a3b8' : '#1e293b', 
                                            font: { size: 10 } 
                                        }
                                    },
                                    tooltip: {
                                        backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                        titleColor: theme === 'dark' ? '#fff' : '#1e293b',
                                        bodyColor: theme === 'dark' ? '#fff' : '#1e293b',
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
            </div>
        </div>
    );
};

export default EmployerDashboard;
