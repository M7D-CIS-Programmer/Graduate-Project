import React from 'react';
<<<<<<< HEAD:frontend/src/pages/Dashboard/AppliedJobs.jsx
import Spinner from '../../components/ui/Spinner';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Clock, CheckCircle, XCircle, Building2, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '../../hooks/useApplications';
import './Dashboard.css';
import '../User.css';
=======
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Dashboard/AppliedJobs.jsx

const AppliedJobs = () => {
    const { t, dir } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
<<<<<<< HEAD:frontend/src/pages/Dashboard/AppliedJobs.jsx
    const { data: allApplications = [], isLoading } = useApplications();
    const applications = user?.id ? allApplications.filter(app => app.userId === user.id) : allApplications;

    const getStatusKey = (status) => {
        if (!status) return 'pending';
        const s = status.toLowerCase().replace(/\s+/g, '');
        if (s === 'interviewscheduled') return 'interviewScheduled';
        return s;
    };

    const getStatusIcon = (status) => {
        const key = getStatusKey(status);
        switch (key) {
            case 'interviewScheduled':
            case 'hired':
            case 'accepted':
                return <CheckCircle size={18} />;
            case 'rejected':
                return <XCircle size={18} />;
            case 'reviewing':
                return <Clock size={18} />;
            default:
                return <Briefcase size={18} />;
        }
    };

    const getStatusClass = (status) => {
        const key = getStatusKey(status);
        switch (key) {
            case 'interviewScheduled':
            case 'hired':
            case 'accepted':
                return 'hired';
            case 'rejected':
                return 'rejected';
            case 'reviewing':
                return 'reviewing';
            default:
                return 'pending';
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <div className={`user-page-container ${dir}`}>
=======

    // Mock data for applied jobs
    const appliedJobs = user?.appliedJobs?.length > 0 ? user.appliedJobs : [
        { id: 1, title: 'seniorReactDev', company: 'TechVision', status: 'reviewing', date: '2023-10-25', location: 'Remote', type: 'Full-time' },
        { id: 2, title: 'uiuxDesigner', company: 'CreativePulse', status: 'interviewScheduled', date: '2023-10-20', location: 'Irbid', type: 'Contract' },
        { id: 3, title: 'marketingManager', company: 'DataFlow', status: 'rejected', date: '2023-10-15', location: 'Amman', type: 'Full-time' },
        { id: 4, title: 'engineering', company: 'InnovateTech', status: 'applied', date: '2023-10-28', location: 'Remote', type: 'Full-time' }
    ];

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'interview scheduled':
            case 'interviewscheduled':
            case 'hired':
                return <CheckCircle size={16} />;
            case 'rejected':
                return <XCircle size={16} />;
            case 'reviewing':
                return <Clock size={16} />;
            default:
                return <Briefcase size={16} />;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status.toLowerCase()) {
            case 'interview scheduled':
            case 'interviewscheduled':
            case 'hired':
                return 'status-badge success';
            case 'rejected':
                return 'status-badge danger';
            case 'reviewing':
                return 'status-badge warning';
            default:
                return 'status-badge primary';
        }
    };

    return (
        <div className={`dashboard-container ${dir}`}>
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Dashboard/AppliedJobs.jsx
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('myApplications')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('applicationsSubtitle')}</p>
                </div>
            </div>

<<<<<<< HEAD:frontend/src/pages/Dashboard/AppliedJobs.jsx
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applications.length > 0 ? (
                    applications.map(app => (
                        <div key={app.id} className="notification-item">
                            <div 
                                className="notification-icon-wrapper"
                                style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    color: 'var(--primary)'
                                }}
                            >
                                <Building2 size={24} />
                            </div>
                            
                            <div className="notification-content">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{app.job?.title || 'Job Deleted'}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{app.job?.user?.name || 'Company'}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <MapPin size={14} />
                                                {app.job?.location || t('remote')}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <span className="notification-date" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <Calendar size={14} />
                                                {new Date(app.date).toLocaleDateString()}
                                            </span>
                                            <span className="notification-date" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <Briefcase size={14} />
                                                {app.job?.type || t('fullTime')}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                        <span 
                                            className={`status-badge ${getStatusClass(app.candidateStatus)}`}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {getStatusIcon(app.candidateStatus)}
                                            {t(getStatusKey(app.candidateStatus))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <Briefcase size={64} className="empty-icon" />
                        <h3>{t('noJobsFound')}</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('exploreCompanies')}</p>
                    </div>
                )}
=======
            <div className="dashboard-grid full-width" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
                <section className="dashboard-section table-section">
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>{t('jobTitle')}</th>
                                    <th>{t('company')}</th>
                                    <th>{t('postedDate')}</th>
                                    <th>{t('status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appliedJobs.map(job => (
                                    <tr key={job.id}>
                                        <td>
                                            <div className="user-info-cell">
                                                <div className="user-avatar-small" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                                    <Briefcase size={16} />
                                                </div>
                                                <div>
                                                    <p className="user-name-cell">{t(job.title) || job.title}</p>
                                                    <span className="user-email-cell">{job.type || 'Full-time'} • {job.location || 'Remote'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{job.company}</td>
                                        <td>{job.date || job.time || t('justNow')}</td>
                                        <td>
                                            <span
                                                className={getStatusBadgeClass(job.status)}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {getStatusIcon(job.status)}
                                                {t(job.status) || job.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {appliedJobs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                            {t('noSavedJobs')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Dashboard/AppliedJobs.jsx
            </div>
        </div>
    );
};

<<<<<<< HEAD:frontend/src/pages/Dashboard/AppliedJobs.jsx

=======
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Dashboard/AppliedJobs.jsx
export default AppliedJobs;
