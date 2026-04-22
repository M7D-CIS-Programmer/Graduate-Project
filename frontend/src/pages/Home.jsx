import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Search, MapPin, Briefcase, Building, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import heroImg1 from '../assets/heroImg1.jpg';
import heroImg2 from '../assets/heroImg2.jpg';
import heroImg3 from '../assets/heroImg3.jpg';
import { api } from '../api/api';
import './Home.css';

const Home = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const [currentImage, setCurrentImage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

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
    }, []);

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await api.getCategories();
                setCategories(data.slice(0, 4)); // Show only top 4 for "Popular"
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const getCategoryIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('tech') || n.includes('engineering')) return <Briefcase />;
        if (n.includes('design')) return <Users />;
        if (n.includes('market')) return <Building />;
        if (n.includes('manage') || n.includes('finance')) return <TrendingUp />;
        return <Briefcase />;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/jobs');
        }
    };

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
                        {t('heroTitle')}
                    </h1>
                    <p className="hero-subtitle">
                        {t('heroSubtitle')}
                    </p>

                    <form className="hero-search-bar glass" onSubmit={handleSearch}>
                        <div className="search-field">
                            <Search size={20} color="var(--primary)" />
                            <input
                                type="text"
                                placeholder={t('jobTitlePlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary">
                            {t('searchJobs')}
                        </button>
                    </form>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                                <Briefcase />
                            </div>
                            <div>
                                <h3 className="stat-value">25k+</h3>
                                <p className="stat-label">{t('activeJobs')}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <Building />
                            </div>
                            <div>
                                <h3 className="stat-value">10k+</h3>
                                <p className="stat-label">{t('activeCompanies')}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                <Users />
                            </div>
                            <div>
                                <h3 className="stat-value">45k+</h3>
                                <p className="stat-label">{t('activeCandidates')}</p>
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
                </div>
                <div className="categories-grid">
                    {categories.map((cat, i) => (
                        <div key={i} className="card categories-card">
                            <div className="cat-icon-box">{getCategoryIcon(cat.name)}</div>
                            <h3>{t(cat.name.toLowerCase()) || cat.name}</h3>
                            <p>{cat.jobCount} {t('activeJobs')}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Jobs */}
            <section className="featured-section">
                <div className="featured-header">
                    <div>
                        <h2 className="featured-title">{t('featuredJobs')}</h2>
                        <p style={{ color: 'var(--text-muted)' }}>{t('handPickedJobs')}</p>
                    </div>
                    <Link to="/jobs" className="view-all-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {t('viewAll')}
                        <ChevronRight size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
                    </Link>
                </div>
                <div className="jobs-grid">
                    {[1, 2, 3].map((item, i) => (
                        <div key={i} className="card">
                            <div className="job-card-header">
                                <div className="company-logo-placeholder">
                                    <Building size={24} />
                                </div>
                                <span className="job-type-badge">{t('fullTime')}</span>
                            </div>
                            <h3 className="job-title">{t('seniorReactDev')}</h3>
                            <p className="job-company">TechVision • {t('remote')}</p>
                            <div className="job-card-footer">
                                <span className="job-salary">$120k - $160k</span>
                                <Link to="/jobs/1" className="details-btn">{t('details')}</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
