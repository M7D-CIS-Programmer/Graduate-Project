import React from 'react';
import Spinner from '../../components/ui/Spinner';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Clock, CheckCircle, XCircle, Building2, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '../../hooks/useApplications';
import './Dashboard.css';
import '../User.css';
import { formatFriendlyDate } from '../../utils/dateUtils';

const AppliedJobs = () => {
    const { t, dir, language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
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
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('myApplications')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('applicationsSubtitle')}</p>
                </div>
            </div>

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
                                                {formatFriendlyDate(app.date, language)}
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
            </div>
        </div>
    );
};


export default AppliedJobs;
