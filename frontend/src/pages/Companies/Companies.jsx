import React, { useState } from 'react';
import Spinner from '../../components/ui/Spinner';
import { Search, MapPin, Users, Briefcase, Filter, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import './Companies.css';
import { useUsers } from '../../hooks/useUsers';

const Companies = () => {
    const { t, dir } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSector, setSelectedSector] = useState('all');
    const { data: users = [], isLoading, error } = useUsers();

    const companies = users.filter(u => u.role === 'Employer').map(u => ({
        id: u.id,
        name: u.name,
        logo: `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}&backgroundColor=6366f1`,
        sector: t('tech'),
        location: u.location || 'Remote',
        employees: '100-250',
        jobsCount: 0,
        description: u.description || 'Leading company in the region.'
    }));

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = (company.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSector = selectedSector === 'all' || company.sector === (selectedSector === 'tech' ? t('tech') : selectedSector === 'finance' ? t('finance') : selectedSector === 'healthcare' ? t('healthcare') : t('education_sector'));
        return matchesSearch && matchesSector;
    });

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
                <div className="filter-group">
                    <Filter size={20} className="filter-icon" />
                    <select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="sector-select"
                    >
                        {sectors.map(sector => (
                            <option key={sector.id} value={sector.id}>{sector.label}</option>
                        ))}
                    </select>
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
                            <Button variant="secondary" className="btn-full">
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
