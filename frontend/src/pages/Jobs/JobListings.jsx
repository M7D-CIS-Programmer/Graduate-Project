import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    MapPin,
    Filter,
    ChevronRight,
    Building,
    DollarSign,
    Clock,
    Briefcase,
    Bookmark,
    X,
    CheckCircle,
    XCircle,
    Eye,
    MessageSquare,
    Calendar,
    Trash2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { useCategories } from '../../hooks/useCategories';
import { useDebounce } from '../../hooks/useDebounce';
import { useSavedJobs, useSaveJob, useUnsaveJob } from '../../hooks/useSavedJobs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApplications } from '../../hooks/useApplications';
import { formatFriendlyDate } from '../../utils/dateUtils';
import Button from '../../components/ui/Button';
import './Jobs.css';

const formatSalary = (min, max, negotiable) => {
    if (negotiable) return 'Negotiable';
    if (!min && !max) return null;
    const fmt = (n) => `$${Number(n).toLocaleString()}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
};

const JobListings = () => {
    const { t, dir, language } = useLanguage();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const { addToast } = useToast();

    // Tab State
    const [activeTab, setActiveTab] = useState('explore'); // explore, saved, applications

    // Helper to get initial state from URL or localStorage
    const getInitial = (key, urlParam, defaultValue = '') => {
        const fromUrl = searchParams.get(urlParam);
        if (fromUrl !== null) return fromUrl;
        return localStorage.getItem(`job_filter_${key}`) || defaultValue;
    };

    const getInitialArray = (key, urlParam) => {
        const fromUrl = searchParams.get(urlParam);
        if (fromUrl !== null) return fromUrl.split(',').filter(Boolean);
        const fromStorage = localStorage.getItem(`job_filter_${key}`);
        return fromStorage ? fromStorage.split(',').filter(Boolean) : [];
    };

    // Initialize search state
    const [searchQuery, setSearchQuery] = useState(() => getInitial('q', 'q'));
    const [selectedTypes, setSelectedTypes] = useState(() => getInitialArray('types', 'types'));
    const [selectedWorkModes, setSelectedWorkModes] = useState(() => getInitialArray('modes', 'modes'));
    const [selectedSalaries, setSelectedSalaries] = useState(() => getInitialArray('salaries', 'salaries'));
    const [selectedCategory, setSelectedCategory] = useState(() => getInitial('category', 'category'));

    const debouncedQuery = useDebounce(searchQuery, 400);
    const { data: categories = [] } = useCategories();

    // Sync state to URL and localStorage
    useEffect(() => {
        if (activeTab !== 'explore') return;
        const params = new URLSearchParams();
        if (debouncedQuery) params.set('q', debouncedQuery);
        if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
        if (selectedWorkModes.length > 0) params.set('modes', selectedWorkModes.join(','));
        if (selectedSalaries.length > 0) params.set('salaries', selectedSalaries.join(','));
        if (selectedCategory) params.set('category', selectedCategory);
        
        setSearchParams(params, { replace: true });

        localStorage.setItem('job_filter_q', debouncedQuery);
        localStorage.setItem('job_filter_types', selectedTypes.join(','));
        localStorage.setItem('job_filter_modes', selectedWorkModes.join(','));
        localStorage.setItem('job_filter_salaries', selectedSalaries.join(','));
        localStorage.setItem('job_filter_category', selectedCategory);
    }, [debouncedQuery, selectedTypes, selectedWorkModes, selectedSalaries, selectedCategory, setSearchParams, activeTab]);

    // Data Hooks
    const { data: jobs = [], isLoading: jobsLoading } = useJobs({
        type: selectedTypes.join(','),
        workMode: selectedWorkModes.join(','),
        q: debouncedQuery,
        categoryId: selectedCategory
    });

    const { data: savedJobs = [], isLoading: savedLoading } = useSavedJobs();
    const { data: allApplications = [], isLoading: appsLoading } = useApplications();
    const { mutate: saveJob } = useSaveJob();
    const { mutate: unsaveJob } = useUnsaveJob();

    // Applications Logic
    const applications = useMemo(() => {
        return [...allApplications]
            .filter(app => !user?.id || app.userId === user.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [allApplications, user?.id]);

    const isSaved = (jobId) => savedJobs.some(s => s.jobId === jobId);
    const getSavedId = (jobId) => savedJobs.find(s => s.jobId === jobId)?.id;

    const handleSaveToggle = (e, job) => {
        e.stopPropagation();
        if (!user) {
            addToast(t('signInToApply') || 'Please sign in to save jobs', 'error');
            return;
        }

        if (isSaved(job.id)) {
            unsaveJob(getSavedId(job.id), {
                onSuccess: () => addToast(t('removedFromSaved') || 'Job removed from saved', 'info')
            });
        } else {
            saveJob(job.id, {
                onSuccess: () => addToast(t('jobSaved') || 'Job saved successfully', 'success')
            });
        }
    };

    const getStatusKey = (status) => {
        if (!status) return 'pending';
        const s = status.toLowerCase().replace(/\s+/g, '');
        if (s === 'interviewscheduled') return 'interviewScheduled';
        return s;
    };

    const getStatusIcon = (status) => {
        const key = getStatusKey(status);
        switch (key) {
            case 'interviewScheduled':
            case 'hired':
            case 'accepted':
                return <CheckCircle size={16} />;
            case 'rejected':
                return <XCircle size={16} />;
            case 'reviewing':
                return <Clock size={16} />;
            default:
                return <Briefcase size={16} />;
        }
    };

    const getStatusClass = (status) => {
        const key = getStatusKey(status);
        switch (key) {
            case 'interviewScheduled':
            case 'hired':
            case 'accepted':
                return 'hired';
            case 'rejected':
                return 'rejected';
            case 'reviewing':
                return 'reviewing';
            default:
                return 'pending';
        }
    };

    const salaryRanges = [
        { label: '$50k - $80k', min: 50000, max: 80000 },
        { label: '$80k - $120k', min: 80000, max: 120000 },
        { label: '$120k+', min: 120000, max: Infinity },
    ];

    const filteredJobs = jobs.filter(job => {
        if (selectedSalaries.length > 0) {
            return selectedSalaries.some(label => {
                const range = salaryRanges.find(r => r.label === label);
                if (!range) return false;
                const salary = job.salaryMin ?? 0;
                return salary >= range.min && salary < range.max;
            });
        }
        return true;
    }).sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedTypes([]);
        setSelectedWorkModes([]);
        setSelectedSalaries([]);
        setSelectedCategory('');
    };

    return (
        <div className="jobs-page-container" dir={dir}>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                    <h1 className="dashboard-title">{t('findJobs')}</h1>
                </div>

                {user?.role === 'Job Seeker' && (
                    <div className="jobs-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
                            onClick={() => setActiveTab('explore')}
                        >
                            <Search size={18} />
                            {t('explore') || 'Explore'}
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                            onClick={() => setActiveTab('saved')}
                        >
                            <Bookmark size={18} />
                            {t('savedJobs')}
                            {savedJobs.length > 0 && <span className="tab-count">{savedJobs.length}</span>}
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('applications')}
                        >
                            <Briefcase size={18} />
                            {t('myApplications')}
                            {applications.length > 0 && <span className="tab-count">{applications.length}</span>}
                        </button>
                    </div>
                )}
            </div>

            <div className="jobs-layout" style={{ gridTemplateColumns: activeTab === 'explore' ? '300px 1fr' : '1fr' }}>
                {activeTab === 'explore' && (
                    <aside className="filters-sidebar">
                        <div className="filter-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Filter size={20} className="text-primary" />
                                <h2 style={{ fontSize: '1.25rem' }}>{t('filters')}</h2>
                            </div>
                            {(searchQuery || selectedTypes.length > 0 || selectedWorkModes.length > 0 || selectedSalaries.length > 0 || selectedCategory) && (
                                <Button variant="secondary" size="sm" onClick={handleResetFilters} style={{ gap: '0.25rem', padding: '0.35rem 0.65rem' }}>
                                    <X size={14} />
                                    {t('reset') || 'Reset'}
                                </Button>
                            )}
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">{t('category') || 'Category'}</h3>
                            <select
                                className="filter-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginBottom: '1rem' }}
                            >
                                <option value="">{t('allCategories') || 'All Categories'}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">{t('jobType')}</h3>
                            <div className="filter-options">
                                {[{ label: t('fullTime'), value: 'Full Time' }, { label: t('partTime'), value: 'Part Time' }, { label: t('contract'), value: 'Contract' }].map(opt => (
                                    <label key={opt.value} className="filter-checkbox">
                                        <input type="checkbox" checked={selectedTypes.includes(opt.value)} onChange={() => setSelectedTypes(prev => prev.includes(opt.value) ? prev.filter(v => v !== opt.value) : [...prev, opt.value])} />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">{t('workMode')}</h3>
                            <div className="filter-options">
                                {[{ label: t('remote'), value: 'Remote' }, { label: t('onSite'), value: 'On-site' }, { label: t('hybrid'), value: 'Hybrid' }].map(opt => (
                                    <label key={opt.value} className="filter-checkbox">
                                        <input type="checkbox" checked={selectedWorkModes.includes(opt.value)} onChange={() => setSelectedWorkModes(prev => prev.includes(opt.value) ? prev.filter(v => v !== opt.value) : [...prev, opt.value])} />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">{t('salaryRange')}</h3>
                            <div className="filter-options">
                                {salaryRanges.map(range => (
                                    <label key={range.label} className="filter-checkbox">
                                        <input type="checkbox" checked={selectedSalaries.includes(range.label)} onChange={() => setSelectedSalaries(prev => prev.includes(range.label) ? prev.filter(l => l !== range.label) : [...prev, range.label])} />
                                        <span>{range.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>
                )}

                <div className="jobs-main">
                    {activeTab === 'explore' && (
                        <div className="search-bar-container" style={{ display: 'flex', gap: '1rem', background: 'var(--bg-card)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                            <div className="search-field" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                <Search size={20} color="var(--primary)" />
                                <input
                                    type="text"
                                    placeholder={t('jobTitlePlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-color)', outline: 'none', width: '100%', paddingLeft: '10px' }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="jobs-content-area">
                        {activeTab === 'explore' && (
                            <div className="jobs-grid">
                                {jobsLoading ? (
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><div className="loading-spinner" /></div>
                                ) : filteredJobs.length > 0 ? filteredJobs.map(job => (
                                    <div key={job.id} className="card" onClick={() => navigate(`/jobs/${job.id}`)} style={{ cursor: 'pointer' }}>
                                        <div className="job-card-header">
                                            <div className="company-logo-placeholder"><Building size={24} color="var(--text-muted)" /></div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <button className={`btn-icon-sm ${isSaved(job.id) ? 'saved' : ''}`} onClick={(e) => handleSaveToggle(e, job)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSaved(job.id) ? 'var(--primary)' : 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', transition: 'all 0.2s' }} title={isSaved(job.id) ? t('saved') : t('saveJob')}>
                                                    <Bookmark size={20} fill={isSaved(job.id) ? 'currentColor' : 'none'} />
                                                </button>
                                                <span className="job-type-badge">{t(job.type) || job.type}</span>
                                            </div>
                                        </div>
                                        <h3 className="job-title">{t(job.title) || job.title}</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                            <div className="job-meta-item"><Building size={16} /> {job.user?.name || 'Company'}</div>
                                            <div className="job-meta-item"><MapPin size={16} /> {job.workMode || t('remote')}</div>
                                        </div>
                                        <div className="job-card-footer">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: '600' }}>{t('details')}<ChevronRight size={18} className={dir === 'rtl' ? 'rotate-180' : ''} /></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '3rem', width: '100%' }}>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('noJobsFound')}</p>
                                        <Button variant="primary" onClick={handleResetFilters} style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>{t('clearAllFilters')}</Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'saved' && (
                            <div className="jobs-grid">
                                {savedLoading ? (
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><div className="loading-spinner" /></div>
                                ) : savedJobs.length > 0 ? savedJobs.map(job => (
                                    <div key={job.id} className="card">
                                        <div className="job-card-header">
                                            <div className="company-logo-placeholder"><Building size={24} color="var(--text-muted)" /></div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <span className="job-type-badge">{job.type}</span>
                                                <button onClick={(e) => { e.stopPropagation(); unsaveJob(job.id); }} title="Remove from saved" style={{ color: '#ef4444', padding: '4px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="job-title">{job.title}</h3>
                                        <p className="job-meta">{job.company}{job.location && ` • ${job.location}`}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{job.category} • {job.workMode}</p>
                                        <div className="job-card-footer">
                                            {formatSalary(job.salaryMin, job.salaryMax, job.isSalaryNegotiable) && (
                                                <span className="job-salary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <DollarSign size={14} />
                                                    {formatSalary(job.salaryMin, job.salaryMax, job.isSalaryNegotiable)}
                                                </span>
                                            )}
                                            <Button variant="secondary" size="sm" onClick={() => navigate(`/jobs/${job.jobId}`)}>{t('details')}</Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0' }}>
                                        <Bookmark size={64} className="empty-icon" />
                                        <h3>{t('noSavedJobs')}</h3>
                                        <Button style={{ marginTop: '1.5rem' }} onClick={() => setActiveTab('explore')}>{t('findJobs')}</Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'applications' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {appsLoading ? (
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><div className="loading-spinner" /></div>
                                ) : applications.length > 0 ? applications.map(app => (
                                    <div key={app.id} className="card glass" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', borderRadius: '20px' }}>
                                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '1rem', borderRadius: '16px', height: 'fit-content' }}>
                                            <Building size={24} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{app.job?.title || 'Job Deleted'}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                        <span style={{ fontWeight: '600' }}>{app.job?.user?.name || 'Company'}</span>
                                                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                                                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} />{app.job?.location || t('remote')}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14} />{formatFriendlyDate(app.date, language)}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Briefcase size={14} />{app.job?.type || t('fullTime')}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                                    <span className={`status-badge ${getStatusClass(app.candidateStatus)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' }}>
                                                        {getStatusIcon(app.candidateStatus)}
                                                        {t(getStatusKey(app.candidateStatus))}
                                                    </span>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        {app.job && <Button variant="secondary" size="sm" onClick={() => navigate(`/jobs/${app.job.id}`)}><Eye size={16} /> {t('viewJob')}</Button>}
                                                        <Button variant="outline" size="sm" onClick={() => navigate(`/messages?applicationId=${app.id}`)}><MessageSquare size={16} /></Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
                                        <Briefcase size={64} className="empty-icon" />
                                        <h3>{t('noAppliedJobsYet')}</h3>
                                        <Button style={{ marginTop: '1.5rem' }} onClick={() => setActiveTab('explore')}>{t('exploreJobs')}</Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobListings;
