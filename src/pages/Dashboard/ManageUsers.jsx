import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
    Search,
    Filter,
    Users,
    MoreVertical,
    CheckCircle,
    XCircle,
    Eye,
    Edit2,
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

    const { data: users = [], isLoading, error } = useUsers();
    const { mutate: updateUserStatus } = useUpdateUserStatus();
    const { mutate: deleteUser } = useDeleteUser();

    const handleSuspend = (id) => {
        const user = users.find(u => u.id === id);
        if (!user) return;
        const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
        updateUserStatus({ id, status: newStatus });
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id, {
                onSuccess: () => {
                    addToast(t('userDeletedSuccess') || 'User deleted successfully', 'success');
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                },
                onError: (err) => {
                    addToast(err.message || 'Failed to delete user', 'error');
                }
            });
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        // For now roles might not be fully implemented as strings in backend, 
        // but the current model has Roles collection. We assume role filter is for UI mock-ish for now or handled via string status/descriptions
        const matchesRole = roleFilter === '' ? true : (user.role === roleFilter); 
        return matchesSearch && matchesRole;
    });

    if (isLoading) return <Spinner />;

    const getStatusStyle = (status) => {
        return status === 'Active'
            ? { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }
            : { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('manageUsers')}</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t('overview')}</p>
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div className="search-field glass" style={{ flex: '1', minWidth: '300px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                        <Search size={20} color="var(--primary)" />
                        <input
                            type="text"
                            placeholder={t('searchUsers')}
                            style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <Filter size={18} color="var(--text-muted)" style={{ margin: '0 0.5rem' }} />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-main)',
                                outline: 'none',
                                cursor: 'pointer',
                                paddingRight: '1rem'
                            }}
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
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('applicantName')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('emailAddress')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('userRole')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('registrationDate')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('status')}</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'center' }}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: '500' }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{user.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: 'var(--text-primary)' }}>{user.role === 'Job Seeker' ? t('jobSeeker') : t('employer')}</span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: getStatusStyle(user.status).bg,
                                            color: getStatusStyle(user.status).color
                                        }}>
                                            {user.status === 'Active' ? t('active') : t('suspended')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button 
                                                className="btn-icon primary" 
                                                title={t('viewProfile')}
                                                onClick={() => navigate(user.role === 'Job Seeker' ? `/resume/${user.id}` : `/profile/${user.id}`)}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button 
                                                className="btn-icon primary" 
                                                title={t('edit')}
                                                onClick={() => navigate(`/profile/${user.id}`)}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                className="btn-icon warning"
                                                title={user.status === 'Active' ? t('suspend') : t('activate')}
                                                onClick={() => handleSuspend(user.id)}
                                                style={{ color: user.status === 'Active' ? '#f59e0b' : '#10b981' }}
                                            >
                                                {user.status === 'Active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                            </button>
                                            <button
                                                className="btn-icon danger"
                                                title={t('delete')}
                                                onClick={() => handleDeleteClick(user)}
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
                        title={t('deleteUserConfirm')}
                        type="danger"
                        lockScroll={false}
                        footer={
                            <>
                                <button className="btn-outline" onClick={() => setIsDeleteModalOpen(false)}>
                                    {t('cancel') || 'Cancel'}
                                </button>
                                <button className="btn-danger" onClick={confirmDelete}>
                                    {t('delete') || 'Delete'}
                                </button>
                            </>
                        }
                    >
                        <p>{t('deleteUserConfirmation')}</p>
                    </Modal>

                    {filteredUsers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <Users size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                            <p>No users found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
