import React, { useState } from 'react';
import {
    Building2, Plus, Pencil, Trash2, Check, X,
    Briefcase, Calendar, Loader2, AlertCircle, FolderOpen, Eye, Search, PlusCircle
} from 'lucide-react';
import { useMyDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '../../hooks/useDepartments';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import './Dashboard.css';

import Modal from '../../components/ui/Modal';

import { formatFriendlyDate } from '../../utils/dateUtils';

// ── Main Page ─────────────────────────────────────────────────────────────────

const Departments = () => {
    const langContext = useLanguage();
    const t = langContext.t;
    const dir = langContext.dir;
    const language = langContext.language;

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
    const [searchTerm,  setSearchTerm]  = useState('');

    const filteredDepartments = React.useMemo(() => {
        return departments.filter(d => 
            d.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [departments, searchTerm]);

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
            <div className="dashboard-header-premium glass">
                <div>
                    <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Building2 size={28} style={{ color: 'var(--primary)' }} />
                        {t('departments')}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div className="dashboard-stats-brief">
                        <div className="stat-brief-item">
                            <span className="stat-brief-value">{departments.length}</span>
                            <span className="stat-brief-label">{t('departments')}</span>
                        </div>
                        <div className="stat-brief-item">
                            <span className="stat-brief-value">{totalJobs}</span>
                            <span className="stat-brief-label">{t('totalJobs')}</span>
                        </div>
                    </div>

                    <Link to="/jobs/post" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                        <PlusCircle size={20} />
                        {t('postNewJob')}
                    </Link>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 350px' }}>
                
                {/* Departments List */}
                <div className="dashboard-section">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '2rem' }}>
                        <h2 className="section-title" style={{ margin: 0, whiteSpace: 'nowrap' }}>
                            <FolderOpen size={20} style={{ color: 'var(--primary)' }} />
                            {t('myDepartments')}
                        </h2>

                        <div className="search-box glass" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: '12px', flex: 1, maxWidth: '400px' }}>
                            <Search size={18} style={{ color: 'var(--text-muted)', margin: dir === 'rtl' ? '0 0 0 0.75rem' : '0 0.75rem 0 0' }} />
                            <input 
                                type="text" 
                                placeholder={t('search')} 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%' }}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                            <Loader2 className="spin" size={32} style={{ color: 'var(--primary)' }} />
                        </div>
                    ) : filteredDepartments.length === 0 ? (
                        <div className="no-results glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
                            <FolderOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                            <p>{t('noDeptsFound')}</p>
                        </div>
                    ) : (
                        <div className="dept-grid">
                            {filteredDepartments.map((dept) => (
                                <div key={dept.id} className="dept-card glass">
                                    <div className="dept-card-content">
                                        {editingId === dept.id ? (
                                            <div className="dept-edit-mode">
                                                <input 
                                                    type="text" 
                                                    value={editingName} 
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    autoFocus
                                                />
                                                <div className="dept-actions">
                                                    <button onClick={handleUpdate} disabled={isUpdating} className="btn-icon success"><Check size={18} /></button>
                                                    <button onClick={cancelEdit} className="btn-icon"><X size={18} /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="dept-info">
                                                    <h3>{dept.name}</h3>
                                                    <div className="dept-meta">
                                                        <span><Briefcase size={14} /> {dept.jobCount || 0} {t('jobs')}</span>
                                                        <span><Calendar size={14} /> {formatFriendlyDate(dept.createdAt, language)}</span>
                                                    </div>
                                                </div>
                                                <div className="dept-actions">
                                                    <button 
                                                        className="btn-icon primary" 
                                                        title={t('viewJobs')}
                                                        onClick={() => navigate(`/jobs?departmentId=${dept.id}`)}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button onClick={() => startEdit(dept)} className="btn-icon" title={t('edit')}><Pencil size={18} /></button>
                                                    <button onClick={() => confirmDelete(dept.id)} className="btn-icon danger" title={t('delete')}><Trash2 size={18} /></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create New Department */}
                <div className="dashboard-section">
                    <h2 className="section-title">
                        <Plus size={20} style={{ color: 'var(--primary)' }} />
                        {t('addDepartment')}
                    </h2>

                    <div className="create-dept-form">
                        <div className="input-group">
                            <label>{t('deptName')}</label>
                            <input 
                                type="text" 
                                placeholder={t('deptNamePlaceholder')} 
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <button 
                            className="btn-primary" 
                            style={{ width: '100%', marginTop: '1rem' }}
                            onClick={handleCreate}
                            disabled={isCreating}
                        >
                            {isCreating ? <Loader2 className="spin" size={20} /> : <><Plus size={18} style={{ margin: dir === 'rtl' ? '0 0 0 0.5rem' : '0 0.5rem 0 0' }} /> {t('create')}</>}
                        </button>
                    </div>

                    <div className="dept-tip glass" style={{ marginTop: '2rem', padding: '1.25rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                            <AlertCircle size={20} />
                            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{t('whyDepts')}</h4>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            {t('whyDeptsDesc')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingId}
                onClose={cancelDelete}
                title={t('confirmDelete')}
                type="danger"
                footer={(
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', width: '100%' }}>
                        <button className="btn-outline" onClick={cancelDelete}>{t('cancel')}</button>
                        <button className="btn-danger" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="spin" size={18} /> : t('delete')}
                        </button>
                    </div>
                )}
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ color: '#ef4444', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <Trash2 size={48} />
                    </div>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{t('deleteDeptConfirm')}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {t('deleteDeptWarning')}
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default Departments;
