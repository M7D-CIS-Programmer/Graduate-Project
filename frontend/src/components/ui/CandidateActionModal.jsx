import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import './CandidateActionModal.css';

/* ─── Action config ──────────────────────────────────────────────── */
const ACTION_CONFIG = {
    accept: {
        icon: CheckCircle,
        accentClass: 'cam--accept',
        titleKey: 'candidateActionAcceptTitle',
        messageKey: 'candidateActionAcceptMsg',
    },
    reject: {
        icon: XCircle,
        accentClass: 'cam--reject',
        titleKey: 'candidateActionRejectTitle',
        messageKey: 'candidateActionRejectMsg',
    },
    review: {
        icon: Eye,
        accentClass: 'cam--review',
        titleKey: 'candidateActionReviewTitle',
        messageKey: 'candidateActionReviewMsg',
    },
};

/* ─── Component ──────────────────────────────────────────────────── */
const CandidateActionModal = ({ isOpen, actionType, candidate, onClose, onConfirm }) => {
    const { t, dir } = useLanguage();
    const { theme } = useTheme();
    const confirmBtnRef = useRef(null);

    // ── DEBUG STEP 1: log on every render ──────────────────────────
    console.log('[CandidateActionModal] RENDERED', { isOpen, actionType, candidate });

    const config = actionType ? ACTION_CONFIG[actionType] : null;
    const Icon = config?.icon ?? CheckCircle;

    /* ── Scroll lock ── */
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    /* ── ESC to close ── */
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    /* ── Auto-focus confirm button ── */
    useEffect(() => {
        if (isOpen && confirmBtnRef.current) {
            const id = setTimeout(() => confirmBtnRef.current?.focus(), 50);
            return () => clearTimeout(id);
        }
    }, [isOpen]);

    // ── DEBUG STEP 2: guard removed temporarily – always shows test block ──
    // ── HOW TO READ RESULTS:
    //    • Red screen appears immediately on page load  → portal + React rendering work fine;
    //      the issue was the isOpen guard or CSS hiding the real modal.
    //    • Nothing appears at all → import/export is broken or component is not mounted.
    // ── After confirming which case you are in, restore the guard (see comment below).

    /* TEMPORARY: force render a bright red test overlay to prove portal works */
    if (!isOpen) {
        // ── DEBUG: uncomment the block below to force the test overlay regardless of isOpen
        // return createPortal(
        //     <div style={{
        //         position: 'fixed', top: 0, left: 0,
        //         width: '100%', height: '100%',
        //         background: 'red', zIndex: 99999,
        //         display: 'flex', alignItems: 'center', justifyContent: 'center',
        //         color: '#fff', fontSize: '2rem', fontWeight: 700
        //     }}>
        //         TEST MODAL — isOpen is {String(isOpen)} — if you see this, portal works!
        //     </div>,
        //     document.body
        // );
        return null;
    }

    // At this point isOpen === true. If you still see nothing, the CSS is hiding the modal.
    console.log('[CandidateActionModal] isOpen is TRUE — rendering real modal now');

    if (!config) {
        console.warn('[CandidateActionModal] unknown actionType:', actionType);
        return null;
    }

    const candidateName = candidate?.user?.name || candidate?.name || '';
    const jobTitle      = candidate?.job?.title  || '';

    return createPortal(
        <div
            className="cam-backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cam-title"
            aria-describedby="cam-message"
            data-theme={theme}
        >
            <div
                className={`cam-panel ${config.accentClass}`}
                dir={dir}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close × */}
                <button
                    type="button"
                    className="cam-close-btn"
                    onClick={onClose}
                    aria-label={t('cancel')}
                >
                    <X size={18} />
                </button>

                {/* Action icon */}
                <div className={`cam-icon-wrap ${config.accentClass}`} aria-hidden="true">
                    <Icon size={30} strokeWidth={2} />
                </div>

                {/* Title */}
                <h2 id="cam-title" className="cam-title">
                    {t(config.titleKey)}
                </h2>

                {/* Message */}
                <p id="cam-message" className="cam-message">
                    {t(config.messageKey)}
                </p>

                {/* Candidate info pill */}
                {(candidateName || jobTitle) && (
                    <div className="cam-candidate-pill">
                        {candidateName && <span className="cam-pill-name">{candidateName}</span>}
                        {candidateName && jobTitle && <span className="cam-pill-sep">·</span>}
                        {jobTitle && <span className="cam-pill-job">{jobTitle}</span>}
                    </div>
                )}

                {/* Action buttons */}
                <div className="cam-actions">
                    <button
                        id="cam-cancel"
                        type="button"
                        className="cam-btn cam-btn--cancel"
                        onClick={onClose}
                    >
                        {t('cancel')}
                    </button>

                    <button
                        id="cam-confirm"
                        type="button"
                        ref={confirmBtnRef}
                        className={`cam-btn cam-btn--confirm ${config.accentClass}`}
                        onClick={() => onConfirm(actionType, candidate)}
                    >
                        <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
                        {t('confirm')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CandidateActionModal;
