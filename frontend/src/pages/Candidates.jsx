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
<<<<<<< HEAD:frontend/src/pages/Candidates.jsx
import { useApplications, useUpdateApplicationStatus } from '../hooks/useApplications';
=======
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Candidates.jsx

const Candidates = () => {
    const { t, dir } = useLanguage();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

<<<<<<< HEAD:frontend/src/pages/Candidates.jsx
=======
    // Parse query string for ?q
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Candidates.jsx
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialSearch);
<<<<<<< HEAD:frontend/src/pages/Candidates.jsx
    const { data: applications = [], isLoading, error } = useApplications();
    const { mutate: updateApplicationStatus } = useUpdateApplicationStatus();

=======

    // Track selected filters
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Candidates.jsx
    const [selectedFilters, setSelectedFilters] = useState({
        type: [],
        experience: []
    });

<<<<<<< HEAD:frontend/src/pages/Candidates.jsx
=======
    // Update internal search state if URL changes
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Candidates.jsx
    useEffect(() => {
        setSearchQuery(queryParams.get('q') || '');
    }, [location.search]);

<<<<<<< HEAD:frontend/src/pages/Candidates.jsx
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
=======
    const mockCandidates = [
        { id: 1, title: t('seniorReactDev'), name: 'Alia Hassan', location: 'Amman', type: t('fullTime'), time: '2 days ago' },
        { id: 2, title: t('uiuxDesigner'), name: 'Yousef Ali', location: 'Irbid', type: t('partTime'), time: '3 days ago' },
        { id: 3, title: 'Backend Developer (Node.js)', name: 'Ahmed', location: 'Zarqa', type: t('contract'), time: '1 week ago' },
        { id: 4, title: 'Mobile App Developer', name: 'Muna', location: 'Amman', type: t('fullTime'), time: '4 days ago' },
        { id: 5, title: 'System Architect', name: 'Omar', location: 'Irbid', type: t('fullTime'), time: '5 days ago' },
        { id: 6, title: t('marketingManager'), name: 'Layla', location: 'Zarqa', type: t('contract'), time: '1 week ago' },
    ];

    const [applications, setApplications] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('allApplications') || '[]');
        } catch(e) { return []; }
    });

    const dynamicCandidates = applications.map((app, index) => ({
        id: `dyn-can-${app.id || index}`,
        originalId: app.id,
        title: app.role,
        name: app.applicantName,
        location: app.location || t('unknownLocation') || 'Unknown',
        type: t('fullTime'), // Map as needed
        time: app.time || t('justNow') || 'Just now',
        status: app.status || t('newApplication') || 'New'
    }));

    const handleAction = (e, actionType, candidate) => {
        e.stopPropagation();
        
        if (actionType === 'download') {
            addToast(t('cvDownloaded') || 'CV Downloaded Successfully', 'success');
        } else if (actionType === 'message') {
            addToast(t('messageSent') || 'Message Sent to Candidate', 'success');
        } else if (actionType === 'accept' || actionType === 'reject') {
            if (!candidate.originalId) {
                addToast(
                    t(actionType === 'accept' ? 'candidateAccepted' : 'candidateRejected') || 
                    `Candidate ${actionType === 'accept' ? 'Accepted' : 'Rejected'}`, 
                    'success'
                );
                return;
            }
            
            const updatedStatus = actionType === 'accept' ? 'Hired' : 'Rejected';
            const updatedApps = applications.map(app => {
                if (app.id === candidate.originalId) {
                    return { ...app, status: updatedStatus };
                }
                return app;
            });
            
            localStorage.setItem('allApplications', JSON.stringify(updatedApps));
            setApplications(updatedApps);
            
            addToast(
                t(actionType === 'accept' ? 'candidateAccepted' : 'candidateRejected') || 
                `Candidate ${actionType === 'accept' ? 'Accepted' : 'Rejected'}`, 
                'success'
            );
        }
    };
    
    const combinedCandidates = [...dynamicCandidates, ...mockCandidates];
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Candidates.jsx

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

<<<<<<< HEAD:frontend/src/pages/Candidates.jsx
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
=======
    const filteredCandidates = combinedCandidates.filter(candidate => {
        // 1. Search Filter
        let matchesSearch = true;
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            matchesSearch = candidate.title.toLowerCase().includes(lowerQuery) ||
                candidate.name.toLowerCase().includes(lowerQuery);
        }

        // 2. Type Filter
        let matchesType = true;
        if (selectedFilters.type.length > 0) {
            matchesType = selectedFilters.type.includes(candidate.type);
        }

        // 3. Experience Filter (Mocked for now since experience isn't in mock data)
        let matchesExperience = true;
        // In a real app, you would check candidate.experience against the selectedFilters.experience

        return matchesSearch && matchesType && matchesExperience;
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Candidates.jsx
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
<<<<<<< HEAD:frontend/src/pages/Candidates.jsx
                        {filteredCandidates.length > 0 ? filteredCandidates.map(app => (
                    <div key={app.id} className="card" onClick={() => navigate(`/profile/${app.userId}`)} style={{ cursor: 'pointer' }}>
=======
                        {filteredCandidates.length > 0 ? filteredCandidates.map(candidate => (
                            <div key={candidate.id} className="card" onClick={() => navigate(`/profile`)} style={{ cursor: 'pointer' }}>
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Candidates.jsx
                                <div className="job-card-header">
                                    <div className="company-logo-placeholder" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                                        <Users size={24} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
<<<<<<< HEAD:frontend/src/pages/Candidates.jsx
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
=======
                                        {candidate.status && candidate.status !== 'New' && (
                                            <span className={`job-type-badge ${candidate.status === 'Hired' ? 'success' : candidate.status === 'Rejected' ? 'danger' : ''}`} style={{ 
                                                backgroundColor: candidate.status === 'Hired' ? 'rgba(16, 185, 129, 0.1)' : candidate.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : '',
                                                color: candidate.status === 'Hired' ? '#10b981' : candidate.status === 'Rejected' ? '#ef4444' : ''
                                            }}>
                                                {t(candidate.status) || candidate.status}
                                            </span>
                                        )}
                                        <span className="job-type-badge">
                                            {candidate.type}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="job-title">{candidate.title}</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                    <div className="job-meta-item"><Users size={16} /> {candidate.name}</div>
                                    <div className="job-meta-item"><MapPin size={16} /> {t(candidate.location.toLowerCase().replace("'", '')) || candidate.location}</div>
                                </div>
                                <div className="job-card-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-icon" title={t('downloadCV') || 'Download CV'} onClick={(e) => handleAction(e, 'download', candidate)}>
                                            <Download size={18} />
                                        </button>
                                        <button className="btn-icon" title={t('sendMessage') || 'Message'} onClick={(e) => handleAction(e, 'message', candidate)}>
                                            <Mail size={18} />
                                        </button>
                                        <button className="btn-icon" title={t('accept') || 'Accept'} onClick={(e) => handleAction(e, 'accept', candidate)} style={{ color: '#10b981' }}>
                                            <CheckCircle size={18} />
                                        </button>
                                        <button className="btn-icon" title={t('reject') || 'Reject'} onClick={(e) => handleAction(e, 'reject', candidate)} style={{ color: '#ef4444' }}>
                                            <XCircle size={18} />
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Candidates.jsx
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
