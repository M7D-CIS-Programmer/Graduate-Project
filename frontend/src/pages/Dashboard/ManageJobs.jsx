import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
    Search,
    Filter,
    Briefcase,
    Building2,
    CheckCircle,
    XCircle,
    Eye,
    Trash2
} from 'lucide-react';
import './Dashboard.css';
import { useJobs, useUpdateJobStatus, useDeleteJob } from '../../hooks/useJobs';
import { formatFriendlyDate } from '../../utils/dateUtils';

const ManageJobs = () => {
    const { t, dir, language } = useLanguage();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);

    const { data: rawData = [], isLoading, error } = useJobs();
    const jobs = Array.isArray(rawData) ? rawData : (rawData?.$values || []);

    const { mutate: updateJobStatus, isPending: isStatusPending } = useUpdateJobStatus();
    const { mutate: deleteJob, isPending: isDeletePending } = useDeleteJob();

    const handleApprove = (job) => {
        updateJobStatus({ id: job.id, status: 'Active' }, {
            onSuccess: () =>
                addToast(t('jobApproved') || `"${job.title}" has been approved`, 'success'),
            onError: (err) =>
                addToast(err.message || t('actionFailed') || 'Action failed', 'error'),
        });
    };

    const handleSuspend = (job) => {
        const newStatus = job.status === 'Suspended' ? 'Active' : 'Suspended';
        updateJobStatus({ id: job.id, status: newStatus }, {
            onSuccess: () =>
                addToast(
                    newStatus === 'Suspended'
                        ? (t('jobSuspended') || `"${job.title}" has been suspended`)
                        : (t('jobActivated') || `"${job.title}" has been activated`),
                    newStatus === 'Suspended' ? 'warning' : 'success'
                ),
            onError: (err) =>
                addToast(err.message || t('actionFailed') || 'Action failed', 'error'),
        });
    };

    const handleDeleteClick = (job) => {
        setJobToDelete(job);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (jobToDelete) {
            deleteJob(jobToDelete.id, {
                onSuccess: () => {
                    addToast(t('jobDeletedSuccess') || 'Job deleted successfully', 'success');
                    setIsDeleteModalOpen(false);
                    setJobToDelete(null);
                },
                onError: (err) => {
                    addToast(err.message || 'Failed to delete job', 'error');
                }
            });
        }
    };

    const filteredJobs = jobs.filter(job => {
        const jobTitle = job.title || '';
        const companyName = job.user?.name || '';
        const matchesSearch = jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            companyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' ? true : job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) return <Spinner />;

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>
                    <XCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
                    <h2 style={{ marginBottom: '0.5rem' }}>{t('errorLoadingJobs') || 'Error Loading Jobs'}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error.message || 'Something went wrong while fetching jobs.'}</p>
                    <button className="btn-primary" onClick={() => window.location.reload()}>
                        {t('retry') || 'Retry'}
                    </button>
                </div>
            </div>
        );
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
            case 'Pending Approval': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
            case 'Suspended': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
            default: return { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' };
        }
    };

    const getStatusTranslation = (status) => {
        switch (status) {
            case 'Active': return t('active');
            case 'Pending Approval': return t('pendingApproval');
            case 'Suspended': return t('suspended');
            case 'Closed': return t('closed');
            default: return status;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('manageJobs')}</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t('overview')}</p>
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div className="search-field glass" style={{ flex: '1', minWidth: '300px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                        <Search size={20} color="var(--primary)" />
                        <input
                            type="text"
                            placeholder={t('searchJobs') || 'Search jobs by title or company...'}
                            style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <Filter size={18} color="var(--text-muted)" style={{ margin: '0 0.5rem' }} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-main)',
                                outline: 'none',
                                cursor: 'pointer',
                                paddingRight: '1rem'
                            }}
                        >
                            <option value="">{t('allStatuses')}</option>
                            <option value="Active">{t('active')}</option>
                            <option value="Pending Approval">{t('pendingApproval')}</option>
                            <option value="Closed">{t('closed')}</option>
                            <option value="Suspended">{t('suspended')}</option>
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('jobTitle')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('company')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('postedDate')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'center' }}>{t('totalApplicants')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('status')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'center' }}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.map(job => (
                                <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}>
                                                <Briefcase size={18} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '500', margin: 0 }}>{job.title}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{t('postedBy')}: {job.user?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Building2 size={16} color="var(--text-muted)" />
                                            <span style={{ color: 'var(--text-primary)' }}>{job.company}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{formatFriendlyDate(job.postedDate, language)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            background: 'var(--bg-dark)',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '100px',
                                            fontSize: '0.8rem',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            {job.applicantsCount}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: getStatusStyle(job.status).bg,
                                            color: getStatusStyle(job.status).color,
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {getStatusTranslation(job.status)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button 
                                                className="btn-icon primary" 
                                                title={t('viewDetails')}
                                                onClick={() => navigate(`/jobs/${job.id}`)}
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {job.status === 'Pending Approval' && (
                                                <button
                                                    className="btn-icon success"
                                                    title={t('approve') || 'Approve'}
                                                    onClick={() => handleApprove(job)}
                                                    disabled={isStatusPending}
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}

                                            {job.status !== 'Pending Approval' && (
                                                <button
                                                    className="btn-icon warning"
                                                    title={job.status === 'Suspended' ? (t('activate') || 'Activate') : (t('suspend') || 'Suspend')}
                                                    onClick={() => handleSuspend(job)}
                                                    disabled={isStatusPending}
                                                    style={{ color: job.status === 'Suspended' ? '#10b981' : '#f59e0b' }}
                                                >
                                                    {job.status === 'Suspended' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                                </button>
                                            )}

                                            <button
                                                className="btn-icon danger"
                                                title={t('delete')}
                                                onClick={() => handleDeleteClick(job)}
                                                disabled={isDeletePending}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <Modal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        title={t('deleteJobConfirm')}
                        type="danger"
                        lockScroll={false}
                        footer={
                            <>
                                <button className="btn-outline" onClick={() => setIsDeleteModalOpen(false)}>
                                    {t('cancel') || 'Cancel'}
                                </button>
                                <button className="btn-danger" onClick={confirmDelete} disabled={isDeletePending}>
                                    {isDeletePending ? (t('deleting') || 'Deleting…') : (t('delete') || 'Delete')}
                                </button>
                            </>
                        }
                    >
                        <p>{t('deleteJobConfirmation')}</p>
                    </Modal>

                    {filteredJobs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <Briefcase size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                            <p>No jobs found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageJobs;
