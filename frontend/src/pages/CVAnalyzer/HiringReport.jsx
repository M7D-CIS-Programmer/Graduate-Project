import React, { useState, useRef } from 'react';
import {
    Trophy, Upload, X, Loader2, AlertTriangle,
    CheckCircle, XCircle, AlertCircle, FileText,
    Briefcase, TrendingUp, Shield, MessageSquare
} from 'lucide-react';
import { api } from '../../api/api';
import { useLanguage } from '../../context/LanguageContext';
import { useFormCache } from '../../hooks/useFormCache';
import './CVAnalyzer.css';

const MAX_FILE_MB = 10;
const toInt = (v) => Math.round(Number(v) || 0);

const scoreColor = (v) => {
    const n = toInt(v);
    if (n >= 71) return 'score-green';
    if (n >= 41) return 'score-orange';
    return 'score-red';
};

const ScoreBar = ({ value, label }) => (
    <div className="cva-mini-score">
        <div className={`cva-mini-circle ${scoreColor(value)}`}>
            <span>{toInt(value)}</span>
            <small>/100</small>
        </div>
        <div className="cva-score-meta">
            {label && (
                <span className={`cva-score-label ${scoreColor(value)}`}>{label}</span>
            )}
            <div className="cva-score-bar-track">
                <div
                    className={`cva-score-bar-fill ${scoreColor(value)}`}
                    style={{ width: `${Math.min(toInt(value), 100)}%` }}
                />
            </div>
        </div>
    </div>
);

const decisionConfig = (d, t) => {
    if (d === 'strong_hire') return { cls: 'cva-verdict-strong_hire', Icon: Trophy,      color: '#15803d', label: t('strongHire') || 'Strong Hire' };
    if (d === 'hire')        return { cls: 'cva-verdict-hire',        Icon: CheckCircle, color: '#16a34a', label: t('hire') || 'Hire' };
    if (d === 'neutral')     return { cls: 'cva-verdict-neutral',     Icon: AlertCircle, color: '#b45309', label: t('neutral') || 'Neutral' };
    return                          { cls: 'cva-verdict-reject',      Icon: XCircle,     color: '#991b1b', label: t('reject') || 'Reject' };
};

const riskColor = (r) => {
    if (r === 'low')    return 'cva-badge-green';
    if (r === 'medium') return 'cva-badge-orange';
    return 'cva-badge-red';
};

const STEPS = (t) => [
    t('calculatingScore') || 'Calculating match score...',
    t('semanticAnalysisStep') || 'Running semantic analysis...',
    t('fraudDetectionStep') || 'Running fraud detection...',
    t('generatingRecommendation') || 'Generating hiring recommendation...',
];

// ─────────────────────────────────────────────────────────────────────────────

