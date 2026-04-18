import React, { useState } from 'react';
import {
    Briefcase,
    MapPin,
    Trash2,
    Building,
    DollarSign
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import './Jobs/Jobs.css';
import './User.css';

const SavedJobs = () => {
    const { t } = useLanguage();
    const { user, updateUser } = useAuth();

    const savedJobs = user?.savedJobs || [];

    const removeJob = (id) => {
        const newSavedJobs = savedJobs.filter(job => job.id !== id);
        updateUser({ savedJobs: newSavedJobs });
    };

    return (
        <div className="user-page-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">{t('savedJobs')}</h1>
            </div>

            {savedJobs.length > 0 ? (
                <div className="jobs-grid">
                    {savedJobs.map(job => (
                        <div key={job.id} className="card">
                            <div className="job-card-header">
                                <div className="company-logo-placeholder">
                                    <Building size={24} color="var(--text-muted)" />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span className="job-type-badge">{job.type}</span>
                                    <button
                                        onClick={() => removeJob(job.id)}
                                        style={{ color: '#ef4444', padding: '4px', borderRadius: '8px' }}
                                        className="hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="job-title">{job.title}</h3>
                            <p className="job-meta">{job.company} • {job.location}</p>
                            <div className="job-card-footer">
                                <span className="job-salary">{job.salary}</span>
                                <Button variant="secondary" size="sm" onClick={() => window.location.href = `/jobs/${job.id}`}>{t('details')}</Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <Briefcase size={64} className="empty-icon" />
                    <h3>{t('noSavedJobs')}</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('matchingSubtitle')}</p>
                    <Button style={{ marginTop: '1.5rem' }} onClick={() => window.location.href = '/jobs'}>
                        {t('findJobs')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SavedJobs;
