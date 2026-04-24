import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications, useUpdateApplicationStatus } from '../../hooks/useApplications';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Users,
    Search,
    Filter,
    Clock,
    MoreVertical,
    Eye,
    CheckCircle,
    XCircle,
    Mail,
    Phone,
    Download
} from 'lucide-react';
import './Dashboard.css';
import { formatFriendlyDate } from '../../utils/dateUtils';

const Applicants = () => {
    const { t, dir, language } = useLanguage();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const { data: applications = [], isLoading, error } = useApplications();
    const { mutate: updateStatus } = useUpdateApplicationStatus();

    const getStatusColor = (status) => {
        switch (status) {
            case 'New':
            case 'Applied': return '#6366f1';
            case 'Reviewing': return '#f59e0b';
            case 'Shortlisted':
            case 'Accepted':
            case 'Hired': return '#10b981';
            case 'Rejected': return '#ef4444';
            default: return '#94a3b8';
        }
    };

    const handleAction = async (action, app) => {
        if (action === 'accept' || action === 'reject' || action === 'review') {
            const newStatus = action === 'accept' ? 'Shortlisted' : (action === 'review' ? 'Reviewing' : 'Rejected');
            updateStatus({ id: app.id, status: newStatus }, {
                onSuccess: () => {
                    let msgKey = '';
                    if (action === 'accept') msgKey = 'candidateAccepted';
                    else if (action === 'review') msgKey = 'candidateReviewing';
                    else msgKey = 'candidateRejected';
                    addToast(t(msgKey) || `Candidate status updated to ${newStatus}`, 'success');
                },
                onError: (err) => {
                    console.error("Action failed:", err);
                    addToast(t('actionFailed') || `Failed to ${action} applicant.`, 'error');
                }
            });
        } else if (action === 'viewResume') {
            navigate(`/resume/${app.userId}`);
        } else if (action === 'viewProfile') {
            navigate(`/candidate/${app.userId}`);
        }
    };

    const filteredApplicants = useMemo(() => {
        return applications.filter(app => {
            const name = app.user?.name || '';
            const role = app.job?.title || '';
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                role.toLowerCase().includes(searchTerm.toLowerCase());
            
            let status = app.candidateStatus || 'New';
            if (status === 'Applied') status = 'New';
            if (status === 'Accepted') status = 'Shortlisted';
            
            const matchesStatus = statusFilter === 'All' || status === statusFilter;
            
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [applications, searchTerm, statusFilter]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">{t('allApplicants')}</h1>
                <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
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
            </div>

            <div className="dashboard-section" style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="section-title" style={{ margin: 0 }}>
                        <Users size={22} className="text-primary" />
                        {t('recentApplicants')}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['All', 'New', 'Reviewing', 'Shortlisted', 'Rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`btn-small ${statusFilter === status ? 'btn-primary' : 'btn-outline-small'}`}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.85rem',
                                    borderRadius: '8px',
                                    border: statusFilter === status ? 'none' : '1px solid var(--border-color)',
                                    background: statusFilter === status ? 'var(--primary)' : 'transparent',
                                    color: statusFilter === status ? 'white' : 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                {status === 'All' ? t('viewAll') : t(status.toLowerCase())}
                            </button>
                        ))}
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('applicantName')}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('appliedFor')}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('status')}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'center' }}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApplicants.map(applicant => (
                            <tr key={applicant.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1.25rem 1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{applicant.user?.name || 'Unknown'}</div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={12} /> {applicant.user?.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1rem' }}>
                                    <div style={{ fontSize: '0.9rem' }}>{applicant.job?.title || 'General'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{formatFriendlyDate(applicant.date, language)}</div>
                                </td>
                                <td style={{ padding: '1.25rem 1rem' }}>
                                    <span style={{
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        backgroundColor: `${getStatusColor(applicant.candidateStatus || 'New')}20`,
                                        color: getStatusColor(applicant.candidateStatus || 'New')
                                    }}>
                                        {t((applicant.candidateStatus || 'New').toLowerCase())}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button className="btn-candidate-action" onClick={() => handleAction('viewResume', applicant)} title={t('viewResume')}>
                                            <Download size={16} />
                                            <span>{t('viewResume') || 'Resume'}</span>
                                        </button>
                                        <button className="btn-candidate-action" onClick={() => handleAction('viewProfile', applicant)} title={t('viewProfile')}>
                                            <Eye size={16} />
                                            <span>{t('viewProfile') || 'Profile'}</span>
                                        </button>
                                        <button className="btn-candidate-action success" onClick={() => handleAction('accept', applicant)} title={t('accept')}>
                                            <CheckCircle size={16} />
                                            <span>{t('accept') || 'Accept'}</span>
                                        </button>
                                        <button className="btn-candidate-action warning" onClick={() => handleAction('review', applicant)} title={t('review')}>
                                            <Clock size={16} />
                                            <span>{t('review') || 'Review'}</span>
                                        </button>
                                        <button className="btn-candidate-action danger" onClick={() => handleAction('reject', applicant)} title={t('reject')}>
                                            <XCircle size={16} />
                                            <span>{t('reject') || 'Reject'}</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Applicants;
