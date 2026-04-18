import React, { useState, useEffect } from 'react';
<<<<<<< HEAD:frontend/src/pages/EmployerHome.jsx
import Spinner from '../components/ui/Spinner';
=======
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/EmployerHome.jsx
import { useLanguage } from '../context/LanguageContext';
import { Search, MapPin, Briefcase, Building, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import heroImg1 from '../assets/heroImg1.jpg';
import heroImg2 from '../assets/heroImg2.jpg';
import heroImg3 from '../assets/heroImg3.jpg';
import './Home.css';
<<<<<<< HEAD:frontend/src/pages/EmployerHome.jsx
import { useJobs } from '../hooks/useJobs';
=======
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/EmployerHome.jsx

const EmployerHome = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const [currentImage, setCurrentImage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
<<<<<<< HEAD:frontend/src/pages/EmployerHome.jsx
    const candidates = [
        { name: 'Ahmad Al-Hassan', location: 'Dubai, UAE' },
        { name: 'Sara Malik', location: 'Abu Dhabi, UAE' },
        { name: 'Omar Khalid', location: 'Sharjah, UAE' },
    ];
    const { data: jobs = [], isLoading } = useJobs();
    const jobsCount = jobs.length;
=======
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/EmployerHome.jsx

    const bgImages = [
        heroImg1,
        heroImg2,
        heroImg3
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % bgImages.length);
        }, 4000);
        return () => clearInterval(timer);
<<<<<<< HEAD:frontend/src/pages/EmployerHome.jsx
    }, []);
=======
    }, [bgImages.length]);
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/EmployerHome.jsx

    const categories = [
        { title: 'Tech', count: '1,240', icon: <Briefcase /> },
        { title: 'Design', count: '850', icon: <Users /> },
        { title: 'Management', count: '420', icon: <TrendingUp /> },
        { title: 'Marketing', count: '310', icon: <Building /> }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/candidates?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/candidates');
        }
    };

<<<<<<< HEAD:frontend/src/pages/EmployerHome.jsx
    if (isLoading) return <Spinner />;

=======
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/EmployerHome.jsx
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-slider">
                    {bgImages.map((img, index) => (
                        <div
                            key={index}
                            className={`hero-slide ${index === currentImage ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${img})` }}
                        />
                    ))}
                    <div className="hero-overlay" />
                </div>
                <div className="hero-content">
                    <h1 className="hero-title">
                        {t('employerHeroTitle')}
                    </h1>
                    <p className="hero-subtitle">
                        {t('employerHeroSubtitle')}
                    </p>

                    <form className="hero-search-bar glass" onSubmit={handleSearch}>
                        <div className="search-field">
                            <Search size={20} color="var(--primary)" />
                            <input
                                type="text"
                                placeholder={t('candidatePlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary">
                            {t('searchCandidates')}
                        </button>
                    </form>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                                <Users />
                            </div>
                            <div>
<<<<<<< HEAD:frontend/src/pages/EmployerHome.jsx
                                <h3 className="stat-value">{candidates.length}+</h3>
=======
                                <h3 className="stat-value">45k+</h3>
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/EmployerHome.jsx
                                <p className="stat-label">{t('activeCandidates')}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <Briefcase />
                            </div>
                            <div>
<<<<<<< HEAD:frontend/src/pages/EmployerHome.jsx
                                <h3 className="stat-value">{jobsCount}+</h3>
=======
                                <h3 className="stat-value">25k+</h3>
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/EmployerHome.jsx
                                <p className="stat-label">{t('activeJobs')}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                <Building />
                            </div>
                            <div>
<<<<<<< HEAD:frontend/src/pages/EmployerHome.jsx
                                <h3 className="stat-value">10+</h3>
=======
                                <h3 className="stat-value">10k+</h3>
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/EmployerHome.jsx
                                <p className="stat-label">{t('activeCompanies')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="categories-section">
                <div className="featured-header">
                    <div>
                        <h2 className="featured-title">{t('popularCategories')}</h2>
                        <p style={{ color: 'var(--text-muted)' }}>{t('categoriesSubtitle')}</p>
                    </div>
                    <button className="view-all-btn">{t('viewAll')}</button>
                </div>
                <div className="categories-grid">
                    {categories.map((cat, i) => (
                        <div key={i} className="card categories-card">
                            <div className="cat-icon-box">{cat.icon}</div>
                            <h3>{t(cat.title.toLowerCase())}</h3>
                            <p>{cat.count} {t('activeCandidates')}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Candidates */}
            <section className="featured-section">
                <div className="featured-header">
                    <div>
                        <h2 className="featured-title">{t('featuredTalent')}</h2>
                        <p style={{ color: 'var(--text-muted)' }}>{t('handPickedJobs')}</p>
                    </div>
                    <Link to="/candidates" className="view-all-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {t('viewAll')}
                        <ChevronRight size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
                    </Link>
                </div>
                <div className="jobs-grid">
<<<<<<< HEAD:frontend/src/pages/EmployerHome.jsx
                    {candidates.map((candidate, i) => (
=======
                    {[
                        { titleKey: 'seniorReactDev', location: 'Amman', typeKey: 'fullTime', remoteKey: 'remote', salary: '$120k - $160k' },
                        { titleKey: 'uiuxDesigner', location: 'Irbid', typeKey: 'partTime', remoteKey: 'remote', salary: '$80k - $100k' },
                        { titleKey: 'marketingManager', location: 'Zarqa', typeKey: 'contract', remoteKey: 'remote', salary: '$90k - $130k' },
                    ].map((candidate, i) => (
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/EmployerHome.jsx
                        <div key={i} className="card">
                            <div className="job-card-header">
                                <div className="company-logo-placeholder">
                                    <Users size={24} />
                                </div>
<<<<<<< HEAD:frontend/src/pages/EmployerHome.jsx
                                <span className="job-type-badge">{t('fullTime')}</span>
                            </div>
                            <h3 className="job-title">{candidate.name}</h3>
                            <p className="job-company">{candidate.location || 'Remote'} • {t('remote')}</p>
                            <div className="job-card-footer">
                                <span className="job-salary">$100k - $150k</span>
=======
                                <span className="job-type-badge">{t(candidate.typeKey)}</span>
                            </div>
                            <h3 className="job-title">{t(candidate.titleKey)}</h3>
                            <p className="job-company">{candidate.location} • {t(candidate.remoteKey)}</p>
                            <div className="job-card-footer">
                                <span className="job-salary">{candidate.salary}</span>
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/EmployerHome.jsx
                                <Link to="/profile" className="details-btn">{t('details')}</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default EmployerHome;
