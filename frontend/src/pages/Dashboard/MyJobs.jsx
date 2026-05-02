import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMyJobs, useDeleteJob } from '../../hooks/useJobs';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import {
    Briefcase,
    Calendar,
    Eye,
    Edit,
    Trash2,
    Users,
    Search,
    ExternalLink,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import './Dashboard.css';
import { formatFriendlyDate } from '../../utils/dateUtils';

const MyJobs = () => {
    const langContext = useLanguage();
    const t = langContext.t;
    const dir = langContext.dir;
    const language = langContext.language;

    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);
    const { data: jobs = [], isLoading } = useMyJobs(user?.id);
    const deleteJobMutation = useDeleteJob();

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeJobsCount = jobs.filter(j => j.status === 'Active').length;

    const getStatusColor = (status) => {
        return status === 'Active' ? '#10b981' : '#f59e0b';
    };

    const handleDeleteClick = (job) => {
        setJobToDelete(job);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!jobToDelete) return;
        try {
            await deleteJobMutation.mutateAsync(jobToDelete.id);
            setIsDeleteModalOpen(false);
            setJobToDelete(null);
        } catch (error) {
            console.error('Failed to delete job', error);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                <Spinner />
            </div>
        );
    }

    return (
        <div className={`dashboard-container ${dir}`} dir={dir}>
            <div className="dashboard-header-premium glass">
                <div className="header-main">
                    <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Briefcase size={28} style={{ color: 'var(--primary)' }} />
                        {t('myJobs')}
                    </h1>
                    
                    <div className="dashboard-nav glass" style={{ marginTop: '1rem' }}>
                        <NavLink to="/dashboard/employer/jobs" className={({ isActive }) => `dash-nav-link ${isActive ? 'active' : ''}`}>
                            {t('myJobs')}
                        </NavLink>
                        <NavLink to="/departments" className={({ isActive }) => `dash-nav-link ${isActive ? 'active' : ''}`}>
                            {t('departments')}
                        </NavLink>
                    </div>
                </div>

                <div className="dashboard-stats-brief">
                    <div className="stat-brief-item">
                        <span className="stat-brief-value">{jobs.length}</span>
                        <span className="stat-brief-label">{t('totalJobs')}</span>
                    </div>
                    <div className="stat-brief-item">
                        <span className="stat-brief-value">{activeJobsCount}</span>
                        <span className="stat-brief-label">{t('activeJobs')}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="section-title" style={{ margin: 0 }}>
                        <Briefcase size={20} style={{ color: 'var(--primary)' }} />
                        {t('manageJobs')}
                    </h2>

                    <div className="search-box glass" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: '12px', minWidth: '300px' }}>
                        <Search size={18} style={{ color: 'var(--text-muted)', marginRight: dir === 'ltr' ? '0.5rem' : '0', marginLeft: dir === 'rtl' ? '0.5rem' : '0' }} />
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%' }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('jobTitle')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('postedDate')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('status')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('totalApplicants')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('views')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'center' }}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ opacity: 0.1, marginBottom: '1rem' }}>
                                            <Briefcase size={48} style={{ margin: '0 auto' }} />
                                        </div>
                                        {t('noJobsFound')}
                                    </td>
                                </tr>
                            ) : (
                                filteredJobs.map(job => (
                                    <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
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
                                                {formatFriendlyDate(job.postedDate, language)}
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
                                                <button className="btn-icon" title={t('edit')} onClick={() => navigate(`/jobs/post?editId=${job.id}`)}><Edit size={18} /></button>
                                                <button className="btn-icon primary" title={t('viewJob')} onClick={() => navigate(`/jobs/${job.id}`)}><ExternalLink size={18} /></button>
                                                <button className="btn-icon danger" title={t('delete')} onClick={() => handleDeleteClick(job)}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={t('confirmDelete')}
                type="danger"
                footer={(
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', width: '100%' }}>
                        <button className="btn-outline" onClick={() => setIsDeleteModalOpen(false)}>
                            {t('cancel')}
                        </button>
                        <button 
                            className="btn-danger"
                            onClick={confirmDelete}
                            disabled={deleteJobMutation.isLoading}
                        >
                            {deleteJobMutation.isLoading ? <Loader2 className="spin" size={18} /> : t('delete')}
                        </button>
                    </div>
                )}
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '50%', 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        color: '#ef4444', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <Trash2 size={32} />
                    </div>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: '600' }}>
                        {t('confirmJobDelete') || t('deleteJobConfirmation')}
                    </p>
                    <p style={{ color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--text-main)' }}>{jobToDelete?.title}</strong>
                        <br />
                        {t('actionCannotBeUndone')}
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default MyJobs;
