import React, { useState, useRef } from 'react';
import {
    Brain, Upload, X, Loader2, AlertTriangle,
    FileText, Briefcase, CheckCircle, XCircle,
    Lightbulb, TrendingUp, MessageSquare, Zap
} from 'lucide-react';
import { api } from '../../api/api';
import { useLanguage } from '../../context/LanguageContext';
import { useFormCache } from '../../hooks/useFormCache';
import './JobMatching.css';

const MAX_FILE_MB = 10;

// ── Circular SVG score ring ───────────────────────────────────────────────────

const RADIUS       = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const scoreColor = (n) =>
    n >= 75 ? '#10b981' :
    n >= 50 ? '#f59e0b' : '#ef4444';

const scoreLabel = (n) =>
    n >= 75 ? 'Strong Match'  :
    n >= 50 ? 'Good Match'    :
    n >= 35 ? 'Partial Match' : 'Weak Match';

const ScoreRing = ({ score }) => {
    const n      = Math.round(Math.min(Math.max(score, 0), 100));
    const offset = CIRCUMFERENCE * (1 - n / 100);
    const color  = scoreColor(n);

    return (
        <div className="jm-score-ring-wrap">
            <div className="jm-score-ring-container">
                <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
                    {/* Track */}
                    <circle
                        cx="70" cy="70" r={RADIUS}
                        fill="none"
                        stroke="rgba(255,255,255,0.07)"
                        strokeWidth="11"
                    />
                    {/* Progress arc */}
                    <circle
                        cx="70" cy="70" r={RADIUS}
                        fill="none"
                        stroke={color}
                        strokeWidth="11"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={offset}
                        transform="rotate(-90 70 70)"
                        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1), stroke .4s' }}
                    />
                </svg>
                <div className="jm-score-ring-inner">
                    <span className="jm-score-number" style={{ color }}>{n}</span>
                    <span className="jm-score-pct" style={{ color }}>%</span>
                </div>
            </div>
            <p className="jm-score-label" style={{ color }}>{scoreLabel(n)}</p>
        </div>
    );
};

// ── Tag component ─────────────────────────────────────────────────────────────

const TagList = ({ items, variant }) =>
    items?.length > 0 ? (
        <div className="jm-tags">
            {items.map((s, i) => (
                <span key={i} className={`jm-tag jm-tag--${variant}`}>{s}</span>
            ))}
        </div>
    ) : null;

// ── Main page ─────────────────────────────────────────────────────────────────

