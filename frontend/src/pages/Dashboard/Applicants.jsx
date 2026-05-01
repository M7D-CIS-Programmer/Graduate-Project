import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationsByCompany, useUpdateApplicationStatus } from '../../hooks/useApplications';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMyJobs } from '../../hooks/useJobs';
import { useCategories } from '../../hooks/useCategories';
import { api, getImageUrl } from '../../api/api';
import {
    Users, Search, Eye, CheckCircle, XCircle, Clock,
    Mail, Download, Brain, Sparkles, Trophy, Target,
    TrendingUp, AlertCircle, ChevronDown, Loader2,
    BarChart3, Filter, RefreshCw, MessageSquare
} from 'lucide-react';
import './Dashboard.css';
import { formatFriendlyDate } from '../../utils/dateUtils';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_COUNT_OPTIONS = [5, 10, 15];

// ── Helpers ───────────────────────────────────────────────────────────────────

const getStatusColor = (status) => {
    switch (status) {
        case 'New':
        case 'Applied':     return '#6366f1';
        case 'Reviewing':   return '#f59e0b';
        case 'Shortlisted':
        case 'Accepted':
        case 'Hired':       return '#10b981';
        case 'Rejected':    return '#ef4444';
        default:            return '#94a3b8';
    }
};

const getRecommendation = (score) => {
    if (score >= 75) return { label: 'Strong Hire', color: '#10b981', bg: 'rgba(16,185,129,.15)', icon: '🏆' };
    if (score >= 55) return { label: 'Hire',        color: '#06b6d4', bg: 'rgba(6,182,212,.15)',  icon: '✅' };
    if (score >= 35) return { label: 'Consider',    color: '#f59e0b', bg: 'rgba(245,158,11,.15)', icon: '🤔' };
    return              { label: 'Low Match',    color: '#ef4444', bg: 'rgba(239,68,68,.15)',   icon: '⚠️' };
};

const buildCvText = (resume) => {
    if (!resume) return '';
    const parts = [];

    if (resume.summary) parts.push(resume.summary);

    const skills = resume.skills || [];
    if (skills.length) {
        const names = skills.map(s => (typeof s === 'string' ? s : s.name || s.skillName || '')).filter(Boolean);
        if (names.length) parts.push(`Skills: ${names.join(', ')}`);
    }

    const experiences = resume.experiences || resume.experience || [];
    experiences.forEach(exp => {
        const title   = exp.jobTitle   || exp.title    || '';
        const company = exp.company    || exp.employer || '';
        const desc    = exp.description || exp.responsibilities || '';
        if (title) parts.push(`${title}${company ? ` at ${company}` : ''}: ${desc}`);
    });

    const educations = resume.educations || resume.education || [];
    educations.forEach(edu => {
        const degree = edu.degree      || '';
        const inst   = edu.institution || edu.school || '';
        if (degree) parts.push(`${degree}${inst ? ` - ${inst}` : ''}`);
    });

    return parts.join('\n').trim();
};

// ── Sub-components ────────────────────────────────────────────────────────────

