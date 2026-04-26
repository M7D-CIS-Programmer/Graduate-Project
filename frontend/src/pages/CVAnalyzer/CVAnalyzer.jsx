import React, { useState, useRef } from 'react';
import {
    ScanText, Upload, X, Loader2,
    AlertTriangle, Zap, TrendingUp,
    FileText, Briefcase, Lightbulb, Target
} from 'lucide-react';
import { api } from '../../api/api';
import { useLanguage } from '../../context/LanguageContext';
import './CVAnalyzer.css';

const MAX_FILE_MB = 10;

const toInt = (v) => Math.round(Number(v) || 0);

const scoreColor = (v) => {
    const n = toInt(v);
    if (n >= 71) return 'score-green';
    if (n >= 41) return 'score-orange';
    return 'score-red';
};

const scoreLabel = (v) => {
    const n = toInt(v);
    if (n >= 71) return 'Strong Match';
    if (n >= 41) return 'Moderate Match';
    return 'Weak Match';
};

// ── Mini score progress bar ────────────────────────────────────────────────────
const ScoreBar = ({ value }) => (
    <div className="cva-mini-score">
        <div className={`cva-mini-circle ${scoreColor(value)}`}>
            <span>{toInt(value)}</span>
            <small>/100</small>
        </div>
        <div className="cva-score-meta">
            <span className={`cva-score-label ${scoreColor(value)}`}>
                {scoreLabel(value)}
            </span>
            <div className="cva-score-bar-track">
                <div
                    className={`cva-score-bar-fill ${scoreColor(value)}`}
                    style={{ width: `${Math.min(toInt(value), 100)}%` }}
                />
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const CVAnalyzer = () => {
    const { t, dir } = useLanguage();
    const fileInputRef = useRef(null);

    const [file, setFile]         = useState(null);
    const [jobTitle, setJobTitle] = useState('');
    const [jobDesc, setJobDesc]   = useState('');
    const [loading, setLoading]   = useState(false);
    const [result, setResult]     = useState(null);
    const [error, setError]       = useState('');

    // ── File handling ──────────────────────────────────────────────────────────

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        e.target.value = '';
        if (!selected) return;

        if (!selected.name.toLowerCase().endsWith('.pdf') &&
            selected.type !== 'application/pdf') {
            setError(t('cvErrorNotPdf'));
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

    const handleClear = () => {
        setFile(null);
        setResult(null);
        setError('');
    };

    // ── Analysis ───────────────────────────────────────────────────────────────

    const handleAnalyze = async () => {
        if (!file)              { setError(t('cvErrorNoFile'));    return; }
        if (!jobTitle.trim())   { setError(t('cvErrorNoJobTitle')); return; }
        if (!jobDesc.trim())    { setError(t('cvErrorNoJobDesc'));  return; }
        if (jobDesc.trim().length < 20) {
            setError(t('cvErrorJobDescShort'));
            return;
        }

        setError('');
        setResult(null);
        setLoading(true);

        try {
            const data = await api.analyzeCv(file, jobTitle.trim(), jobDesc.trim());
            setResult(data);
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('quota') || msg.includes('429'))
                setError('Analysis quota exceeded. Please try again later.');
            else if (msg.includes('timed out') || msg.includes('408'))
                setError('Analysis timed out. Please try again.');
            else if (msg.includes('scanned') || msg.includes('image'))
                setError(t('cvErrorScanned'));
            else
                setError(msg || t('cvErrorGeneral'));
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = file && jobTitle.trim() && jobDesc.trim() && !loading;

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="cva-page" dir={dir}>

            {/* Header */}
            <div className="cva-header">
                <div className="cva-header-icon"><ScanText size={28} /></div>
                <div>
                    <h1 className="cva-title">{t('cvAnalyzer')}</h1>
                    <p className="cva-subtitle">{t('cvAnalyzerSubtitle')}</p>
                </div>
            </div>

            {/* Input Card */}
            <div className="cva-card cva-input-card">

                {/* Job Title */}
                <div className="cva-field">
                    <label className="cva-label">
                        <Briefcase size={15} />
                        {t('cvJobTitle')} <span className="cva-required">*</span>
                    </label>
                    <input
                        className="cva-input"
                        type="text"
                        placeholder={t('cvJobTitlePlaceholder')}
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
                        {t('cvJobDescription')} <span className="cva-required">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            className="cva-textarea"
                            placeholder={t('cvJobDescPlaceholder')}
                            value={jobDesc}
                            onChange={(e) => { setJobDesc(e.target.value); setError(''); }}
                            disabled={loading}
                            rows={6}
                        />
                        {jobDesc && (
                            <span className="cva-char-count">{jobDesc.length} chars</span>
                        )}
                    </div>
                </div>

                {/* PDF Upload */}
                <div className="cva-field">
                    <label className="cva-label">
                        <Upload size={15} />
                        {t('cvUploadLabel')} <span className="cva-required">*</span>
                    </label>
                    <div
                        className={`cva-dropzone ${file ? 'cva-dropzone--has-file' : ''} ${loading ? 'cva-dropzone--disabled' : ''}`}
                        onClick={() => !loading && fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={!loading ? handleDrop : undefined}
                        role="button"
                        tabIndex={0}
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
                                <p className="cva-dropzone-title">{t('uploadCv')}</p>
                                <p className="cva-dropzone-hint">{t('cvDropHint')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="cva-error">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Analyze button */}
                <div className="cva-actions">
                    <button
                        className="cva-btn cva-btn-primary"
                        onClick={handleAnalyze}
                        disabled={!canSubmit}
                    >
                        {loading
                            ? <><Loader2 size={18} className="cva-spin" /><span>{t('analyzing')}</span></>
                            : <><ScanText size={18} /><span>{t('analyzeBtn')}</span></>
                        }
                    </button>
                </div>
            </div>

            {/* ── Results ── */}
            {result && (
                <div className="cva-results">

                    {/* Job banner */}
                    <div className="cva-job-banner">
                        <Briefcase size={16} />
                        <span>{t('cvAnalyzingFor')} <strong>{jobTitle}</strong></span>
                    </div>

                    <div className="cva-results-grid">

                        {/* Match Score */}
                        <div className="cva-card cva-result-card cva-score-card">
                            <div className="cva-card-header">
                                <Target size={18} className="cva-icon-purple" />
                                <h3>{t('matchPercentage')}</h3>
                            </div>
                            <ScoreBar value={result.matchScore} />
                        </div>

                        {/* Missing Skills */}
                        <div className="cva-card cva-result-card">
                            <div className="cva-card-header">
                                <Zap size={18} className="cva-icon-yellow" />
                                <h3>{t('cvMissingSkills')}</h3>
                            </div>
                            {result.missingSkills?.length > 0 ? (
                                <div className="cva-tags">
                                    {result.missingSkills.map((s, i) => (
                                        <span key={i} className="cva-tag cva-tag-missing">{s}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="cva-empty-note">✅ No major skill gaps detected.</p>
                            )}
                        </div>

                        {/* Keyword Gaps */}
                        <div className="cva-card cva-result-card">
                            <div className="cva-card-header">
                                <AlertTriangle size={18} className="cva-icon-orange" />
                                <h3>{t('keywordGaps')}</h3>
                            </div>
                            {result.keywordGaps?.length > 0 ? (
                                <div className="cva-tags">
                                    {result.keywordGaps.map((k, i) => (
                                        <span key={i} className="cva-tag cva-tag-gap">{k}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="cva-empty-note">✅ Keywords look good.</p>
                            )}
                        </div>

                        {/* Weak Sections */}
                        <div className="cva-card cva-result-card">
                            <div className="cva-card-header">
                                <TrendingUp size={18} className="cva-icon-orange" />
                                <h3>{t('cvWeakSections')}</h3>
                            </div>
                            <ul className="cva-list cva-list-orange">
                                {result.weakSections?.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>

                        {/* Improvement Suggestions — full width, most important */}
                        <div className="cva-card cva-result-card cva-full-width cva-suggestions-card">
                            <div className="cva-card-header">
                                <Lightbulb size={18} className="cva-icon-green" />
                                <h3>{t('cvImprovementSuggestions')}</h3>
                            </div>
                            <ul className="cva-list cva-list-suggestions">
                                {result.improvementSuggestions?.map((s, i) => (
                                    <li key={i}>
                                        <span className="cva-suggestion-num">{i + 1}</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default CVAnalyzer;
