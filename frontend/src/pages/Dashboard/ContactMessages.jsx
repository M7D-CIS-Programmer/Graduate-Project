import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/api';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import {
    Search, Filter, Mail, Eye, Trash2,
    ChevronLeft, ChevronRight, MessageSquare,
    Clock, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { formatFriendlyDate } from '../../utils/dateUtils';
import './Dashboard.css';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUSES = ['New', 'InProgress', 'Resolved', 'Closed'];
const PAGE_SIZE = 15;

const STATUS_STYLE = {
    New:        { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1' },
    InProgress: { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
    Resolved:   { bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
    Closed:     { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
};

const STATUS_ICON = {
    New:        <Mail size={13} />,
    InProgress: <Clock size={13} />,
    Resolved:   <CheckCircle size={13} />,
    Closed:     <XCircle size={13} />,
};

// ── Detail modal ──────────────────────────────────────────────────────────────

const DetailModal = ({ msg, onClose, onStatusChange, isUpdating, lang }) => {
    const ar = lang === 'ar';
    if (!msg) return null;

    const style = STATUS_STYLE[msg.status] || STATUS_STYLE.New;

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={ar ? 'تفاصيل الرسالة' : 'Message Details'}
            footer={
                <button className="btn-outline" onClick={onClose}>
                    {ar ? 'إغلاق' : 'Close'}
                </button>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Sender info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            {ar ? 'الاسم' : 'Name'}
                        </p>
                        <p style={{ fontWeight: 600 }}>{msg.fullName}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            {ar ? 'البريد الإلكتروني' : 'Email'}
                        </p>
                        <a href={`mailto:${msg.email}`} style={{ color: '#6366f1', fontSize: '0.9rem' }}>{msg.email}</a>
                    </div>
                    {msg.phone && (
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                {ar ? 'الهاتف' : 'Phone'}
                            </p>
                            <p>{msg.phone}</p>
                        </div>
                    )}
                    {msg.userRole && (
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                {ar ? 'الدور' : 'Role'}
                            </p>
                            <p>{msg.userRole}</p>
                        </div>
                    )}
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            {ar ? 'التاريخ' : 'Received'}
                        </p>
                        <p>{formatFriendlyDate(msg.createdAt)}</p>
                    </div>
                </div>

                {/* Subject */}
                <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        {ar ? 'الموضوع' : 'Subject'}
                    </p>
                    <p style={{ fontWeight: 600, fontSize: '1rem' }}>{msg.subject}</p>
                </div>

                {/* Message body */}
                <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {ar ? 'الرسالة' : 'Message'}
                    </p>
                    <div style={{
                        background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                        borderRadius: 12, padding: '1rem', fontSize: '0.9rem',
                        lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 240, overflowY: 'auto'
                    }}>
                        {msg.message}
                    </div>
                </div>

                {/* Status changer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>
                        {ar ? 'تغيير الحالة:' : 'Change status:'}
                    </p>
                    {STATUSES.map(s => {
                        const st = STATUS_STYLE[s];
                        const isActive = msg.status === s;
                        return (
                            <button
                                key={s}
                                onClick={() => !isActive && onStatusChange(msg.id, s)}
                                disabled={isActive || isUpdating}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                    padding: '0.35rem 0.85rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                                    border: isActive ? `2px solid ${st.color}` : '1px solid var(--border-color)',
                                    background: isActive ? st.bg : 'transparent',
                                    color: isActive ? st.color : 'var(--text-muted)',
                                    cursor: isActive ? 'default' : 'pointer',
                                    opacity: isUpdating && !isActive ? 0.5 : 1,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {STATUS_ICON[s]}
                                {s === 'InProgress' ? (ar ? 'قيد المعالجة' : 'In Progress') :
                                 s === 'New'        ? (ar ? 'جديد'        : 'New')         :
                                 s === 'Resolved'   ? (ar ? 'محلول'       : 'Resolved')    :
                                                     (ar ? 'مغلق'        : 'Closed')}
                            </button>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const ContactMessages = () => {
    const { t, dir, language } = useLanguage();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const lang = language || 'en';
    const ar = lang === 'ar';

    const [searchQ,       setSearchQ]       = useState('');
    const [statusFilter,  setStatusFilter]  = useState('');
    const [page,          setPage]          = useState(1);
    const [detailMsg,     setDetailMsg]     = useState(null);
    const [deleteTarget,  setDeleteTarget]  = useState(null);

    // ── Data fetching ─────────────────────────────────────────────────────────

    const queryKey = ['contact-messages', searchQ, statusFilter, page];

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey,
        queryFn: () => api.getContactMessages({ q: searchQ || undefined, status: statusFilter || undefined, page, pageSize: PAGE_SIZE }),
        staleTime: 30_000,
    });

    const items    = data?.items    ?? [];
    const total    = data?.total    ?? 0;
    const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

    // ── Mutations ─────────────────────────────────────────────────────────────

    const { mutate: updateStatus, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, status }) => api.updateContactMessageStatus(id, status),
        onSuccess: (_, { id, status }) => {
            // Update the cached detail too
            setDetailMsg(d => d?.id === id ? { ...d, status } : d);
            queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
            addToast(ar ? 'تم تحديث الحالة' : 'Status updated', 'success');
        },
        onError: () => addToast(ar ? 'فشل تحديث الحالة' : 'Failed to update status', 'error'),
    });

    const { mutate: deleteMsg, isPending: isDeleting } = useMutation({
        mutationFn: (id) => api.deleteContactMessage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
            setDeleteTarget(null);
            if (detailMsg?.id === deleteTarget) setDetailMsg(null);
            addToast(ar ? 'تم حذف الرسالة' : 'Message deleted', 'success');
        },
        onError: () => addToast(ar ? 'فشل الحذف' : 'Failed to delete', 'error'),
    });

    // ── Helpers ───────────────────────────────────────────────────────────────

    const handleSearch = (e) => { setSearchQ(e.target.value); setPage(1); };
    const handleFilter = (e) => { setStatusFilter(e.target.value); setPage(1); };

    const statusLabel = (s) => {
        if (s === 'InProgress') return ar ? 'قيد المعالجة' : 'In Progress';
        if (s === 'New')        return ar ? 'جديد'         : 'New';
        if (s === 'Resolved')   return ar ? 'محلول'        : 'Resolved';
        if (s === 'Closed')     return ar ? 'مغلق'         : 'Closed';
        return s;
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="dashboard-container" dir={dir}>
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <MessageSquare size={26} style={{ color: 'var(--primary)' }} />
                        {ar ? 'رسائل التواصل' : 'Contact Messages'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {total > 0
                            ? (ar ? `${total} رسالة إجمالاً` : `${total} message${total !== 1 ? 's' : ''} total`)
                            : (ar ? 'لا توجد رسائل' : 'No messages yet')}
                    </p>
                </div>
                <button
                    className="btn-icon"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    title={ar ? 'تحديث' : 'Refresh'}
                    style={{ width: 40, height: 40 }}
                >
                    <RefreshCw size={18} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
                </button>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
                {/* Search + Filter bar */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div className="search-field glass" style={{ flex: 1, minWidth: 280, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: 12 }}>
                        <Search size={18} color="var(--primary)" />
                        <input
                            type="text"
                            placeholder={ar ? 'ابحث بالاسم أو البريد أو الموضوع…' : 'Search by name, email or subject…'}
                            value={searchQ}
                            onChange={handleSearch}
                            style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <Filter size={16} color="var(--text-muted)" style={{ margin: '0 0.25rem' }} />
                        <select
                            value={statusFilter}
                            onChange={handleFilter}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', paddingInlineEnd: '0.75rem' }}
                        >
                            <option value="">{ar ? 'جميع الحالات' : 'All statuses'}</option>
                            {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <Spinner />
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <MessageSquare size={48} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                        <p>{ar ? 'لا توجد رسائل تطابق بحثك' : 'No messages match your search'}</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    {[
                                        ar ? 'المرسل'   : 'Sender',
                                        ar ? 'الموضوع' : 'Subject',
                                        ar ? 'الدور'   : 'Role',
                                        ar ? 'التاريخ' : 'Date',
                                        ar ? 'الحالة'  : 'Status',
                                        ar ? 'الإجراء' : 'Actions',
                                    ].map(h => (
                                        <th key={h} style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(msg => {
                                    const st = STATUS_STYLE[msg.status] || STATUS_STYLE.New;
                                    return (
                                        <tr
                                            key={msg.id}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.12s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{msg.fullName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{msg.email}</div>
                                            </td>
                                            <td style={{ padding: '1rem', maxWidth: 240 }}>
                                                <p style={{ margin: 0, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {msg.subject}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {msg.message.length > 60 ? msg.message.slice(0, 60) + '…' : msg.message}
                                                </p>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {msg.userRole
                                                    ? <span style={{ fontSize: '0.78rem', background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '0.2rem 0.6rem', borderRadius: 6 }}>{msg.userRole}</span>
                                                    : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                                {formatFriendlyDate(msg.createdAt, language)}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: st.bg, color: st.color, whiteSpace: 'nowrap' }}>
                                                    {STATUS_ICON[msg.status]}
                                                    {statusLabel(msg.status)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                    <button
                                                        className="btn-icon primary"
                                                        title={ar ? 'عرض التفاصيل' : 'View details'}
                                                        onClick={() => setDetailMsg(msg)}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="btn-icon danger"
                                                        title={ar ? 'حذف' : 'Delete'}
                                                        onClick={() => setDeleteTarget(msg)}
                                                        disabled={isDeleting}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {lastPage > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button
                            className="btn-icon"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            style={{ width: 36, height: 36 }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            {ar ? `صفحة ${page} من ${lastPage}` : `Page ${page} of ${lastPage}`}
                        </span>
                        <button
                            className="btn-icon"
                            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                            disabled={page >= lastPage}
                            style={{ width: 36, height: 36 }}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {detailMsg && (
                <DetailModal
                    msg={detailMsg}
                    onClose={() => setDetailMsg(null)}
                    onStatusChange={(id, status) => updateStatus({ id, status })}
                    isUpdating={isUpdating}
                    lang={lang}
                />
            )}

            {/* Delete confirmation modal */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title={ar ? 'حذف الرسالة' : 'Delete Message'}
                type="danger"
                footer={
                    <>
                        <button className="btn-outline" onClick={() => setDeleteTarget(null)}>
                            {ar ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button className="btn-danger" onClick={() => deleteMsg(deleteTarget.id)} disabled={isDeleting}>
                            {isDeleting ? (ar ? 'جارٍ الحذف…' : 'Deleting…') : (ar ? 'حذف' : 'Delete')}
                        </button>
                    </>
                }
            >
                <p style={{ margin: 0 }}>
                    {ar
                        ? `هل أنت متأكد من حذف رسالة "${deleteTarget?.subject}"؟ لا يمكن التراجع عن هذا الإجراء.`
                        : `Are you sure you want to delete the message "${deleteTarget?.subject}"? This action cannot be undone.`}
                </p>
            </Modal>
        </div>
    );
};

export default ContactMessages;
