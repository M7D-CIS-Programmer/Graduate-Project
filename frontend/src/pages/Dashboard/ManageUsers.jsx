import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
    Search,
    Filter,
    Users,
    CheckCircle,
    XCircle,
    Eye,
    Trash2
} from 'lucide-react';
import './Dashboard.css';
import { useUsers, useUpdateUserStatus, useDeleteUser } from '../../hooks/useUsers';

const ManageUsers = () => {
    const { t, dir } = useLanguage();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const { data: users = [], isLoading } = useUsers();
    const { mutate: updateUserStatus, isPending: isStatusPending } = useUpdateUserStatus();
    const { mutate: deleteUser, isPending: isDeletePending } = useDeleteUser();

    // ── Navigate to the correct profile based on role ─────────────────────────
    const viewProfile = (user) => {
        const role = (user.role || '').toLowerCase();
        if (role === 'employer' || role === 'company') {
            navigate(`/companies/${user.id}`);
        } else {
            navigate(`/candidate/${user.id}`);
        }
    };

    // ── Suspend / Activate ────────────────────────────────────────────────────
    const handleToggleStatus = (user) => {
        const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
        updateUserStatus({ id: user.id, status: newStatus }, {
            onSuccess: () =>
                addToast(
                    newStatus === 'Suspended'
                        ? (t('userSuspended') || `${user.name} has been suspended`)
                        : (t('userActivated') || `${user.name} has been activated`),
                    newStatus === 'Suspended' ? 'warning' : 'success'
                ),
            onError: (err) =>
                addToast(err.message || t('actionFailed') || 'Action failed', 'error'),
        });
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!userToDelete) return;
        deleteUser(userToDelete.id, {
            onSuccess: () => {
                addToast(t('userDeletedSuccess') || 'User deleted successfully', 'success');
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
            },
            onError: (err) =>
                addToast(err.message || t('actionFailed') || 'Failed to delete user', 'error'),
        });
    };

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.name  || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === '' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (isLoading) return <Spinner />;

    const getStatusStyle = (status) =>
        status === 'Active'
            ? { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }
            : { bg: 'rgba(239, 68, 68, 0.1)',   color: '#ef4444' };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('manageUsers')}</h1>
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
                            placeholder={t('searchUsers')}
                            style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <Filter size={18} color="var(--text-muted)" style={{ margin: '0 0.5rem' }} />
                        <select
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', paddingRight: '1rem' }}
                        >
                            <option value="">{t('allRoles')}</option>
                            <option value="Job Seeker">{t('jobSeeker')}</option>
                            <option value="Employer">{t('employer')}</option>
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('applicantName')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('emailAddress')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('userRole')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('registrationDate')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('status')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'center' }}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                                                {(user.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{user.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span>{user.role === 'Job Seeker' ? t('jobSeeker') : user.role === 'Employer' ? t('employer') : user.role}</span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.35rem 0.75rem', borderRadius: 20,
                                            fontSize: '0.75rem', fontWeight: 600,
                                            backgroundColor: getStatusStyle(user.status).bg,
                                            color: getStatusStyle(user.status).color,
                                        }}>
                                            {user.status === 'Active' ? t('active') : t('suspended')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            {/* View — goes to the correct profile page per role */}
                                            <button
                                                className="btn-icon primary"
                                                title={t('viewProfile')}
                                                onClick={() => viewProfile(user)}
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {/* Suspend / Activate toggle */}
                                            <button
                                                className="btn-icon warning"
                                                title={user.status === 'Active' ? (t('suspend') || 'Suspend') : (t('activate') || 'Activate')}
                                                onClick={() => handleToggleStatus(user)}
                                                disabled={isStatusPending}
                                                style={{ color: user.status === 'Active' ? '#f59e0b' : '#10b981' }}
                                            >
                                                {user.status === 'Active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                            </button>

                                            {/* Delete */}
                                            <button
                                                className="btn-icon danger"
                                                title={t('delete')}
                                                onClick={() => handleDeleteClick(user)}
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

                    {filteredUsers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <Users size={48} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                            <p>{t('noUsersFound') || 'No users found matching your criteria.'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete confirmation modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
                title={t('deleteUserConfirm') || 'Delete User'}
                type="danger"
                footer={
                    <>
                        <button className="btn-outline" onClick={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}>
                            {t('cancel') || 'Cancel'}
                        </button>
                        <button className="btn-danger" onClick={confirmDelete} disabled={isDeletePending}>
                            {isDeletePending ? (t('deleting') || 'Deleting…') : (t('delete') || 'Delete')}
                        </button>
                    </>
                }
            >
                <p style={{ margin: 0 }}>
                    {t('deleteUserConfirmation') || `Are you sure you want to permanently delete ${userToDelete?.name}? This cannot be undone.`}
                </p>
            </Modal>
        </div>
    );
};

export default ManageUsers;
