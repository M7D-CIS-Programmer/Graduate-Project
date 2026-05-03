import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
    Search,
    Filter,
    Building2,
    CheckCircle,
    XCircle,
    Eye,
    Trash2,
    MapPin
} from 'lucide-react';
import './Dashboard.css';
import { useUsers, useUpdateUserStatus, useDeleteUser } from '../../hooks/useUsers';

const ManageCompanies = () => {
    const { t, dir } = useLanguage();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState(null);

    const { data: rawData = [], isLoading, error } = useUsers();
    const allUsers = Array.isArray(rawData) ? rawData : (rawData?.$values || []);

    const { mutate: updateUserStatus, isPending: isStatusPending } = useUpdateUserStatus();
    const { mutate: deleteUser, isPending: isDeletePending } = useDeleteUser();

    // Only employers/companies
    const companies = allUsers.filter(u => {
        const role = (u.role || '').toLowerCase();
        return role === 'employer' || role === 'company';
    });

    // ── Suspend / Activate ────────────────────────────────────────────────────
    const handleToggleStatus = (company) => {
        const newStatus = company.status === 'Active' ? 'Suspended' : 'Active';
        updateUserStatus({ id: company.id, status: newStatus }, {
            onSuccess: () =>
                addToast(
                    newStatus === 'Suspended'
                        ? (t('companySuspended') || `${company.name} has been suspended`)
                        : (t('companyActivated') || `${company.name} has been activated`),
                    newStatus === 'Suspended' ? 'warning' : 'success'
                ),
            onError: (err) =>
                addToast(err.message || t('actionFailed') || 'Action failed', 'error'),
        });
    };

    // ── Approve (Pending → Active) ────────────────────────────────────────────
    const handleApprove = (company) => {
        updateUserStatus({ id: company.id, status: 'Active' }, {
            onSuccess: () =>
                addToast(t('companyApproved') || `${company.name} has been approved`, 'success'),
            onError: (err) =>
                addToast(err.message || t('actionFailed') || 'Action failed', 'error'),
        });
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteClick = (company) => {
        setCompanyToDelete(company);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!companyToDelete) return;
        deleteUser(companyToDelete.id, {
            onSuccess: () => {
                addToast(t('companyDeletedSuccess') || 'Company deleted successfully', 'success');
                setIsDeleteModalOpen(false);
                setCompanyToDelete(null);
            },
            onError: (err) =>
                addToast(err.message || t('actionFailed') || 'Failed to delete company', 'error'),
        });
    };

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredCompanies = companies.filter(company => {
        const matchesSearch = (company.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || company.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) return <Spinner />;

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.25rem' }}>
                        {t('errorLoadingData') || 'Error loading companies'}
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error.message}</p>
                    <button className="btn-primary" onClick={() => window.location.reload()}>{t('retry') || 'Retry'}</button>
                </div>
            </div>
        );
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active':           return { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' };
            case 'Pending Approval': return { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' };
            case 'Suspended':        return { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' };
            default:                 return { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' };
        }
    };

    const getStatusTranslation = (status) => {
        switch (status) {
            case 'Active':           return t('active');
            case 'Pending Approval': return t('pendingApproval');
            case 'Suspended':        return t('suspended');
            default:                 return status;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('manageCompanies')}</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t('overview')}</p>
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                {/* Search + Filter */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div className="search-field glass" style={{ flex: 1, minWidth: 300, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: 12 }}>
                        <Search size={20} color="var(--primary)" />
                        <input
                            type="text"
                            placeholder={t('searchCompanies') || 'Search companies by name…'}
                            style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <Filter size={18} color="var(--text-muted)" style={{ margin: '0 0.5rem' }} />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', paddingRight: '1rem' }}
                        >
                            <option value="">{t('allStatuses')}</option>
                            <option value="Active">{t('active')}</option>
                            <option value="Pending Approval">{t('pendingApproval')}</option>
                            <option value="Suspended">{t('suspended')}</option>
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('company')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('industry')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('joinDate')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'center' }}>{t('activeJobs')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('status')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'center' }}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.map(company => (
                                <tr key={company.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Building2 size={20} color="var(--primary)" />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, margin: 0 }}>{company.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <MapPin size={12} /> {company.location || '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{company.industry || '—'}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(company.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ background: 'rgba(15,23,42,0.5)', padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: '0.8rem', border: '1px solid var(--border-color)', color: company.activeJobsCount > 0 ? '#10b981' : 'var(--text-muted)' }}>
                                            {company.activeJobsCount ?? 0}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.35rem 0.75rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, backgroundColor: getStatusStyle(company.status).bg, color: getStatusStyle(company.status).color, whiteSpace: 'nowrap' }}>
                                            {getStatusTranslation(company.status)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            {/* View — navigates to company public profile */}
                                            <button
                                                className="btn-icon primary"
                                                title={t('viewProfile')}
                                                onClick={() => navigate(`/companies/${company.id}`)}
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {/* Approve (only when pending) */}
                                            {company.status === 'Pending Approval' && (
                                                <button
                                                    className="btn-icon success"
                                                    title={t('approve') || 'Approve'}
                                                    onClick={() => handleApprove(company)}
                                                    disabled={isStatusPending}
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}

                                            {/* Suspend / Activate toggle (when not pending) */}
                                            {company.status !== 'Pending Approval' && (
                                                <button
                                                    className="btn-icon warning"
                                                    title={company.status === 'Suspended' ? (t('activate') || 'Activate') : (t('suspend') || 'Suspend')}
                                                    onClick={() => handleToggleStatus(company)}
                                                    disabled={isStatusPending}
                                                    style={{ color: company.status === 'Suspended' ? '#10b981' : '#f59e0b' }}
                                                >
                                                    {company.status === 'Suspended' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                                </button>
                                            )}

                                            {/* Delete */}
                                            <button
                                                className="btn-icon danger"
                                                title={t('delete')}
                                                onClick={() => handleDeleteClick(company)}
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

                    {filteredCompanies.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <Building2 size={48} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                            <p>{t('noCompaniesFound') || 'No companies found matching your criteria.'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete confirmation modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setCompanyToDelete(null); }}
                title={t('deleteCompanyConfirm') || 'Delete Company'}
                type="danger"
                footer={
                    <>
                        <button className="btn-outline" onClick={() => { setIsDeleteModalOpen(false); setCompanyToDelete(null); }}>
                            {t('cancel') || 'Cancel'}
                        </button>
                        <button className="btn-danger" onClick={confirmDelete} disabled={isDeletePending}>
                            {isDeletePending ? (t('deleting') || 'Deleting…') : (t('delete') || 'Delete')}
                        </button>
                    </>
                }
            >
                <p style={{ margin: 0 }}>
                    {t('deleteCompanyConfirmation') || `Are you sure you want to permanently delete ${companyToDelete?.name}? This cannot be undone.`}
                </p>
            </Modal>
        </div>
    );
};

export default ManageCompanies;
