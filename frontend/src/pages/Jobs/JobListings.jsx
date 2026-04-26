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
import { useJobs } from '../../hooks/useJobs';
import { useCategories } from '../../hooks/useCategories';
import { useDebounce } from '../../hooks/useDebounce';
import './Jobs.css';



const JobListings = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('q') || '';

    const [searchQuery, setSearchQuery] = React.useState(initialSearch);
    const [selectedTypes, setSelectedTypes] = React.useState([]);
    const [selectedWorkModes, setSelectedWorkModes] = React.useState([]);
    const [selectedSalaries, setSelectedSalaries] = React.useState([]);
    const [selectedCategory, setSelectedCategory] = React.useState('');

    // Debounced value — only updates 400 ms after the user stops typing.
    // This is what gets forwarded to the API so we don't fire a request on every keystroke.
    const debouncedQuery = useDebounce(searchQuery, 400);

    const { data: categories = [] } = useCategories();

    const { data: jobs = [], isLoading, error } = useJobs({
        type: selectedTypes.join(','),
        workMode: selectedWorkModes.join(','),
        q: debouncedQuery,
        categoryId: selectedCategory
    });

    const jobTypeOptions = [
        { label: t('fullTime'), value: 'Full Time' },
        { label: t('partTime'), value: 'Part Time' },
        { label: t('contract'), value: 'Contract' },
    ];

    const workModeOptions = [
        { label: t('remote'), value: 'Remote' },
        { label: t('onSite'), value: 'On-site' },
        { label: t('hybrid'), value: 'Hybrid' },
    ];

    const salaryRanges = [
        { label: '$50k - $80k', min: 50000, max: 80000 },
        { label: '$80k - $120k', min: 80000, max: 120000 },
        { label: '$120k+', min: 120000, max: Infinity },
    ];

    React.useEffect(() => {
        setSearchQuery(queryParams.get('q') || '');
    }, [location.search]);

    const toggleType = (value) =>
        setSelectedTypes(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);

    const toggleWorkMode = (value) =>
        setSelectedWorkModes(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);

    const toggleSalary = (label) =>
        setSelectedSalaries(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);

    // Salary filtering is still client-side for now as it's complex to pass ranges to API without better DTO
    const filteredJobs = jobs.filter(job => {
        if (selectedSalaries.length > 0) {
            const matchesSalary = selectedSalaries.some(label => {
                const range = salaryRanges.find(r => r.label === label);
                if (!range) return false;
                const salary = job.salaryMin ?? 0;
                return salary >= range.min && salary < range.max;
            });
            if (!matchesSalary) return false;
        }
        return true;
    }).sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/jobs');
        }
    };

    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error.message}</div>;

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

                    <div className="filter-section">
                        <h3 className="filter-title">{t('category') || 'Category'}</h3>
                        <select
                            className="filter-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-main)',
                                marginBottom: '1rem'
                            }}
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
                            {jobTypeOptions.map(opt => (
                                <label key={opt.value} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedTypes.includes(opt.value)}
                                        onChange={() => toggleType(opt.value)}
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3 className="filter-title">{t('workMode')}</h3>
                        <div className="filter-options">
                            {workModeOptions.map(opt => (
                                <label key={opt.value} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedWorkModes.includes(opt.value)}
                                        onChange={() => toggleWorkMode(opt.value)}
                                    />
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
                                    <input
                                        type="checkbox"
                                        checked={selectedSalaries.includes(range.label)}
                                        onChange={() => toggleSalary(range.label)}
                                    />
                                    <span>{range.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
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
                                style={{ background: 'none', border: 'none', color: 'var(--text-color)', outline: 'none', width: '100%', paddingLeft: '10px' }}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ height: '44px' }}>{t('searchJobs')}</button>
                    </form>

                    <div className="jobs-grid">
                        {isLoading ? (
                            // Inline spinner — keeps the page (and focused input) mounted
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    border: '3px solid var(--border-color)',
                                    borderTop: '3px solid var(--primary)',
                                    borderRadius: '50%',
                                    animation: 'spin 0.7s linear infinite'
                                }} />
                            </div>
                        ) : filteredJobs.length > 0 ? filteredJobs.map(job => (
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
                                    <div className="job-meta-item"><Building size={16} /> {job.user?.name || 'Company'}</div>
                                    <div className="job-meta-item"><MapPin size={16} /> {job.workMode || t('remote')}</div>
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
