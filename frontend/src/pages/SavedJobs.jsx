import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Briefcase, MapPin, Trash2, Building, DollarSign, Loader } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { useSavedJobs, useUnsaveJob } from '../hooks/useSavedJobs';
import './Jobs/Jobs.css';
import './User.css';

const formatSalary = (min, max, negotiable) => {
    if (negotiable) return 'Negotiable';
    if (!min && !max) return null;
    const fmt = (n) => `$${Number(n).toLocaleString()}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
};

const SavedJobs = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: savedJobs = [], isLoading, isError } = useSavedJobs();
    const { mutate: unsave, isPending: isRemoving } = useUnsaveJob();

    if (!user) return <Navigate to="/login" replace />;

    if (isLoading) {
        return (
            <div className="user-page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="user-page-container">
                <p style={{ color: '#ef4444' }}>{t('actionFailed') || 'Failed to load saved jobs.'}</p>
            </div>
        );
    }

    return (
        <div className="user-page-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('savedJobs')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
                    </p>
                </div>
            </div>

            {savedJobs.length > 0 ? (
                <div className="jobs-grid">
                    {savedJobs.map(job => (
                        <div key={job.id} className="card">
                            <div className="job-card-header">
                                <div className="company-logo-placeholder">
                                    <Building size={24} color="var(--text-muted)" />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span className="job-type-badge">{job.type}</span>
                                    <button
                                        onClick={() => unsave(job.id)}
                                        disabled={isRemoving}
                                        title="Remove from saved"
                                        style={{ color: '#ef4444', padding: '4px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="job-title">{job.title}</h3>
                            <p className="job-meta">
                                {job.company}
                                {job.location && ` • ${job.location}`}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                {job.category} • {job.workMode}
                            </p>

                            <div className="job-card-footer">
                                {formatSalary(job.salaryMin, job.salaryMax, job.isSalaryNegotiable) && (
                                    <span className="job-salary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <DollarSign size={14} />
                                        {formatSalary(job.salaryMin, job.salaryMax, job.isSalaryNegotiable)}
                                    </span>
                                )}
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => navigate(`/jobs/${job.jobId}`)}
                                >
                                    {t('details')}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <Briefcase size={64} className="empty-icon" />
                    <h3>{t('noSavedJobs')}</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('matchingSubtitle')}</p>
                    <Button style={{ marginTop: '1.5rem' }} onClick={() => navigate('/jobs')}>
                        {t('findJobs')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SavedJobs;