const ScoreBar = ({ score }) => {
    const rec = getRecommendation(score);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 130 }}>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${score}%`, height: '100%', background: rec.color, borderRadius: 99, transition: 'width .8s ease' }} />
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: rec.color, minWidth: 36 }}>{score}%</span>
        </div>
    );
};

const SummaryCard = ({ icon, label, value, color }) => (
    <div className="stat-card glass" style={{ padding: '1.25rem 1.5rem', gap: '1rem', borderRadius: 16 }}>
        <div className="stat-icon" style={{ background: `${color}20`, color, width: 48, height: 48, borderRadius: 12, fontSize: '1.2rem' }}>
            {icon}
        </div>
        <div className="stat-details">
            <h3 style={{ fontSize: '1.75rem', marginBottom: '0.1rem' }}>{value}</h3>
            <p style={{ fontSize: '0.78rem' }}>{label}</p>
        </div>
    </div>
);

const FilterSelect = ({ value, onChange, options }) => (
    <div style={{ position: 'relative' }}>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                appearance: 'none',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                padding: '0.5rem 2.2rem 0.5rem 0.85rem',
                borderRadius: 10,
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
            }}
        >
            {options.map(opt => (
                <option key={opt} value={opt} style={{ background: 'var(--bg-card)' }}>{opt}</option>
            ))}
        </select>
        <ChevronDown size={14} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const Applicants = () => {
    const { t, dir, language } = useLanguage();
    const navigate             = useNavigate();
    const { addToast }         = useToast();
    const { user }             = useAuth();

    // Data hooks
    const { data: applications = [], isLoading } = useApplicationsByCompany(user?.id);
    const { data: myJobs = [] }                  = useMyJobs(user?.id);
    const { data: dbCategories = [] }            = useCategories();
    const { mutate: updateStatus }               = useUpdateApplicationStatus();

    // Category names from DB (used in both dropdowns)
    const categoryNames = useMemo(() => dbCategories.map(c => c.name).filter(Boolean), [dbCategories]);

    // Table filters
    const [searchTerm,     setSearchTerm]    = useState('');
    const [statusFilter,   setStatusFilter]  = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Report form
    const [reportJobTitle, setReportJobTitle] = useState('');
    const [reportCategory, setReportCategory] = useState('');
    const [reportJobDesc,  setReportJobDesc]  = useState('');
    const [reportTopCount, setReportTopCount] = useState(10);

    // Report state
    const [isGenerating,   setIsGenerating]   = useState(false);
    const [generatingStep, setGeneratingStep] = useState('');
    const [reportResults,  setReportResults]  = useState(null);
    const [reportError,    setReportError]    = useState('');

    // ── Computed ───────────────────────────────────────────────────────────────

    const myJobIds = useMemo(() => new Set(myJobs.map(j => j.id)), [myJobs]);

    const jobCategoryMap = useMemo(() => {
        const map = new Map();
        myJobs.forEach(j => map.set(j.id, j.category?.name || 'General'));
        return map;
    }, [myJobs]);

    const getCategory = useCallback((app) =>
        app.job?.category?.name || jobCategoryMap.get(app.jobId) || 'General',
        [jobCategoryMap]);

    const employerApplications = useMemo(() =>
        applications.filter(app => myJobIds.size === 0 || myJobIds.has(app.jobId)),
        [applications, myJobIds]);

    // Categories shown in the table filter — seeded from DB, narrowed to ones with applicants
    const availableCategories = useMemo(() => {
        const usedCats = new Set(employerApplications.map(a => getCategory(a)).filter(Boolean));
        const ordered = categoryNames.length > 0
            ? categoryNames.filter(n => usedCats.has(n))
            : Array.from(usedCats).sort();
        return ['All', ...ordered];
    }, [employerApplications, getCategory, categoryNames]);

    // Table rows (search + category + status)
    const tableApplicants = useMemo(() => {
        return employerApplications.filter(app => {
            const name = (app.user?.name || '').toLowerCase();
            const role = (app.job?.title || '').toLowerCase();
            const q    = searchTerm.toLowerCase();
            if (q && !name.includes(q) && !role.includes(q)) return false;

            if (categoryFilter !== 'All' && getCategory(app) !== categoryFilter) return false;

            let status = app.candidateStatus || 'New';
            if (status === 'Applied')  status = 'New';
            if (status === 'Accepted') status = 'Shortlisted';
            if (statusFilter !== 'All' && status !== statusFilter) return false;

            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [employerApplications, searchTerm, categoryFilter, statusFilter, getCategory]);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleAction = (action, app) => {
        if (action === 'accept' || action === 'reject' || action === 'review') {
            const newStatus = action === 'accept' ? 'Shortlisted' : action === 'review' ? 'Reviewing' : 'Rejected';
            updateStatus({ id: app.id, status: newStatus }, {
                onSuccess: () => addToast(`Candidate status updated to ${newStatus}`, 'success'),
                onError:   () => addToast(`Failed to ${action} applicant.`, 'error'),
            });
        } else if (action === 'viewResume') {
            const cvUrl = getImageUrl(app.cv);
            if (cvUrl) {
                window.open(cvUrl, '_blank', 'noopener,noreferrer');
            } else {
                // No uploaded PDF — fall back to the structured resume page
                navigate(`/resume/${app.userId}`);
            }
        } else if (action === 'viewProfile') navigate(`/candidate/${app.userId}`);
    };

    const handleGenerateReport = async () => {
        if (!reportCategory)                  { addToast('Please select a category.', 'error'); return; }
        if (!reportJobTitle.trim())           { addToast('Please enter a job title.', 'error'); return; }
        if (reportJobDesc.trim().length < 20) { addToast('Job description is too short (min 20 chars).', 'error'); return; }

        setIsGenerating(true);
        setReportResults(null);
        setReportError('');

        try {
            setGeneratingStep('Filtering candidates by category…');
            const catApps = employerApplications.filter(app => getCategory(app) === reportCategory);

            if (catApps.length === 0) {
                setReportError(`No applicants found in the "${reportCategory}" category.`);
                return;
            }

            setGeneratingStep(`Fetching resume data for ${catApps.length} candidate${catApps.length > 1 ? 's' : ''}…`);
            const resumeSettled = await Promise.allSettled(
                catApps.map(app => api.getResumeByUserId(app.userId, user.id))
            );

            setGeneratingStep('Running AI match analysis…');
            const scoreSettled = await Promise.allSettled(
                catApps.map(async (app, i) => {
                    const resume = resumeSettled[i].status === 'fulfilled' ? resumeSettled[i].value : null;
                    const cvText = buildCvText(resume);

                    if (!cvText || cvText.length < 10) {
                        return { app, score: 0, matchedSkills: [], missingSkills: [], hasResume: false };
                    }

                    try {
                        const result = await api.getMatchScore(cvText, reportJobTitle, reportJobDesc);
                        return {
                            app,
                            score:         Math.round(result.matchPercentage ?? result.score ?? 0),
                            matchedSkills: result.matchedSkills || [],
                            missingSkills: result.missingSkills || [],
                            hasResume:     true,
                        };
                    } catch {
                        return { app, score: 0, matchedSkills: [], missingSkills: [], hasResume: false };
                    }
                })
            );

            setGeneratingStep('Ranking candidates…');
            const valid = scoreSettled
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value);

            const ranked = [...valid]
                .sort((a, b) => b.score - a.score)
                .slice(0, reportTopCount)
                .map((r, idx) => ({ ...r, rank: idx + 1 }));

            setReportResults({
                ranked,
                totalInCategory:  catApps.length,
                analyzed:         valid.length,
                topScore:         valid.length ? Math.max(...valid.map(r => r.score)) : 0,
                recommendedCount: valid.filter(r => r.score >= 55).length,
                category:         reportCategory,
                jobTitle:         reportJobTitle,
            });

        } catch {
            setReportError('Failed to generate report. Please try again.');
        } finally {
            setIsGenerating(false);
            setGeneratingStep('');
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="dashboard-container" dir={dir}>

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Brain size={28} style={{ color: 'var(--primary)' }} />
                        {t('allApplicants')}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                        Manage applicants, filter by category, and generate AI hiring recommendations.
                    </p>
                </div>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: 12, gap: '0.5rem' }}>
                    <Search size={16} style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder={t('search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: 180 }}
                    />
                </div>
            </div>

            {/* ── AI Hiring Report Form ────────────────────────────────────── */}
            <div className="dashboard-section" style={{ border: '1px solid rgba(99,102,241,.25)', background: 'linear-gradient(135deg, rgba(99,102,241,.06) 0%, var(--bg-card) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>AI Hiring Report</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                            Filter by category and generate ranked candidate recommendations
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 180px', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Job Title */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                            Job Title <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Senior React Developer"
                            value={reportJobTitle}
                            onChange={(e) => setReportJobTitle(e.target.value)}
                            disabled={isGenerating}
                            maxLength={120}
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                color: 'var(--text-main)', padding: '0.6rem 0.85rem',
                                borderRadius: 10, fontSize: '0.875rem', outline: 'none',
                                opacity: isGenerating ? 0.6 : 1,
                            }}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                            Category <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={reportCategory}
                                onChange={(e) => setReportCategory(e.target.value)}
                                disabled={isGenerating}
                                style={{
                                    width: '100%', boxSizing: 'border-box', appearance: 'none',
                                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                    color: reportCategory ? 'var(--text-main)' : 'var(--text-muted)',
                                    padding: '0.6rem 2.2rem 0.6rem 0.85rem',
                                    borderRadius: 10, fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
                                    opacity: isGenerating ? 0.6 : 1,
                                }}
                            >
                                <option value="">Select category…</option>
                                {categoryNames.map(name => (
                                    <option key={name} value={name} style={{ background: 'var(--bg-card)' }}>{name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        </div>
                    </div>

                    {/* Top count */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                            Top Candidates
                        </label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={reportTopCount}
                                onChange={(e) => setReportTopCount(Number(e.target.value))}
                                disabled={isGenerating}
                                style={{
                                    width: '100%', appearance: 'none',
                                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                    color: 'var(--text-main)', padding: '0.6rem 2.2rem 0.6rem 0.85rem',
                                    borderRadius: 10, fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
                                    opacity: isGenerating ? 0.6 : 1,
                                }}
                            >
                                {TOP_COUNT_OPTIONS.map(n => (
                                    <option key={n} value={n} style={{ background: 'var(--bg-card)' }}>Top {n}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        </div>
                    </div>
                </div>

                {/* Job Description */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                        Job Description <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            placeholder="Paste the full job description here to enable AI matching…"
                            value={reportJobDesc}
                            onChange={(e) => setReportJobDesc(e.target.value)}
                            disabled={isGenerating}
                            rows={4}
                            style={{
                                width: '100%', boxSizing: 'border-box', resize: 'vertical',
                                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                color: 'var(--text-main)', padding: '0.65rem 0.85rem',
                                borderRadius: 10, fontSize: '0.875rem', outline: 'none',
                                fontFamily: 'inherit', lineHeight: 1.6,
                                opacity: isGenerating ? 0.6 : 1,
                            }}
                        />
                        {reportJobDesc && (
                            <span style={{ position: 'absolute', bottom: '0.5rem', right: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                                {reportJobDesc.length} chars
                            </span>
                        )}
                    </div>
                </div>

                {/* Generate Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                            color: 'white', border: 'none', padding: '0.7rem 1.75rem',
                            borderRadius: 10, fontSize: '0.9rem', fontWeight: 600,
                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                            opacity: isGenerating ? 0.7 : 1,
                            boxShadow: '0 4px 16px rgba(99,102,241,.4)',
                        }}
                    >
                        {isGenerating
                            ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /><span>Generating…</span></>
                            : <><Brain size={18} /><span>Generate Hiring Report</span></>
                        }
                    </button>
                </div>

                {isGenerating && generatingStep && (
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.75rem 1rem', background: 'rgba(99,102,241,.08)', borderRadius: 10 }}>
                        <Loader2 size={15} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)', flexShrink: 0 }} />
                        {generatingStep}
                    </div>
                )}

                {reportError && !isGenerating && (
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ef4444', fontSize: '0.875rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,.08)', borderRadius: 10, border: '1px solid rgba(239,68,68,.2)' }}>
                        <AlertCircle size={16} />
                        {reportError}
                    </div>
                )}
            </div>

            {/* ── Report Results ───────────────────────────────────────────── */}
            {reportResults && !isGenerating && (
                <>
                    <div className="smart-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <SummaryCard icon={<Users size={20} />}     label="Total in Category"    value={reportResults.totalInCategory}  color="#6366f1" />
                        <SummaryCard icon={<BarChart3 size={20} />} label="Candidates Analyzed"  value={reportResults.analyzed}         color="#8b5cf6" />
                        <SummaryCard icon={<TrendingUp size={20} />} label="Top Match Score"     value={`${reportResults.topScore}%`}   color="#10b981" />
                        <SummaryCard icon={<Trophy size={20} />}    label="Recommended"          value={reportResults.recommendedCount} color="#f59e0b" />
                    </div>

                    <div className="dashboard-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 className="section-title" style={{ margin: 0 }}>
                                <Target size={20} style={{ color: 'var(--primary)' }} />
                                AI Ranking — {reportResults.jobTitle}
                                <span style={{ marginLeft: '0.6rem', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', background: 'rgba(99,102,241,.12)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>
                                    {reportResults.category}
                                </span>
                            </h2>
                            <button
                                onClick={() => { setReportResults(null); setReportError(''); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.82rem', cursor: 'pointer' }}
                            >
                                <RefreshCw size={13} /> Clear Results
                            </button>
                        </div>

                        {reportResults.ranked.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                <AlertCircle size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
                                <p style={{ fontSize: '0.95rem' }}>No highly matching candidates found.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            {['Rank', 'Candidate', 'Category', 'Match Score', 'App. Status', 'AI Recommendation', 'Action'].map(h => (
                                                <th key={h} style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportResults.ranked.map((item) => {
                                            const rec    = getRecommendation(item.score);
                                            const status = item.app.candidateStatus || 'New';
                                            return (
                                                <tr key={item.app.id}
                                                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background .15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: item.rank <= 3 ? 'rgba(99,102,241,.2)' : 'rgba(255,255,255,.05)', color: item.rank <= 3 ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                                                            {item.rank}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.app.user?.name || 'Unknown'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                                                            <Mail size={11} />{item.app.user?.email}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ fontSize: '0.8rem', background: 'rgba(99,102,241,.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>
                                                            {getCategory(item.app)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', minWidth: 160 }}>
                                                        <ScoreBar score={item.score} />
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ padding: '0.3rem 0.65rem', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600, background: `${getStatusColor(status)}20`, color: getStatusColor(status) }}>
                                                            {status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ padding: '0.3rem 0.75rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, background: rec.bg, color: rec.color, whiteSpace: 'nowrap' }}>
                                                            {rec.icon} {rec.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <button
                                                            onClick={() => navigate(`/candidate/${item.app.userId}`)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.25)', color: 'var(--primary)', padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                        >
                                                            <Eye size={14} /> View Profile
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ── All Applicants Table ─────────────────────────────────────── */}
            <div className="dashboard-section" style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h2 className="section-title" style={{ margin: 0 }}>
                        <Users size={20} style={{ color: 'var(--primary)' }} />
                        {t('recentApplicants')}
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                            ({tableApplicants.length})
                        </span>
                    </h2>

                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                            <FilterSelect
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                                options={availableCategories}
                            />
                        </div>

                        {['All', 'New', 'Reviewing', 'Shortlisted', 'Rejected'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                style={{
                                    padding: '0.38rem 0.8rem', fontSize: '0.82rem', borderRadius: 8, border: 'none',
                                    background: statusFilter === s ? 'var(--primary)' : 'rgba(255,255,255,.04)',
                                    color: statusFilter === s ? 'white' : 'var(--text-muted)',
                                    cursor: 'pointer', transition: 'all .15s',
                                    outline: statusFilter !== s ? '1px solid var(--border-color)' : 'none',
                                }}
                            >
                                {s === 'All' ? t('viewAll') : t(s.toLowerCase()) || s}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : tableApplicants.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                        <Users size={48} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
                        <p style={{ fontSize: '0.95rem' }}>
                            {categoryFilter !== 'All'
                                ? `No applicants available in the "${categoryFilter}" category.`
                                : 'No applicants match your current filters.'}
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('applicantName')}</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('appliedFor')}</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('status')}</th>
                                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableApplicants.map(app => (
                                <tr key={app.id}
                                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background .15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '1.1rem 1rem' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{app.user?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Mail size={11} /> {app.user?.email}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.1rem 1rem' }}>
                                        <div style={{ fontSize: '0.875rem' }}>{app.job?.title || 'General'}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                            {formatFriendlyDate(app.date, language)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.1rem 1rem' }}>
                                        <span style={{ fontSize: '0.78rem', background: 'rgba(99,102,241,.1)', color: 'var(--primary)', padding: '0.2rem 0.55rem', borderRadius: 6 }}>
                                            {getCategory(app)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.1rem 1rem' }}>
                                        <span style={{ padding: '0.3rem 0.65rem', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600, background: `${getStatusColor(app.candidateStatus || 'New')}20`, color: getStatusColor(app.candidateStatus || 'New') }}>
                                            {t((app.candidateStatus || 'New').toLowerCase()) || app.candidateStatus || 'New'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.1rem 1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            <button className="btn-candidate-action" onClick={() => handleAction('viewResume', app)} title={t('viewResume')}>
                                                <Download size={15} /><span>{t('viewResume') || 'Resume'}</span>
                                            </button>
                                            <button className="btn-candidate-action" onClick={() => handleAction('viewProfile', app)} title={t('viewProfile')}>
                                                <Eye size={15} /><span>{t('viewProfile') || 'Profile'}</span>
                                            </button>
                                            <button className="btn-candidate-action" onClick={() => navigate(`/messages?applicationId=${app.id}`)} title="Message candidate">
                                                <MessageSquare size={15} /><span>Message</span>
                                            </button>
                                            <button className="btn-candidate-action success" onClick={() => handleAction('accept', app)} title={t('accept')}>
                                                <CheckCircle size={15} /><span>{t('accept') || 'Accept'}</span>
                                            </button>
                                            <button className="btn-candidate-action warning" onClick={() => handleAction('review', app)} title={t('review')}>
                                                <Clock size={15} /><span>{t('review') || 'Review'}</span>
                                            </button>
                                            <button className="btn-candidate-action danger" onClick={() => handleAction('reject', app)} title={t('reject')}>
                                                <XCircle size={15} /><span>{t('reject') || 'Reject'}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Applicants;
