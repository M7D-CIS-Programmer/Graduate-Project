import React, { useState, useEffect } from 'react';
import {
    Search,
    MapPin,
    Filter,
    ChevronRight,
    Users,
    Mail,
    Download,
    Eye,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useLocation, useNavigate } from 'react-router-dom';
import '../pages/Jobs/Jobs.css';
import { useApplications, useUpdateApplicationStatus } from '../hooks/useApplications';

const Candidates = () => {
    const { t, dir } = useLanguage();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();


    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const { data: applications = [], isLoading, error } = useApplications();
    const { mutate: updateApplicationStatus } = useUpdateApplicationStatus();
    const [selectedFilters, setSelectedFilters] = useState({
        type: [],
        experience: []
    });


    useEffect(() => {
        setSearchQuery(queryParams.get('q') || '');
    }, [location.search]);

    const handleAction = (e, actionType, application) => {
        e.stopPropagation();

        if (actionType === 'download') {
            navigate(`/resume/${application.userId}`);
        } else if (actionType === 'message') {
            addToast(t('messageSent') || 'Message Sent to Candidate', 'success');
        } else if (actionType === 'accept' || actionType === 'reject') {
            const updatedStatus = actionType === 'accept' ? 'Hired' : 'Rejected';
            updateApplicationStatus({ id: application.id, status: updatedStatus }, {
                onSuccess: () => {
                    addToast(
                        t(actionType === 'accept' ? 'candidateAccepted' : 'candidateRejected'),
                        'success'
                    );
                },
                onError: () => {
                    addToast('Failed to update status', 'error');
                }
            });
        }
    };

    const filterCategories = [
        { id: 'type', title: t('jobType'), options: [t('fullTime'), t('partTime'), t('contract'), t('remote')] },
        { id: 'experience', title: t('experience'), options: ['1-3 Years', '3-5 Years', '5+ Years'] },
    ];

    const handleFilterChange = (categoryId, option) => {
        setSelectedFilters(prev => {
            const currentSelected = prev[categoryId];
            const isSelected = currentSelected.includes(option);

            return {
                ...prev,
                [categoryId]: isSelected
                    ? currentSelected.filter(item => item !== option)
                    : [...currentSelected, option]
            };
        });
    };

    const filteredCandidates = applications.filter(app => {
        const candidateName = app.user?.name || 'Candidate';
        const jobTitle = app.job?.title || '';

        let matchesSearch = true;
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            matchesSearch = jobTitle.toLowerCase().includes(lowerQuery) ||
                candidateName.toLowerCase().includes(lowerQuery);
        }

        let matchesType = true;
        if (selectedFilters.type.length > 0) {
            matchesType = selectedFilters.type.includes(app.job?.type);
        }

        return matchesSearch && matchesType;
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/candidates?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/candidates');
        }
    };

    return (
        <div className="jobs-page-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">{t('candidates')}</h1>
            </div>

            <div className="jobs-layout">
                <aside className="filters-sidebar">
                    <div className="filter-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <Filter size={20} className="text-primary" />
                        <h2 style={{ fontSize: '1.25rem' }}>{t('filters')}</h2>
                    </div>

                    {filterCategories.map(cat => (
                        <div key={cat.id} className="filter-section">
                            <h3 className="filter-title">{cat.title}</h3>
                            <div className="filter-options">
                                {cat.options.map((opt, i) => (
                                    <label key={i} className="filter-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedFilters[cat.id].includes(opt)}
                                            onChange={() => handleFilterChange(cat.id, opt)}
                                        />
                                        <span>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </aside>

                <div className="jobs-main">
                    <form className="search-bar-container" onSubmit={handleSearch} style={{
                        display: 'flex',
                        gap: '1rem',
                        background: 'var(--bg-card)',
                        padding: '1rem',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        marginBottom: '2rem'
                    }}>
                        <div className="search-field" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                            <Search size={20} color="var(--primary)" />
                            <input
                                type="text"
                                placeholder={t('candidatePlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%', paddingLeft: '10px' }}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ height: '44px' }}>{t('search')}</button>
                    </form>

                    <div className="jobs-grid">
                        {filteredCandidates.length > 0 ? filteredCandidates.map(app => (
                    <div key={app.id} className="card" onClick={() => navigate(`/profile/${app.userId}`)} style={{ cursor: 'pointer' }}>
                                <div className="job-card-header">
                                    <div className="company-logo-placeholder" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                                        <Users size={24} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {app.candidateStatus && app.candidateStatus !== 'New' && (
                                            <span className={`job-type-badge ${app.candidateStatus === 'Hired' ? 'success' : app.candidateStatus === 'Rejected' ? 'danger' : ''}`} style={{ 
                                                backgroundColor: app.candidateStatus === 'Hired' ? 'rgba(16, 185, 129, 0.1)' : app.candidateStatus === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : '',
                                                color: app.candidateStatus === 'Hired' ? '#10b981' : app.candidateStatus === 'Rejected' ? '#ef4444' : ''
                                            }}>
                                                {t(app.candidateStatus?.toLowerCase()) || app.candidateStatus}
                                            </span>
                                        )}
                                        <span className="job-type-badge">
                                            {app.job?.type || ''}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="job-title">{app.job?.title || 'Job Deleted'}</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                    <div className="job-meta-item"><Users size={16} /> {app.user?.name || 'Candidate'}</div>
                                    <div className="job-meta-item"><MapPin size={16} /> {app.job?.workMode || 'Remote'}</div>
                                </div>
                                <div className="job-card-footer" style={{ 
                                    borderTop: '1px solid var(--border-color)', 
                                    paddingTop: '1rem', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    flexWrap: 'wrap', 
                                    gap: '1rem' 
                                }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button className="btn-candidate-action" onClick={(e) => handleAction(e, 'download', app)}>
                                            <Download size={16} />
                                            <span>{t('downloadCV') || 'CV'}</span>
                                        </button>
                                        <button className="btn-candidate-action" onClick={(e) => handleAction(e, 'message', app)}>
                                            <Mail size={16} />
                                            <span>{t('sendMessage') || 'Message'}</span>
                                        </button>
                                        <button className="btn-candidate-action success" onClick={(e) => handleAction(e, 'accept', app)}>
                                            <CheckCircle size={16} />
                                            <span>{t('accept') || 'Accept'}</span>
                                        </button>
                                        <button className="btn-candidate-action danger" onClick={(e) => handleAction(e, 'reject', app)}>
                                            <XCircle size={16} />
                                            <span>{t('reject') || 'Reject'}</span>
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: '600' }}>
                                        {t('viewProfile')}
                                        <ChevronRight size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '3rem', width: '100%' }}>
                                <p style={{ color: 'var(--text-muted)' }}>No candidates found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Candidates;
