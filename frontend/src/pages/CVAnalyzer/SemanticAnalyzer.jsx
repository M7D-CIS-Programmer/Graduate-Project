import React, { useState, useRef } from 'react';
import {
    Brain, Upload, X, Loader2, AlertTriangle,
    CheckCircle, Target, BookOpen, Shield, FileText, Briefcase
} from 'lucide-react';
import { api } from '../../api/api';
import { useLanguage } from '../../context/LanguageContext';
import { useFormCache } from '../../hooks/useFormCache';
import './CVAnalyzer.css';

const MAX_FILE_MB = 10;

const qualityColor = (q) => {
    if (q === 'high')   return 'cva-badge-green';
    if (q === 'medium') return 'cva-badge-orange';
    return 'cva-badge-red';
};

const consistencyColor = (c) => {
    if (c === 'pass')    return 'cva-badge-green';
    if (c === 'warning') return 'cva-badge-orange';
    return 'cva-badge-red';
};

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

// ─────────────────────────────────────────────────────────────────────────────

const SemanticAnalyzer = () => {
    const { dir, language } = useLanguage();
    const fileInputRef = useRef(null);

    const [file, setFile]       = useState(null);
    const [jobDesc, setJobDesc] = useFormCache('sem_jobDesc');
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

    // ── Analysis ───────────────────────────────────────────────────────────────

    const handleAnalyze = async () => {
        if (!file)                    { setError('Please upload a PDF file.');          return; }
        if (!jobDesc.trim())          { setError('Please enter a job description.');    return; }
        if (jobDesc.trim().length < 20) { setError('Job description is too short.'); return; }

        setError('');
        setResult(null);
        setLoading(true);

        try {
            const data = await api.semanticAnalyzeCv(file, jobDesc.trim(), language);
            setResult(data);
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('quota') || msg.includes('429'))
                setError('Analysis quota exceeded. Please try again later.');
            else if (msg.includes('timed out') || msg.includes('408'))
                setError('Analysis timed out. Please try again.');
            else if (msg.includes('scanned') || msg.includes('image'))
                setError('Scanned PDFs cannot be analysed — please use a text-based PDF.');
            else
                setError(msg || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = file && jobDesc.trim().length >= 20 && !loading;

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="cva-page" dir={dir}>

            {/* Header */}
            <div className="cva-header">
                <div className="cva-header-icon" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                    <Brain size={28} />
                </div>
                <div>
                    <h1 className="cva-title">Semantic CV Analyzer</h1>
                    <p className="cva-subtitle">Deep semantic analysis — meaning, logic, and true fit assessment</p>
                </div>
            </div>

            {/* Input Card */}
            <div className="cva-card cva-input-card">

                {/* Job Description */}
                <div className="cva-field">
                    <label className="cva-label">
                        <Briefcase size={15} />
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
                        onClick={handleAnalyze}
                        disabled={!canSubmit}
                        style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                    >
                        {loading
                            ? <><Loader2 size={18} className="cva-spin" /><span>Analyzing...</span></>
                            : <><Brain size={18} /><span>Run Semantic Analysis</span></>
                        }
                    </button>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="cva-results">

                    {/* Overall Insight — top banner */}
                    <div className="cva-verdict cva-verdict-trusted">
                        <CheckCircle size={24} style={{ color: '#15803d', flexShrink: 0 }} />
                        <div>
                            <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.2rem' }}>
                                Overall Insight
                            </div>
                            <div style={{ fontSize: '.95rem', color: '#14532d', fontWeight: 500, lineHeight: 1.5 }}>
                                {result.overallInsight}
                            </div>
                        </div>
                    </div>

                    <div className="cva-results-grid">

                        {/* Semantic Match Analysis — full width */}
                        <div className="cva-card cva-result-card cva-full-width">
                            <div className="cva-card-header">
                                <Brain size={18} className="cva-icon-blue" />
                                <h3>Semantic Match Analysis</h3>
                            </div>
                            <p style={{ fontSize: '.875rem', color: 'var(--text-secondary, #475569)', lineHeight: 1.7, margin: 0 }}>
                                {result.semanticMatchAnalysis}
                            </p>
                        </div>

                        {/* Key Matching Areas */}
                        <div className="cva-card cva-result-card">
                            <div className="cva-card-header">
                                <Target size={18} className="cva-icon-green" />
                                <h3>Key Matching Areas</h3>
                            </div>
                            {result.keyMatchingAreas?.length > 0 ? (
                                <div className="cva-tags">
                                    {result.keyMatchingAreas.map((a, i) => (
                                        <span key={i} className="cva-tag cva-tag-match">{a}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="cva-empty-note">No strong matches identified.</p>
                            )}
                        </div>

                        {/* Missing Critical Skills */}
                        <div className="cva-card cva-result-card">
                            <div className="cva-card-header">
                                <AlertTriangle size={18} className="cva-icon-orange" />
                                <h3>Missing Critical Skills</h3>
                            </div>
                            {result.missingCriticalSkills?.length > 0 ? (
                                <div className="cva-tags">
                                    {result.missingCriticalSkills.map((s, i) => (
                                        <span key={i} className="cva-tag cva-tag-missing">{s}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="cva-empty-note">✅ No critical skills missing.</p>
                            )}
                        </div>

                        {/* Experience Quality */}
                        <div className="cva-card cva-result-card">
                            <div className="cva-card-header">
                                <BookOpen size={18} className="cva-icon-purple" />
                                <h3>Experience Quality</h3>
                            </div>
                            <span
                                className={`cva-badge ${qualityColor(result.experienceQuality)}`}
                                style={{ alignSelf: 'flex-start', fontSize: '.9rem', padding: '.4rem 1.1rem' }}
                            >
                                {cap(result.experienceQuality || 'medium')}
                            </span>
                        </div>

                        {/* Consistency Check */}
                        <div className="cva-card cva-result-card">
                            <div className="cva-card-header">
                                <Shield size={18} className="cva-icon-blue" />
                                <h3>Consistency Check</h3>
                            </div>
                            <span
                                className={`cva-badge ${consistencyColor(result.consistencyCheck)}`}
                                style={{ alignSelf: 'flex-start', fontSize: '.9rem', padding: '.4rem 1.1rem' }}
                            >
                                {cap(result.consistencyCheck || 'pass')}
                            </span>
                        </div>

                        {/* Fraud Indicators — only when present */}
                        {result.fraudIndicators?.length > 0 && (
                            <div className="cva-card cva-result-card cva-full-width" style={{ borderLeft: '3px solid #ef4444' }}>
                                <div className="cva-card-header">
                                    <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                                    <h3 style={{ color: '#ef4444' }}>Fraud Indicators</h3>
                                </div>
                                <ul className="cva-list">
                                    {result.fraudIndicators.map((f, i) => (
                                        <li key={i} style={{ color: '#7f1d1d' }}>{f}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default SemanticAnalyzer;
