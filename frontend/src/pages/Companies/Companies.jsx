import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import { Search, MapPin, Users, Briefcase, Filter, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import './Companies.css';
import { useUsers } from '../../hooks/useUsers';
import { useFollowedCompanies } from '../../hooks/useFollows';
import { useAuth } from '../../context/AuthContext';

const Companies = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSector, setSelectedSector] = useState('all');
    const [showFollowingOnly, setShowFollowingOnly] = useState(false);
    const { data: users = [], isLoading, error } = useUsers();
    const { data: followedCompanies = [] } = useFollowedCompanies();

    const companies = users.filter(u => u.role === 'Employer').map(u => ({
        id: u.id,
        name: u.name,
        logo: `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}&backgroundColor=6366f1`,
        sector: u.industry || t('tech'),
        location: u.location || 'Remote',
        employees: '100-250',
        jobsCount: u.activeJobsCount || 0,
        description: u.description || 'Leading company in the region.'
    }));

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = (company.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSector = selectedSector === 'all' ||
            company.sector.toLowerCase() === selectedSector.toLowerCase() ||
            (selectedSector === 'tech' && company.sector === t('tech'));
        const matchesFollowing = !showFollowingOnly || followedCompanies.some(f => f.id === company.id);
        return matchesSearch && matchesSector && matchesFollowing;
    }).sort((a, b) => b.id - a.id);

    if (isLoading) return <Spinner />;

    const sectors = [
        { id: 'all', label: t('allSectors') },
        { id: 'tech', label: t('tech') },
        { id: 'finance', label: t('finance') },
        { id: 'healthcare', label: t('healthcare') },
        { id: 'education', label: t('education_sector') }
    ];

    return (
        <div className="companies-container">
            <div className="companies-header">
                <div>
                    <h1 className="dashboard-title">{t('exploreCompanies')}</h1>
                    <p className="subtitle">{t('companiesSubtitle')}</p>
                </div>
                {user?.role === 'Job Seeker' && (
                    <div className="companies-tabs">
                        <button 
                            className={`tab-btn ${!showFollowingOnly ? 'active' : ''}`}
                            onClick={() => setShowFollowingOnly(false)}
                        >
                            {t('allCompanies') || 'All Companies'}
                        </button>
                        <button 
                            className={`tab-btn ${showFollowingOnly ? 'active' : ''}`}
                            onClick={() => setShowFollowingOnly(true)}
                        >
                            {t('followingCompanies') || 'Following'}
                            {followedCompanies.length > 0 && <span className="tab-count">{followedCompanies.length}</span>}
                        </button>
                    </div>
                )}
            </div>

            <div className="companies-filters glass">
                <div className="search-wrapper">
                    <Input
                        placeholder={t('search')}
                        icon={Search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

            </div>

            <div className="companies-grid">
                {filteredCompanies.map((company) => (
                    <div key={company.id} className="company-card glass">
                        <div className="company-card-header">
                            <div className="company-logo-wrapper">
                                <img src={company.logo} alt={company.name} />
                            </div>
                            <div className="company-info">
                                <h3>{company.name}</h3>
                                <div className="company-meta">
                                    <span className="sector-tag">{company.sector}</span>
                                    <span className="location">
                                        <MapPin size={14} />
                                        {company.location}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="company-desc">{company.description}</p>

                        <div className="company-stats">
                            <div className="stat">
                                <Users size={16} />
                                <span>{company.employees} {t('employees')}</span>
                            </div>
                            <div className="stat">
                                <Briefcase size={16} />
                                <span>{company.jobsCount} {t('openPositions')}</span>
                            </div>
                        </div>

                        <div className="company-card-actions">
                            <Button
                                variant="secondary"
                                className="btn-full"
                                onClick={() => navigate(`/companies/${company.id}`)}
                            >
                                {t('viewProfile')}
                                <ExternalLink size={16} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCompanies.length === 0 && (
                <div className="empty-state">
                    <Search size={48} className="empty-icon" />
                    <h3>No companies found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
};

export default Companies;