const JobMatching = () => {
    const { dir } = useLanguage();
    const fileInputRef = useRef(null);

    const [file,     setFile]     = useState(null);
    const [jobTitle, setJobTitle] = useFormCache('jm_jobTitle');
    const [jobDesc,  setJobDesc]  = useFormCache('jm_jobDesc');
    const [loading,  setLoading]  = useState(false);
    const [result,   setResult]   = useState(null);
    const [error,    setError]    = useState('');

    // ── File handling ─────────────────────────────────────────────────────────

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        e.target.value = '';
        if (!selected) return;

        const isPdf = selected.name.toLowerCase().endsWith('.pdf')
                   || selected.type === 'application/pdf';
        if (!isPdf) {
            setError('Please upload a PDF file.');
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

    const clearFile = () => { setFile(null); setResult(null); setError(''); };

    // ── Analysis ──────────────────────────────────────────────────────────────

    const handleAnalyze = async () => {
        if (!file)                          { setError('Please upload your CV (PDF).'); return; }
        if (!jobTitle.trim())               { setError('Please enter a job title.'); return; }
        if (!jobDesc.trim())                { setError('Please enter a job description.'); return; }
        if (jobDesc.trim().length < 20)     { setError('Job description is too short (min 20 characters).'); return; }

        setError('');
        setResult(null);
        setLoading(true);

        try {
            const data = await api.matchCvToJob(file, jobTitle.trim(), jobDesc.trim());
            setResult(data);
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('quota') || msg.includes('429'))
                setError('Analysis quota exceeded. Please try again later.');
            else if (msg.includes('timed out') || msg.includes('408'))
                setError('Analysis timed out. Please try again.');
            else if (msg.includes('scanned') || msg.includes('image'))
                setError('This PDF appears to be scanned. Please use a text-based PDF.');
            else
                setError(msg || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = !!(file && jobTitle.trim() && jobDesc.trim() && !loading);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="jm-page" dir={dir}>

            {/* ── Header ── */}
            <div className="jm-header">
                <div className="jm-header-icon">
                    <Brain size={26} />
                </div>
                <div>
                    <h1 className="jm-title">AI Job Matching Engine</h1>
                    <p className="jm-subtitle">
                        Upload a CV and describe the role — AI analyzes both together using
                        semantic understanding and synonym-aware skill matching.
                    </p>
                </div>
            </div>

            {/* ── Input card ── */}
            <div className="jm-card jm-input-card">

                {/* Job title */}
                <div className="jm-field">
                    <label className="jm-label">
                        <Briefcase size={14} />
                        Job Title <span className="jm-required">*</span>
                    </label>
                    <input
                        className="jm-input"
                        type="text"
                        placeholder="e.g. Senior .NET Developer"
                        value={jobTitle}
                        onChange={(e) => { setJobTitle(e.target.value); setError(''); }}
                        disabled={loading}
                        maxLength={120}
                    />
                </div>

                {/* Job description */}
                <div className="jm-field">
                    <label className="jm-label">
                        <FileText size={14} />
                        Job Description <span className="jm-required">*</span>
                    </label>
                    <div className="jm-textarea-wrap">
                        <textarea
                            className="jm-textarea"
                            placeholder="Paste the full job description here — skills, responsibilities, requirements…"
                            value={jobDesc}
                            onChange={(e) => { setJobDesc(e.target.value); setError(''); }}
                            disabled={loading}
                            rows={6}
                        />
                        {jobDesc && (
                            <span className="jm-char-count">{jobDesc.length} chars</span>
                        )}
                    </div>
                </div>

                {/* CV upload */}
                <div className="jm-field">
                    <label className="jm-label">
                        <Upload size={14} />
                        Candidate CV <span className="jm-required">*</span>
                    </label>
                    <div
                        className={`jm-dropzone${file ? ' jm-dropzone--has-file' : ''}${loading ? ' jm-dropzone--disabled' : ''}`}
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
                            <div className="jm-file-info">
                                <FileText size={28} className="jm-icon-blue" />
                                <div className="jm-file-details">
                                    <span className="jm-file-name">{file.name}</span>
                                    <span className="jm-file-size">
                                        {(file.size / 1024).toFixed(0)} KB
                                    </span>
                                </div>
                                <button
                                    className="jm-remove-btn"
                                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                    disabled={loading}
                                    aria-label="Remove file"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="jm-dropzone-empty">
                                <Upload size={34} className="jm-upload-icon" />
                                <p className="jm-dropzone-title">Click to upload or drag &amp; drop</p>
                                <p className="jm-dropzone-hint">PDF only · Max 10 MB</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="jm-error" role="alert">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Submit */}
                <div className="jm-actions">
                    <button
                        className="jm-btn-analyze"
                        onClick={handleAnalyze}
                        disabled={!canSubmit}
                    >
                        {loading
                            ? <><Loader2 size={18} className="jm-spin" /><span>Analyzing…</span></>
                            : <><Zap size={18} /><span>Analyze Match</span></>
                        }
                    </button>
                </div>
            </div>

            {/* ── Results ── */}
            {result && (
                <div className="jm-results">

                    <div className="jm-results-banner">
                        <Zap size={15} />
                        <span>Match results for <strong>{jobTitle}</strong></span>
                    </div>

                    <div className="jm-results-grid">

                        {/* Score */}
                        <div className="jm-card jm-result-card jm-score-card">
                            <div className="jm-result-card-header">
                                <Zap size={15} className="jm-icon-purple" />
                                <h3>Match Score</h3>
                            </div>
                            <ScoreRing score={result.matchScore ?? 0} />
                        </div>

                        {/* Summary */}
                        {result.summary && (
                            <div className="jm-card jm-result-card jm-summary-card">
                                <div className="jm-result-card-header">
                                    <MessageSquare size={15} className="jm-icon-purple" />
                                    <h3>AI Summary</h3>
                                </div>
                                <p className="jm-summary-text">{result.summary}</p>
                            </div>
                        )}

                        {/* Matched skills */}
                        <div className="jm-card jm-result-card">
                            <div className="jm-result-card-header">
                                <CheckCircle size={15} className="jm-icon-green" />
                                <h3>Matched Skills</h3>
                            </div>
                            {result.matchedSkills?.length > 0
                                ? <TagList items={result.matchedSkills} variant="matched" />
                                : <p className="jm-empty-note">No matched skills detected.</p>
                            }
                        </div>

                        {/* Missing skills */}
                        <div className="jm-card jm-result-card">
                            <div className="jm-result-card-header">
                                <XCircle size={15} className="jm-icon-red" />
                                <h3>Missing Skills</h3>
                            </div>
                            {result.missingSkills?.length > 0
                                ? <TagList items={result.missingSkills} variant="missing" />
                                : <p className="jm-empty-note">✅ No major skill gaps detected.</p>
                            }
                        </div>

                        {/* Keyword gaps */}
                        {result.keywordGaps?.length > 0 && (
                            <div className="jm-card jm-result-card">
                                <div className="jm-result-card-header">
                                    <AlertTriangle size={15} className="jm-icon-orange" />
                                    <h3>Keyword Gaps</h3>
                                </div>
                                <TagList items={result.keywordGaps} variant="gap" />
                            </div>
                        )}

                        {/* Weak sections */}
                        {result.weakSections?.length > 0 && (
                            <div className="jm-card jm-result-card">
                                <div className="jm-result-card-header">
                                    <TrendingUp size={15} className="jm-icon-orange" />
                                    <h3>Weak Sections</h3>
                                </div>
                                <ul className="jm-list">
                                    {result.weakSections.map((s, i) => (
                                        <li key={i} className="jm-list-item">{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Improvement suggestions — full width */}
                        {result.improvementSuggestions?.length > 0 && (
                            <div className="jm-card jm-result-card jm-full-width">
                                <div className="jm-result-card-header">
                                    <Lightbulb size={15} className="jm-icon-yellow" />
                                    <h3>Improvement Suggestions</h3>
                                </div>
                                <ol className="jm-suggestions">
                                    {result.improvementSuggestions.map((s, i) => (
                                        <li key={i} className="jm-suggestion-item">
                                            <span className="jm-suggestion-num">{i + 1}</span>
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default JobMatching;
