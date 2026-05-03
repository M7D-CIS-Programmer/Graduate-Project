import React, { useState, useRef } from 'react';
import {
    ShieldAlert, Upload, X, Loader2, AlertTriangle,
    CheckCircle, XCircle, AlertCircle, FileText
} from 'lucide-react';
import { api } from '../../api/api';
import { useLanguage } from '../../context/LanguageContext';
import './CVAnalyzer.css';

const MAX_FILE_MB = 10;

// ─────────────────────────────────────────────────────────────────────────────

const FraudCheck = () => {
    const { t, dir, language } = useLanguage();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const riskColor = (r) => {
        if (r === 'low') return 'cva-badge-green';
        if (r === 'medium') return 'cva-badge-orange';
        return 'cva-badge-red';
    };

    const verdictConfig = (v) => {
        if (v === 'trusted') return { cls: 'cva-verdict-trusted', Icon: CheckCircle, color: '#15803d', label: t('trusted'), sub: t('trustedDesc') };
        if (v === 'questionable') return { cls: 'cva-verdict-questionable', Icon: AlertCircle, color: '#c2410c', label: t('questionable'), sub: t('questionableDesc') };
        return { cls: 'cva-verdict-likely_fake', Icon: XCircle, color: '#991b1b', label: t('likelyFake'), sub: t('likelyFakeDesc') };
    };

    // ── File handling ──────────────────────────────────────────────────────────

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        e.target.value = '';
        if (!selected) return;
        if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
            setError(t('onlyPdfAccepted'));
            return;
        }
        if (selected.size > MAX_FILE_MB * 1024 * 1024) {
            setError(t('fileTooLargeMax', { max: MAX_FILE_MB }));
            return;
        }
        setFile(selected);
        setError('');
        setResult(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFileChange({ target: { files: [dropped], value: '' } });
    };

    const handleClear = () => { setFile(null); setResult(null); setError(''); };

    // ── Check ──────────────────────────────────────────────────────────────────

    const handleCheck = async () => {
        if (!file) { setError(t('pleaseUploadPdf')); return; }

        setError('');
        setResult(null);
        setLoading(true);

        try {
            const data = await api.detectCvFraud(file, language);
            setResult(data);
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('quota') || msg.includes('429'))
                setError(t('jmErrorQuota'));
            else if (msg.includes('timed out') || msg.includes('408'))
                setError(t('jmErrorTimeout'));
            else if (msg.includes('scanned') || msg.includes('image'))
                setError(t('scannedPdfError'));
            else
                setError(msg || t('cvErrorGeneral'));
        } finally {
            setLoading(false);
        }
    };

    const cfg = result ? verdictConfig(result.finalVerdict) : null;

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className={`cva-page ${dir}`} dir={dir}>

            {/* Header */}
            <div className="cva-header">
                <div className="cva-header-icon" style={{
                    background: 'linear-gradient(135deg, #ef4444, #f97316)',
                    marginLeft: dir === 'rtl' ? '1rem' : '0',
                    marginRight: dir === 'ltr' ? '1rem' : '0'
                }}>
                    <ShieldAlert size={28} />
                </div>
                <div>
                    <h1 className="cva-title">{t('fraudDetection')}</h1>
                    <p className="cva-subtitle">{t('fraudDetectionDesc')}</p>
                </div>
            </div>

            {/* Input Card */}
            <div className="cva-card cva-input-card">
                <div className="cva-field">
                    <label className="cva-label">
                        <Upload size={15} style={{
                            marginLeft: dir === 'rtl' ? '0.5rem' : '0',
                            marginRight: dir === 'ltr' ? '0.5rem' : '0'
                        }} />
                        {t('candidateCvPdf')} <span className="cva-required">*</span>
                    </label>
                    <div
                        className={`cva-dropzone ${file ? 'cva-dropzone--has-file' : ''} ${loading ? 'cva-dropzone--disabled' : ''}`}
                        onClick={() => !loading && fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={!loading ? handleDrop : undefined}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && !loading && fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            disabled={loading}
                        />
                        {file ? (
                            <div className="cva-file-info">
                                <FileText size={28} className="cva-icon-blue" />
                                <div className="cva-file-details">
                                    <span className="cva-file-name">{file.name}</span>
                                    <span className="cva-file-size">{(file.size / 1024).toFixed(0)} KB</span>
                                </div>
                                <button
                                    className="cva-btn cva-btn-ghost cva-remove-btn"
                                    onClick={(e) => { e.stopPropagation(); handleClear(); }}
                                    disabled={loading}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="cva-dropzone-empty">
                                <Upload size={32} className="cva-upload-icon" />
                                <p className="cva-dropzone-title">{t('uploadCvTitle')}</p>
                                <p className="cva-dropzone-hint">{t('fraudDropzoneHint')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="cva-error">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="cva-actions">
                    <button
                        className="cva-btn cva-btn-primary"
                        onClick={handleCheck}
                        disabled={!file || loading}
                        style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
                    >
                        {loading
                            ? <><Loader2 size={18} className="cva-spin" /><span>{t('checking')}</span></>
                            : <><ShieldAlert size={18} /><span>{t('runFraudCheck')}</span></>
                        }
                    </button>
                </div>
            </div>

            {/* Results */}
            {result && cfg && (
                <div className="cva-results">

                    {/* Verdict Banner */}
                    <div className={`cva-verdict ${cfg.cls}`}>
                        <cfg.Icon size={38} style={{
                            color: cfg.color,
                            flexShrink: 0,
                            marginLeft: dir === 'rtl' ? '1rem' : '0',
                            marginRight: dir === 'ltr' ? '1rem' : '0'
                        }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: cfg.color, lineHeight: 1, marginBottom: '.3rem' }}>
                                {cfg.label}
                            </div>
                            <div style={{ fontSize: '.875rem', color: cfg.color, opacity: .85 }}>
                                {cfg.sub}
                            </div>
                        </div>
                        <span
                            className={`cva-badge ${riskColor(result.riskLevel)}`}
                            style={{ fontSize: '.85rem', padding: '.38rem 1rem', flexShrink: 0 }}
                        >
                            {result.riskLevel ? t(result.riskLevel) : t('low')} {t('risk')}
                        </span>
                    </div>

                    {/* Issues */}
                    {result.issuesFound?.length > 0 ? (
                        <div className="cva-card cva-result-card" style={{ borderLeft: dir === 'ltr' ? '3px solid #ef4444' : 'none', borderRight: dir === 'rtl' ? '3px solid #ef4444' : 'none' }}>
                            <div className="cva-card-header">
                                <AlertTriangle size={18} style={{
                                    color: '#ef4444',
                                    marginLeft: dir === 'rtl' ? '0.5rem' : '0',
                                    marginRight: dir === 'ltr' ? '0.5rem' : '0'
                                }} />
                                <h3 style={{ color: '#ef4444' }}>
                                    {t('issuesFound')} ({result.issuesFound.length})
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                                {result.issuesFound.map((item, i) => (
                                    <div key={i} className="cva-issue-card">
                                        <div className="cva-issue-title">{item.issue}</div>
                                        <div className="cva-issue-reason">{item.reason}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="cva-card cva-result-card">
                            <p className="cva-empty-note" style={{ fontSize: '.9rem' }}>
                                {t('noIssuesFound')}
                            </p>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default FraudCheck;
