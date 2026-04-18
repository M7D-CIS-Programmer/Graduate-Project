import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMyJobs } from '../../hooks/useJobs';
import Spinner from '../../components/ui/Spinner';
import {
    Briefcase,
    Calendar,
    Eye,
    Edit,
    Trash2,
    Users,
    Search,
    ExternalLink
} from 'lucide-react';
import './Dashboard.css';

const MyJobs = () => {
    const { t, dir } = useLanguage();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const { data: jobs = [], isLoading } = useMyJobs(user?.id);

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        return status === 'Active' ? '#10b981' : '#f59e0b';
    };

    if (isLoading) return <Spinner />;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">{t('myJobs')}</h1>
                <div className="search-box glass" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: '12px' }}>
                    <Search size={18} style={{ color: 'var(--text-muted)', marginRight: dir === 'ltr' ? '0.5rem' : '0', marginLeft: dir === 'rtl' ? '0.5rem' : '0' }} />
                    <input
                        type="text"
                        placeholder={t('search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'white', outline: 'none' }}
                    />
                </div>
            </div>

            <div className="dashboard-section" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('jobTitle')}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('postedDate')}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('status')}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('appliedJobs')}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('views')}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'center' }}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredJobs.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    {t('noJobsFound') || 'No jobs found.'}
                                </td>
                            </tr>
                        ) : (
                            filteredJobs.map(job => (
                                <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div className="activity-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                                                <Briefcase size={20} />
                                            </div>
                                            <div style={{ fontWeight: '600' }}>{job.title}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            <Calendar size={14} />
                                            {job.postedDate || new Date().toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <span style={{
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: `${getStatusColor(job.status || 'Active')}20`,
                                            color: getStatusColor(job.status || 'Active')
                                        }}>
                                            {job.status === 'Active' ? t('active') : t('closed')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                                            <Users size={16} className="text-primary" />
                                            {job.applicantsCount}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                                            <Eye size={16} style={{ color: '#ec4899' }} />
                                            {job.viewsCount || 0}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button className="btn-icon" title={t('edit')}><Edit size={18} /></button>
                                            <button className="btn-icon" title={t('viewAll')}><ExternalLink size={18} /></button>
                                            <button className="btn-icon" title={t('delete')} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyJobs;
