import React from 'react';
import {
    Search,
    MapPin,
    Filter,
    ChevronRight,
    Building,
    DollarSign,
    Clock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Jobs.css';

export const mockJobs = [
    { id: 1, title: 'seniorReactDev', company: 'TechVision', location: 'Amman', salary: '$120k - $160k', type: 'fullTime', time: '2 days ago' },
    { id: 2, title: 'Product UI/UX Designer', company: 'CreativePulse', location: 'Irbid', salary: '$100k - $140k', type: 'fullTime', time: '3 days ago' },
    { id: 3, title: 'Backend Developer (Node.js)', company: 'DataFlow', location: 'Zarqa', salary: '$90k - $130k', type: 'contract', time: '1 week ago' },
    { id: 4, title: 'Mobile App Developer', company: 'AppSolute', location: 'Aqaba', salary: '$110k - $150k', type: 'fullTime', time: '4 days ago' },
    { id: 5, title: 'System Architect', company: 'CloudNet', location: 'Amman', salary: '$130k - $170k', type: 'fullTime', time: '5 days ago' },
    { id: 6, title: 'QA Engineer', company: 'TestIt', location: 'Balqa', salary: '$80k - $110k', type: 'partTime', time: '1 week ago' },
];

const JobListings = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const filterCategories = [
        { id: 'type', title: t('jobType'), options: [t('fullTime'), t('partTime'), t('contract'), t('remote')] },
        { id: 'salary', title: t('salaryRange'), options: ['$50k - $80k', '$80k - $120k', '$120k+'] },
    ];

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('q') || '';
    const [searchQuery, setSearchQuery] = React.useState(initialSearch);

    // Track selected filters
    const [selectedFilters, setSelectedFilters] = React.useState({
        type: [],
        salary: []
    });

    React.useEffect(() => {
        setSearchQuery(queryParams.get('q') || '');
    }, [location.search]);

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

    const filteredJobs = mockJobs.filter(job => {
        // 1. Search filter
        let matchesSearch = true;
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            matchesSearch = job.title.toLowerCase().includes(lowerQuery) ||
                job.company.toLowerCase().includes(lowerQuery);
        }

        // 2. Type filter
        let matchesType = true;
        if (selectedFilters.type.length > 0) {
            matchesType = selectedFilters.type.includes(job.type) ||
                (job.location === t('remote') && selectedFilters.type.includes(t('remote')));
        }

        // 3. Salary filter
        let matchesSalary = true;
        if (selectedFilters.salary.length > 0) {
            // Simple exact match for mock data. In a real app, you'd parse ranges.
            matchesSalary = selectedFilters.salary.some(s => {
                if (s.includes('+')) return job.salary.includes('130k') || job.salary.includes('120k+');
                if (s.includes('80k')) return job.salary.includes('80k');
                return true;
            });
        }

        return matchesSearch && matchesType && matchesSalary;
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/jobs');
        }
    };

    return (
        <div className="jobs-page-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">{t('findJobs')}</h1>
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
                                placeholder={t('jobTitlePlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%', paddingLeft: '10px' }}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ height: '44px' }}>{t('searchJobs')}</button>
                    </form>

                    <div className="jobs-grid">
                        {filteredJobs.length > 0 ? filteredJobs.map(job => (
                            <div key={job.id} className="card" onClick={() => navigate(`/jobs/${job.id}`)} style={{ cursor: 'pointer' }}>
                                <div className="job-card-header">
                                    <div className="company-logo-placeholder">
                                        <Building size={24} color="var(--text-muted)" />
                                    </div>
                                    <span className="job-type-badge">
                                        {t(job.type) || job.type}
                                    </span>
                                </div>
                                <h3 className="job-title">{t(job.title) || job.title}</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                    <div className="job-meta-item"><Building size={16} /> {job.company}</div>
                                    <div className="job-meta-item"><MapPin size={16} /> {t(job.location.toLowerCase().replace("'", '')) || job.location}</div>
                                </div>
                                <div className="job-card-footer">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: '600' }}>
                                        {t('details')}
                                        <ChevronRight size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '3rem', width: '100%' }}>
                                <p style={{ color: 'var(--text-muted)' }}>No jobs found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobListings;
