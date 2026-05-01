import React, { useState, useRef } from 'react';
import {
    ShieldAlert, Upload, X, Loader2, AlertTriangle,
    CheckCircle, XCircle, AlertCircle, FileText
} from 'lucide-react';
import { api } from '../../api/api';
import { useLanguage } from '../../context/LanguageContext';
import './CVAnalyzer.css';

const MAX_FILE_MB = 10;

const riskColor = (r) => {
    if (r === 'low')    return 'cva-badge-green';
    if (r === 'medium') return 'cva-badge-orange';
    return 'cva-badge-red';
};

const verdictConfig = (v) => {
    if (v === 'trusted')      return { cls: 'cva-verdict-trusted',      Icon: CheckCircle, color: '#15803d', label: 'Trusted',      sub: 'No suspicious content detected.' };
    if (v === 'questionable') return { cls: 'cva-verdict-questionable', Icon: AlertCircle, color: '#c2410c', label: 'Questionable', sub: 'Some inconsistencies were found. Manual review recommended.' };
    return                           { cls: 'cva-verdict-likely_fake',  Icon: XCircle,     color: '#991b1b', label: 'Likely Fake',  sub: 'Multiple red flags detected. Proceed with caution.' };
};

// ─────────────────────────────────────────────────────────────────────────────

const FraudCheck = () => {
    const { dir } = useLanguage();
    const fileInputRef = useRef(null);

    const [file, setFile]       = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState('');

    // ── File handling ──────────────────────────────────────────────────────────

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        e.target.value = '';
        if (!selected) return;
        if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
            setError('Only PDF files are accepted.');
            return;
        }
        if (selected.size > MAX_FILE_MB * 1024 * 1024) {
            setError(`File too large. Maximum is ${MAX_FILE_MB} MB.`);
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
        if (!file) { setError('Please upload a PDF file.'); return; }

        setError('');
        setResult(null);
        setLoading(true);

        try {
            const data = await api.detectCvFraud(file);
            setResult(data);
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('quota') || msg.includes('429'))
                setError('Quota exceeded. Please try again later.');
            else if (msg.includes('timed out') || msg.includes('408'))
                setError('Request timed out. Please try again.');
            else if (msg.includes('scanned') || msg.includes('image'))
                setError('Scanned PDFs cannot be analysed — please use a text-based PDF.');
            else
                setError(msg || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const cfg = result ? verdictConfig(result.finalVerdict) : null;

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="cva-page" dir={dir}>

            {/* Header */}
            <div className="cva-header">
                <div className="cva-header-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                    <ShieldAlert size={28} />
                </div>
                <div>
                    <h1 className="cva-title">CV Fraud Detection</h1>
                    <p className="cva-subtitle">Detect timeline gaps, unrealistic claims, and logical inconsistencies</p>
                </div>
            </div>

            {/* Input Card */}
            <div className="cva-card cva-input-card">
                <div className="cva-field">
                    <label className="cva-label">
                        <Upload size={15} />
                        Candidate CV (PDF) <span className="cva-required">*</span>
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
                                <p className="cva-dropzone-title">Upload CV</p>
                                <p className="cva-dropzone-hint">Drag & drop or click — PDF only, max 10 MB</p>
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
                            ? <><Loader2 size={18} className="cva-spin" /><span>Checking...</span></>
                            : <><ShieldAlert size={18} /><span>Run Fraud Check</span></>
                        }
                    </button>
                </div>
            </div>

            {/* Results */}
            {result && cfg && (
                <div className="cva-results">

                    {/* Verdict Banner */}
                    <div className={`cva-verdict ${cfg.cls}`}>
                        <cfg.Icon size={38} style={{ color: cfg.color, flexShrink: 0 }} />
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
                            {result.riskLevel
                                ? result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)
                                : 'Low'
                            } Risk
                        </span>
                    </div>

                    {/* Issues */}
                    {result.issuesFound?.length > 0 ? (
                        <div className="cva-card cva-result-card" style={{ borderLeft: '3px solid #ef4444' }}>
                            <div className="cva-card-header">
                                <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                                <h3 style={{ color: '#ef4444' }}>
                                    Issues Found ({result.issuesFound.length})
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
                                ✅ No issues found. The CV appears consistent and credible.
                            </p>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default FraudCheck;
