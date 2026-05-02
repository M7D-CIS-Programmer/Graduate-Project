import React, { useState, useEffect } from 'react';
import Spinner from '../components/ui/Spinner';
import { useLanguage } from '../context/LanguageContext';
import { Search, MapPin, Briefcase, Building, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import heroImg1 from '../assets/heroImg1.jpg';
import heroImg2 from '../assets/heroImg2.jpg';
import heroImg3 from '../assets/heroImg3.jpg';
import './Home.css';
import { useJobs } from '../hooks/useJobs';
import { api } from '../api/api';
import EmployeeCard from '../components/EmployeeCard';

const EmployerHome = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const [currentImage, setCurrentImage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        Promise.all([
            api.getUsers(),
            api.getDepartments()
        ]).then(([users, deptData]) => {
            const seekers = users
                .filter((u) => u.role?.toLowerCase() === 'job seeker')
                .slice(0, 3);
            setCandidates(seekers);
            setDepartments(deptData.slice(0, 4));
        }).catch((error) => {
            console.error('Error fetching dashboard data:', error);
        });
    }, []);
    const { data: jobs = [], isLoading } = useJobs();
    const jobsCount = jobs.length;

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

    const getDepartmentIcon = (name) => {
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
            navigate(`/candidates?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/candidates');
        }
    };

    if (isLoading) return <Spinner />;
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
                                <h3 className="stat-value">{candidates.length}+</h3>
                                <p className="stat-label">{t('activeCandidates')}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <Briefcase />
                            </div>
                            <div>
                                <h3 className="stat-value">{jobsCount}+</h3>
                                <p className="stat-label">{t('activeJobs')}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                <Building />
                            </div>
                            <div>
                                <h3 className="stat-value">10+</h3>
                                <p className="stat-label">{t('activeCompanies')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Departments */}
            <section className="categories-section">
                <div className="featured-header">
                    <div>
                        <h2 className="featured-title">{t('popularDepartments')}</h2>
                        <p style={{ color: 'var(--text-muted)' }}>{t('departmentsSubtitle')}</p>
                    </div>
                </div>
                <div className="categories-grid">
                    {departments.length > 0 ? (
                        departments.map((dept, i) => (
                            <div key={dept.id || i} className="card categories-card">
                                <div className="cat-icon-box">{getDepartmentIcon(dept.name)}</div>
                                <h3>{t(dept.name.toLowerCase()) || dept.name}</h3>
                                <p>{dept.jobCount || 0} {t('activeJobs')}</p>
                            </div>
                        ))
                    ) : (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="card categories-card skeleton" style={{ height: '160px', opacity: 0.3 }} />
                        ))
                    )}
                </div>
            </section>

            {/* Featured Candidates */}
            <section className="featured-section">
                <div className="featured-header">
                    <div>
                        <h2 className="featured-title">{t('featuredTalent')}</h2>
                        <p style={{ color: 'var(--text-muted)' }}>{t('handPickedTalent')}</p>
                    </div>
                </div>

                <div className="jobs-grid">
                    {candidates.length > 0 ? (
                        candidates.map((candidate) => (
                            <EmployeeCard
                                key={candidate.id}
                                id={candidate.id}
                                name={candidate.name}
                                email={candidate.email}
                                location={candidate.location}
                                role={candidate.industry || t('jobSeeker')}
                            />
                        ))
                    ) : (
                        <div className="no-results" style={{ gridColumn: '1 / -1' }}>{t('noCandidatesFound') || 'No talent found at the moment.'}</div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default EmployerHome;
