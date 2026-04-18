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

<<<<<<< HEAD:frontend/src/pages/Companies/Companies.jsx
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
=======
    const companies = [
        {
            id: 1,
            name: 'TechVision',
            logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TV&backgroundColor=6366f1',
            sector: t('tech'),
            location: 'Irbid, Jordan',
            employees: '500-1000',
            jobsCount: 12,
            description: 'Leading the way in AI and machine learning solutions for the modern world.'
        },
        {
            id: 2,
            name: 'CreativePulse',
            logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CP&backgroundColor=ec4899',
            sector: t('tech'),
            location: 'Amman, Jordan',
            employees: '100-250',
            jobsCount: 5,
            description: 'A boutique design agency specializing in brand identity and digital experiences.'
        },
        {
            id: 3,
            name: 'DataFlow',
            logo: 'https://api.dicebear.com/7.x/initials/svg?seed=DF&backgroundColor=10b981',
            sector: t('tech'),
            location: 'Mafraq, Jordan',
            employees: '250-500',
            jobsCount: 8,
            description: 'Scalable data infrastructure and analytics for global enterprises.'
        },
        {
            id: 4,
            name: 'GlobalFinance',
            logo: 'https://api.dicebear.com/7.x/initials/svg?seed=GF&backgroundColor=f59e0b',
            sector: t('finance'),
            location: 'Aqaba, Jordan',
            employees: '5000+',
            jobsCount: 45,
            description: 'Empowering individuals and businesses with innovative financial services.'
        },
        {
            id: 5,
            name: 'HealthPlus',
            logo: 'https://api.dicebear.com/7.x/initials/svg?seed=HP&backgroundColor=3b82f6',
            sector: t('healthcare'),
            location: 'Amman, Jordan',
            employees: '1000-2000',
            jobsCount: 18,
            description: 'Modern healthcare management and patient-centric digital solutions.'
        },
        {
            id: 6,
            name: 'EduSmart',
            logo: 'https://api.dicebear.com/7.x/initials/svg?seed=ES&backgroundColor=8b5cf6',
            sector: t('education_sector'),
            location: 'Amman, Jordan',
            employees: '50-100',
            jobsCount: 3,
            description: 'Revolutionizing online learning with interactive and personalized curricula.'
        }
    ];
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Companies/Companies.jsx

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
