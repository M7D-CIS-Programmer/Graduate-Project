import React, { useEffect, useCallback } from 'react';
import { LogOut } from 'lucide-react';
import './LogoutModal.css';


const LogoutModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Logout',
    message = 'Are you sure you want to log out? You will need to sign in again to access your account.',
    cancelLabel = 'Cancel',
    confirmLabel = 'Logout',
}) => {
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

    return (
        /* Backdrop */
        <div
            className="logout-modal-backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-desc"
        >
            {/* Panel – stop backdrop click from propagating */}
            <div
                className="logout-modal-panel glass"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="logout-modal-icon-wrap" aria-hidden="true">
                    <LogOut size={28} strokeWidth={2} />
                </div>

                {/* Heading */}
                <h2 id="logout-modal-title" className="logout-modal-title">
                    {title}
                </h2>

                {/* Body text */}
                <p id="logout-modal-desc" className="logout-modal-message">
                    {message}
                </p>

                {/* Actions */}
                <div className="logout-modal-actions">
                    <button
                        id="logout-modal-cancel"
                        className="logout-modal-btn logout-modal-btn--cancel"
                        onClick={onClose}
                        autoFocus
                    >
                        {cancelLabel}
                    </button>

                    <button
                        id="logout-modal-confirm"
                        className="logout-modal-btn logout-modal-btn--confirm"
                        onClick={onConfirm}
                    >
                        <LogOut size={16} strokeWidth={2.5} aria-hidden="true" />
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
