import React, { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../hooks/useJobs';
import { useApplications, useUpdateApplicationStatus } from '../../hooks/useApplications';
import Spinner from '../../components/ui/Spinner';
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
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const { data: allJobs = [], isLoading: jobsLoading } = useJobs();
    const { data: allApplications = [], isLoading: appsLoading } = useApplications();
    const updateStatusMutation = useUpdateApplicationStatus();

    const employerJobs = useMemo(() => {
        return allJobs.filter(j => j.userId === user?.id);
    }, [allJobs, user]);

    const employerJobIds = useMemo(() => employerJobs.map(j => j.id), [employerJobs]);

    const employerApplications = useMemo(() => {
        return allApplications.filter(app => employerJobIds.includes(app.jobId));
    }, [allApplications, employerJobIds]);

    const stats = [
        { label: t('totalPostings'), value: employerJobs.length, icon: <FileText />, color: '#6366f1' },
        { label: t('totalApplicants'), value: employerApplications.length, icon: <Users />, color: '#10b981' },
        { label: t('activeJobs'), value: employerJobs.filter(j => j.status === 'Active').length, icon: <TrendingUp />, color: '#f59e0b' },
    ];

    const handleAction = async (actionType, applicant) => {
        if (actionType === 'view') {
            navigate(`/candidate/${applicant.userId}`);
            return;
        }

        const newStatus = actionType === 'accept' ? 'Shortlisted' : 'Rejected';
        try {
            await updateStatusMutation.mutateAsync({ id: applicant.id, status: newStatus });
            addToast(
                t(actionType === 'accept' ? 'candidateAccepted' : 'candidateRejected') ||
                `Applicant ${actionType === 'accept' ? 'Accepted' : 'Rejected'}`,
                'success'
            );
        } catch (error) {
            addToast(t('actionFailed') || 'Failed to update status', 'error');
        }
    };

    const recentApplicants = useMemo(() => {
        return employerApplications
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(app => ({
                id: app.id,
                userId: app.userId,
                name: app.user?.name || 'Applicant',
                role: app.job?.title || 'Job',
                time: new Date(app.date).toLocaleDateString(),
                status: app.candidateStatus
            }));
    }, [employerApplications]);

    const chartData = useMemo(() => {
        const topJobs = employerJobs.slice(0, 3);
        return {
            labels: topJobs.map(j => j.title),
            apps: topJobs.map(j => employerApplications.filter(a => a.jobId === j.id).length),
            views: topJobs.map(j => j.viewsCount || 0)
        };
    }, [employerJobs, employerApplications]);

    if (jobsLoading || appsLoading) return <Spinner />;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('employerDashboard')}</h1>
                    <p className="subtitle">{t('employerDashboardSubtitle') || 'Manage your listings and candidates'}</p>
                </div>
                <Link to="/jobs/post" className="btn-primary" style={{ textDecoration: 'none' }}>
                    <PlusCircle size={20} />
                    {t('postNewJob')}
                </Link>
            </div>

            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card glass">
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
                <div className="dashboard-section glass">
                    <div className="section-header">
                        <h2>
                            <Users size={20} />
                            {t('recentApplicants')}
                        </h2>
                    </div>
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
                        {recentApplicants.length === 0 && (
                            <p className="empty-msg">{t('noApplicants') || 'No recent applicants.'}</p>
                        )}
                    </div>
                </div>

                <div className="dashboard-section glass">
                    <div className="section-header">
                        <h2>
                            <TrendingUp size={20} />
                            {t('jobPerformance')}
                        </h2>
                    </div>
                    <div className="chart-container">
                        <Bar
                            data={{
                                labels: chartData.labels,
                                datasets: [
                                    {
                                        label: t('views'),
                                        data: chartData.views,
                                        backgroundColor: '#6366f1',
                                        borderRadius: 6,
                                    },
                                    {
                                        label: t('totalApplicants'),
                                        data: chartData.apps,
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
                                            color: 'var(--text-muted)',
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
                                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                                        ticks: { color: 'var(--text-muted)' }
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
            </div>
        </div>
    );
};

export default EmployerDashboard;
