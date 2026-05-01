import React, { useState } from 'react';
import {
    Building2, Plus, Pencil, Trash2, Check, X,
    Briefcase, Calendar, Loader2, AlertCircle, FolderOpen
} from 'lucide-react';
import { useMyCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import './Dashboard.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return '—';
    }
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const Departments = () => {
    const { t, dir }   = useLanguage();
    const { addToast } = useToast();

    const { data: departments = [], isLoading, isError } = useMyCategories();
    const { mutate: create, isPending: isCreating } = useCreateCategory();
    const { mutate: update, isPending: isUpdating } = useUpdateCategory();
    const { mutate: remove, isPending: isDeleting } = useDeleteCategory();

    const [newName,     setNewName]     = useState('');
    const [editingId,   setEditingId]   = useState(null);
    const [editingName, setEditingName] = useState('');
    const [deletingId,  setDeletingId]  = useState(null);

    // ── Create ────────────────────────────────────────────────────────────────

    const handleCreate = () => {
        const name = newName.trim();
        if (!name) { addToast('Department name cannot be empty.', 'error'); return; }

        create(name, {
            onSuccess: () => { setNewName(''); addToast('Department created successfully.', 'success'); },
            onError:   (err) => addToast(err.message || 'Failed to create department.', 'error'),
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
        if (!name) { addToast('Department name cannot be empty.', 'error'); return; }

        update({ id: editingId, name }, {
            onSuccess: () => { cancelEdit(); addToast('Department updated.', 'success'); },
            onError:   (err) => addToast(err.message || 'Failed to update department.', 'error'),
        });
    };

    // ── Delete ────────────────────────────────────────────────────────────────

    const confirmDelete = (id) => setDeletingId(id);
    const cancelDelete  = ()  => setDeletingId(null);

    const handleDelete = () => {
        remove(deletingId, {
            onSuccess: () => { setDeletingId(null); addToast('Department deleted.', 'success'); },
            onError:   (err) => { setDeletingId(null); addToast(err.message || 'Failed to delete department.', 'error'); },
        });
    };

    // ── Stats ─────────────────────────────────────────────────────────────────

    const totalJobs = departments.reduce((sum, d) => sum + (d.jobCount || 0), 0);

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="dashboard-container" dir={dir}>

            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Building2 size={28} style={{ color: 'var(--primary)' }} />
                        My Departments
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Manage your company's private departments used for job categorization.
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
                        <p>Departments</p>
                    </div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,.15)', color: '#10b981' }}>
                        <Briefcase size={24} />
                    </div>
                    <div className="stat-details">
                        <h3>{totalJobs}</h3>
                        <p>Jobs Assigned</p>
                    </div>
                </div>
            </div>

            {/* Add Department Card */}
            <div className="dashboard-section" style={{ border: '1px solid rgba(99,102,241,.2)', background: 'linear-gradient(135deg, rgba(99,102,241,.05), var(--bg-card))' }}>
                <h2 className="section-title">
                    <Plus size={20} style={{ color: 'var(--primary)' }} />
                    Add New Department
                </h2>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="e.g. Engineering, Sales, Operations…"
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
                            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</>
                            : <><Plus size={16} /> Add Department</>
                        }
                    </button>
                </div>
            </div>

            {/* Departments List */}
            <div className="dashboard-section">
                <h2 className="section-title">
                    <FolderOpen size={20} style={{ color: 'var(--primary)' }} />
                    Your Departments
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)', background: 'rgba(99,102,241,.1)', padding: '0.15rem 0.55rem', borderRadius: 6 }}>
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
                        Failed to load departments. Please refresh the page.
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !isError && departments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                        <Building2 size={52} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.4rem' }}>No departments yet</p>
                        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Use the form above to create your first department.</p>
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
                                                    <Briefcase size={11} /> {dept.jobCount} job{dept.jobCount !== 1 ? 's' : ''}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <Calendar size={11} /> {formatDate(dept.createdAt)}
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
                                                title="Save"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.35)', color: '#10b981', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                {isUpdating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                title="Cancel"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                <X size={14} /> Cancel
                                            </button>
                                        </>
                                    ) : deletingId === dept.id ? (
                                        <>
                                            <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500, marginRight: '0.25rem', alignSelf: 'center' }}>Delete?</span>
                                            <button
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                title="Confirm delete"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.35)', color: '#ef4444', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                {isDeleting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                                                Yes
                                            </button>
                                            <button
                                                onClick={cancelDelete}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                <X size={14} /> No
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEdit(dept)}
                                                title="Edit department"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.25)', color: 'var(--primary)', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(dept.id)}
                                                title="Delete department"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                <Trash2 size={14} /> Delete
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