const HiringReport = () => {
    const { dir, t } = useLanguage();
    const fileInputRef = useRef(null);

    const [file, setFile]         = useState(null);
    const [jobTitle, setJobTitle] = useFormCache('hr_jobTitle');
    const [jobDesc, setJobDesc]   = useFormCache('hr_jobDesc');
    const [loading, setLoading]   = useState(false);
    const [step, setStep]         = useState(-1);
    const [result, setResult]     = useState(null);
    const [error, setError]       = useState('');

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
            setError(t('jmErrorFileTooLarge', { max: MAX_FILE_MB }));
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

    const handleClear = () => { setFile(null); setResult(null); setError(''); setStep(-1); };

    // ── Full pipeline ──────────────────────────────────────────────────────────

    const handleGenerate = async () => {
        if (!file)                      { setError('Please upload a PDF file.');       return; }
        if (!jobTitle.trim())           { setError('Please enter a job title.');        return; }
        if (!jobDesc.trim())            { setError('Please enter a job description.'); return; }
        if (jobDesc.trim().length < 20) { setError('Job description is too short.');   return; }

        setError('');
        setResult(null);
        setLoading(true);

        try {
            // Step 1 — match score
            setStep(0);
            const basic = await api.analyzeCv(file, jobTitle.trim(), jobDesc.trim());
            const matchScore = basic.matchScore ?? 0;

            // Step 2 — semantic analysis
            setStep(1);
            const semanticAnalysis = await api.semanticAnalyzeCv(file, jobDesc.trim());

            // Step 3 — fraud detection
            setStep(2);
            const fraudResult = await api.detectCvFraud(file);

            // Step 4 — hiring recommendation
            setStep(3);
            const recommendation = await api.generateHiringRecommendation(
                semanticAnalysis, fraudResult, matchScore
            );

            setResult({ matchScore, semanticAnalysis, fraudResult, recommendation });
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
            setStep(-1);
        }
    };

    const canSubmit = file && jobTitle.trim() && jobDesc.trim().length >= 20 && !loading;
    const rec = result?.recommendation;
    const cfg = rec ? decisionConfig(rec.finalDecision, t) : null;

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="cva-page" dir={dir}>

            {/* Header */}
            <div className="cva-header">
                <div className="cva-header-icon" style={{
                    background: 'linear-gradient(135deg, #059669, #0ea5e9)',
                    marginLeft: dir === 'rtl' ? '1rem' : '0',
                    marginRight: dir === 'ltr' ? '1rem' : '0'
                }}>
                    <Trophy size={28} />
                </div>
                <div>
                    <h1 className="cva-title">{t('fullHiringReport')}</h1>
                    <p className="cva-subtitle">{t('hiringReportDesc')}</p>
                </div>
            </div>

            {/* Input Card */}
            <div className="cva-card cva-input-card">

                {/* Job Title */}
                <div className="cva-field">
                    <label className="cva-label">
                        <Briefcase size={15} style={{
                            marginLeft: dir === 'rtl' ? '0.5rem' : '0',
                            marginRight: dir === 'ltr' ? '0.5rem' : '0'
                        }} />
                        {t('jmJobTitle')} <span className="cva-required">*</span>
                    </label>
                    <input
                        className="cva-input"
                        type="text"
                        placeholder="e.g. Senior Full Stack Developer"
                        value={jobTitle}
                        onChange={(e) => { setJobTitle(e.target.value); setError(''); }}
                        disabled={loading}
                        maxLength={120}
                    />
                </div>

                {/* Job Description */}
                <div className="cva-field">
                    <label className="cva-label">
                        <FileText size={15} />
                        Job Description <span className="cva-required">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            className="cva-textarea"
                            placeholder="Paste the full job description here..."
                            value={jobDesc}
                            onChange={(e) => { setJobDesc(e.target.value); setError(''); }}
                            disabled={loading}
                            rows={6}
                        />
                        {jobDesc && <span className="cva-char-count">{jobDesc.length} chars</span>}
                    </div>
                </div>

                {/* PDF Upload */}
                <div className="cva-field">
                    <label className="cva-label">
                        <Upload size={15} style={{
                            marginLeft: dir === 'rtl' ? '0.5rem' : '0',
                            marginRight: dir === 'ltr' ? '0.5rem' : '0'
                        }} />
                        {t('jmCandidateCv')} <span className="cva-required">*</span>
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
                                <p className="jm-dropzone-title">{t('jmDropzoneTitle')}</p>
                                <p className="jm-dropzone-hint">{t('jmDropzoneHint')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pipeline progress */}
                {loading && step >= 0 && (
                    <div className="cva-pipeline">
                        {STEPS(t).map((label, i) => (
                            <div
                                key={i}
                                className={`cva-pipeline-step ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}
                            >
                                {i < step
                                    ? <CheckCircle size={16} />
                                    : i === step
                                        ? <Loader2 size={16} className="cva-spin" />
                                        : <span className="cva-pipeline-dot" />
                                }
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="cva-error">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="cva-actions">
                    <button
                        className="cva-btn cva-btn-primary"
                        onClick={handleGenerate}
                        disabled={!canSubmit}
                        style={{ background: 'linear-gradient(135deg, #059669, #0ea5e9)' }}
                    >
                        {loading
                            ? <><Loader2 size={18} className="cva-spin" /><span>{t('jmAnalyzing')}</span></>
                            : <><Trophy size={18} /><span>{t('generateHiringReport')}</span></>
                        }
                    </button>
                </div>
            </div>

            {/* Results */}
            {result && cfg && rec && (
                <div className="cva-results">

                    {/* Final Decision Banner */}
                    <div className={`cva-verdict ${cfg.cls}`}>
                        <cfg.Icon size={40} style={{
                            color: cfg.color,
                            flexShrink: 0,
                            marginLeft: dir === 'rtl' ? '1rem' : '0',
                            marginRight: dir === 'ltr' ? '1rem' : '0'
                        }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '.72rem', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.3rem' }}>
                                {t('finalDecision')}
                            </div>
                            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
                                {cfg.label}
                            </div>
                        </div>
                        <span
                            className={`cva-badge ${riskColor(rec.riskAssessment)}`}
                            style={{ fontSize: '.85rem', padding: '.38rem 1rem', flexShrink: 0 }}
                        >
                            {rec.riskAssessment ? t(rec.riskAssessment) : t('low')} {t('risk')}
                        </span>
                    </div>

                    <div className="cva-results-grid">

                        {/* Final Score */}
                        <div className="cva-card cva-result-card cva-score-card">
                            <div className="cva-card-header">
                                <TrendingUp size={18} className="cva-icon-purple" style={{
                                    marginLeft: dir === 'rtl' ? '0.5rem' : '0',
                                    marginRight: dir === 'ltr' ? '0.5rem' : '0'
                                }} />
                                <h3>{t('finalScore')}</h3>
                            </div>
                            <ScoreBar value={rec.finalScore} />
                        </div>

                        {/* System Match Score */}
                        <div className="cva-card cva-result-card">
                            <div className="cva-card-header">
                                <Shield size={18} className="cva-icon-blue" style={{
                                    marginLeft: dir === 'rtl' ? '0.5rem' : '0',
                                    marginRight: dir === 'ltr' ? '0.5rem' : '0'
                                }} />
                                <h3>{t('systemMatchScore')}</h3>
                            </div>
                            <ScoreBar value={result.matchScore} />
                        </div>

                        {/* Reasoning — full width */}
                        <div className="cva-card cva-result-card cva-full-width">
                            <div className="cva-card-header">
                                <MessageSquare size={18} className="cva-icon-blue" style={{
                                    marginLeft: dir === 'rtl' ? '0.5rem' : '0',
                                    marginRight: dir === 'ltr' ? '0.5rem' : '0'
                                }} />
                                <h3>{t('reasoning')}</h3>
                            </div>
                            <p style={{ fontSize: '.875rem', color: 'var(--text-secondary, #475569)', lineHeight: 1.7, margin: 0 }}>
                                {rec.reasoning}
                            </p>
                        </div>

                        {/* Recommendation — full width */}
                        <div
                            className="cva-card cva-result-card cva-full-width cva-suggestions-card"
                            style={{
                                borderLeft: dir === 'ltr' ? `3px solid ${cfg.color}` : 'none',
                                borderRight: dir === 'rtl' ? `3px solid ${cfg.color}` : 'none'
                            }}
                        >
                            <div className="cva-card-header">
                                <Briefcase size={18} style={{
                                    color: cfg.color,
                                    marginLeft: dir === 'rtl' ? '0.5rem' : '0',
                                    marginRight: dir === 'ltr' ? '0.5rem' : '0'
                                }} />
                                <h3>{t('nextStepRecommendation')}</h3>
                            </div>
                            <p style={{ fontSize: '.9rem', fontWeight: 500, color: 'var(--text-primary, #1e293b)', margin: 0, lineHeight: 1.6 }}>
                                {rec.recommendation}
                            </p>
                        </div>

                        {/* Fraud flags — only shown when suspicious */}
                        {result.fraudResult?.isSuspicious && result.fraudResult.issuesFound?.length > 0 && (
                            <div className="cva-card cva-result-card cva-full-width" style={{ borderLeft: '3px solid #ef4444' }}>
                                <div className="cva-card-header">
                                    <AlertTriangle size={18} style={{
                                        color: '#ef4444',
                                        marginLeft: dir === 'rtl' ? '0.5rem' : '0',
                                        marginRight: dir === 'ltr' ? '0.5rem' : '0'
                                    }} />
                                    <h3 style={{ color: '#ef4444' }}>
                                        {t('issuesFound')} ({result.fraudResult.issuesFound.length})
                                    </h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
                                    {result.fraudResult.issuesFound.map((item, i) => (
                                        <div key={i} className="cva-issue-card">
                                            <div className="cva-issue-title">{item.issue}</div>
                                            <div className="cva-issue-reason">{item.reason}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default HiringReport;
