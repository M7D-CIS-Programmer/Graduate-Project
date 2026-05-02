import React, { useState } from 'react';
import {
    Building2, Plus, Pencil, Trash2, Check, X,
    Briefcase, Calendar, Loader2, AlertCircle, FolderOpen, Eye
} from 'lucide-react';
import { useMyDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '../../hooks/useDepartments';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import './Dashboard.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso, lang) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch {
        return '—';
    }
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const Departments = () => {
    const { t, dir, language }   = useLanguage();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const { data: departments = [], isLoading, isError } = useMyDepartments();
    const { mutate: create, isPending: isCreating } = useCreateDepartment();
    const { mutate: update, isPending: isUpdating } = useUpdateDepartment();
    const { mutate: remove, isPending: isDeleting } = useDeleteDepartment();

    const [newName,     setNewName]     = useState('');
    const [editingId,   setEditingId]   = useState(null);
    const [editingName, setEditingName] = useState('');
    const [deletingId,  setDeletingId]  = useState(null);

    // ── Create ────────────────────────────────────────────────────────────────

    const handleCreate = () => {
        const name = newName.trim();
        if (!name) { addToast(t('deptEmpty'), 'error'); return; }

        create(name, {
            onSuccess: () => { setNewName(''); addToast(t('deptCreated'), 'success'); },
            onError:   (err) => addToast(err.message || t('deptCreateFailed'), 'error'),
        });
    };

    // ── Edit ──────────────────────────────────────────────────────────────────

    const startEdit = (dept) => {
        setEditingId(dept.id);
        setEditingName(dept.name);
    };

    const cancelEdit = () => { setEditingId(null); setEditingName(''); };

    const handleUpdate = () => {
        const name = editingName.trim();
        if (!name) { addToast(t('deptEmpty'), 'error'); return; }

        update({ id: editingId, name }, {
            onSuccess: () => { cancelEdit(); addToast(t('deptUpdated'), 'success'); },
            onError:   (err) => addToast(err.message || t('deptUpdateFailed'), 'error'),
        });
    };

    // ── Delete ────────────────────────────────────────────────────────────────

    const confirmDelete = (id) => setDeletingId(id);
    const cancelDelete  = ()  => setDeletingId(null);

    const handleDelete = () => {
        remove(deletingId, {
            onSuccess: () => { setDeletingId(null); addToast(t('deptDeleted'), 'success'); },
            onError:   (err) => { setDeletingId(null); addToast(err.message || t('deptDeleteFailed'), 'error'); },
        });
    };

    // ── Stats ─────────────────────────────────────────────────────────────────

    const totalJobs = departments.reduce((sum, d) => sum + (d.jobCount || 0), 0);

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className={`dashboard-container ${dir}`} dir={dir}>

            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Building2 size={28} style={{ color: 'var(--primary)' }} />
                        {t('myDepartments')}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {t('departmentsDesc')}
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="dashboard-stats">
                <div className="stat-card glass">
                    <div className="stat-icon" style={{ background: 'rgba(99,102,241,.15)', color: 'var(--primary)' }}>
                        <Building2 size={24} />
                    </div>
                    <div className="stat-details">
                        <h3>{departments.length}</h3>
                        <p>{t('departments')}</p>
                    </div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,.15)', color: '#10b981' }}>
                        <Briefcase size={24} />
                    </div>
                    <div className="stat-details">
                        <h3>{totalJobs}</h3>
                        <p>{t('jobsAssigned')}</p>
                    </div>
                </div>
            </div>

            {/* Add Department Card */}
            <div className="dashboard-section" style={{ border: '1px solid rgba(99,102,241,.2)', background: 'linear-gradient(135deg, rgba(99,102,241,.05), var(--bg-card))' }}>
                <h2 className="section-title">
                    <Plus size={20} style={{ color: 'var(--primary)' }} />
                    {t('addNewDept')}
                </h2>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder={t('deptPlaceholder')}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        disabled={isCreating}
                        maxLength={80}
                        style={{
                            flex: 1,
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            padding: '0.65rem 1rem',
                            borderRadius: 10,
                            fontSize: '0.9rem',
                            outline: 'none',
                            opacity: isCreating ? 0.7 : 1,
                        }}
                    />
                    <button
                        onClick={handleCreate}
                        disabled={isCreating || !newName.trim()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.45rem',
                            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                            color: 'white', border: 'none',
                            padding: '0.65rem 1.4rem', borderRadius: 10,
                            fontSize: '0.875rem', fontWeight: 600,
                            cursor: isCreating || !newName.trim() ? 'not-allowed' : 'pointer',
                            opacity: isCreating || !newName.trim() ? 0.6 : 1,
                            boxShadow: '0 4px 14px rgba(99,102,241,.35)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {isCreating
                            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('creating')}</>
                            : <><Plus size={16} /> {t('addDept')}</>
                        }
                    </button>
                </div>
            </div>

            {/* Departments List */}
            <div className="dashboard-section">
                <h2 className="section-title">
                    <FolderOpen size={20} style={{ color: 'var(--primary)' }} />
                    {t('yourDepts')}
                    <span style={{ 
                        marginLeft: dir === 'ltr' ? '0.5rem' : '0',
                        marginRight: dir === 'rtl' ? '0.5rem' : '0',
                        fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)', background: 'rgba(99,102,241,.1)', padding: '0.15rem 0.55rem', borderRadius: 6 
                    }}>
                        {departments.length}
                    </span>
                </h2>

                {/* Loading */}
                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                )}

                {/* Error */}
                {isError && !isLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ef4444', padding: '1.5rem', background: 'rgba(239,68,68,.07)', borderRadius: 12 }}>
                        <AlertCircle size={18} />
                        {t('failedLoadDepts')}
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !isError && departments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                        <Building2 size={52} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.4rem' }}>{t('noDeptsYet')}</p>
                        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>{t('noDeptsDesc')}</p>
                    </div>
                )}

                {/* List */}
                {!isLoading && !isError && departments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {departments.map((dept) => (
                            <div
                                key={dept.id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '1rem 1.25rem',
                                    background: 'rgba(255,255,255,.03)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 14,
                                    transition: 'border-color .2s, background .2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.03)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                            >
                                {/* Icon */}
                                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99,102,241,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Building2 size={20} style={{ color: 'var(--primary)' }} />
                                </div>

                                {/* Name — edit mode or display */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {editingId === dept.id ? (
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') cancelEdit(); }}
                                            autoFocus
                                            maxLength={80}
                                            style={{
                                                width: '100%', background: 'var(--bg-card)',
                                                border: '1px solid var(--primary)', color: 'var(--text-main)',
                                                padding: '0.4rem 0.75rem', borderRadius: 8,
                                                fontSize: '0.9rem', outline: 'none',
                                            }}
                                        />
                                    ) : (
                                        <div>
                                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{dept.name}</span>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <Briefcase size={11} /> {dept.jobCount} {dept.jobCount === 1 ? t('job') : t('jobsCount')}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <Calendar size={11} /> {formatDate(dept.createdAt, language)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                    {editingId === dept.id ? (
                                        <>
                                            <button
                                                onClick={handleUpdate}
                                                disabled={isUpdating}
                                                title={t('save')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.35)', color: '#10b981', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                {isUpdating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                                                {t('save')}
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                title={t('cancel')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                <X size={14} /> {t('cancel')}
                                            </button>
                                        </>
                                    ) : deletingId === dept.id ? (
                                        <>
                                            <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500, 
                                                marginLeft: dir === 'ltr' ? '0' : '0.25rem',
                                                marginRight: dir === 'rtl' ? '0' : '0.25rem',
                                                alignSelf: 'center' 
                                            }}>{t('deleteQuestion')}</span>
                                            <button
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                title={t('yes')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.35)', color: '#ef4444', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                {isDeleting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                                                {t('yes')}
                                            </button>
                                            <button
                                                onClick={cancelDelete}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                <X size={14} /> {t('no')}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEdit(dept)}
                                                title={t('edit')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.25)', color: 'var(--primary)', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                <Pencil size={14} /> {t('edit')}
                                            </button>
                                            <button
                                                onClick={() => navigate(`/jobs?departmentId=${dept.id}`)}
                                                title={t('viewJobs')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', color: '#10b981', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                <Eye size={14} /> {t('viewJobs')}
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(dept.id)}
                                                title={t('delete')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                <Trash2 size={14} /> {t('delete')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Departments;
