import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LogOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './LogoutModal.css';

const LogoutModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    cancelLabel,
    confirmLabel,
}) => {
    const { t, dir } = useLanguage();

    /* ── Resolved labels: caller can override, otherwise falls back to translated strings ── */
    const resolvedTitle   = title         ?? t('logoutConfirmTitle');
    const resolvedMessage = message       ?? t('logoutConfirmMessage');
    const resolvedCancel  = cancelLabel   ?? t('cancel');
    const resolvedConfirm = confirmLabel  ?? t('logout');

    /* ── Lock body scroll while modal is open ── */
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    /* ── ESC key closes the modal ── */
    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    /* ── Don't render anything when closed ── */
    if (!isOpen) return null;

    return createPortal(
        /* Backdrop */
        <div
            className="logout-modal-backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-desc"
        >
            {/* Panel – dir syncs text direction with the active language */}
            <div
                className="logout-modal-panel glass"
                dir={dir}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="logout-modal-icon-wrap" aria-hidden="true">
                    <LogOut size={28} strokeWidth={2} />
                </div>

                {/* Heading */}
                <h2 id="logout-modal-title" className="logout-modal-title">
                    {resolvedTitle}
                </h2>

                {/* Body text */}
                <p id="logout-modal-desc" className="logout-modal-message">
                    {resolvedMessage}
                </p>

                {/* Actions */}
                <div className="logout-modal-actions">
                    <button
                        id="logout-modal-cancel"
                        className="logout-modal-btn logout-modal-btn--cancel"
                        onClick={onClose}
                        autoFocus
                    >
                        {resolvedCancel}
                    </button>

                    <button
                        id="logout-modal-confirm"
                        className="logout-modal-btn logout-modal-btn--confirm"
                        onClick={onConfirm}
                    >
                        <LogOut size={16} strokeWidth={2.5} aria-hidden="true" />
                        {resolvedConfirm}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LogoutModal;
