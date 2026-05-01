import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building, MapPin, ExternalLink, HeartOff,
    Users, Briefcase, Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFollowedCompanies, useUnfollowCompany } from '../../hooks/useFollows';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/api';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import './FollowingCompanies.css';

const FollowingCompanies = () => {
    const { user } = useAuth();
    const { t, dir } = useLanguage();
    const navigate = useNavigate();

    const { data: followedCompanies = [], isLoading } = useFollowedCompanies();
    const { mutate: unfollowCompany, isPending: isUnfollowing } = useUnfollowCompany();

    // Fetch all jobs so we can show open position count per company
    const { data: allJobs = [] } = useQuery({
        queryKey: ['jobs'],
        queryFn: () => api.getJobs(),
        staleTime: 60_000,
    });

    const openJobsCountFor = (companyId) =>
        allJobs.filter(j => j.userId === companyId && (j.status === 'Active' || !j.status)).length;

    const handleUnfollow = (e, companyId) => {
        e.stopPropagation();
        unfollowCompany(companyId);
    };

    if (isLoading) {
        return (
            <div className="following-container" dir={dir}>
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">
                            <Building size={24} style={{ color: 'var(--primary)' }} />
                            {t('followingCompanies') || 'Following Companies'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {t('followingSubtitle') || 'Companies you are keeping an eye on'}
                        </p>
                    </div>
                </div>
                <Spinner />
            </div>
        );
    }

    return (
        <div className="following-container" dir={dir}>
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Building size={26} style={{ color: 'var(--primary)' }} />
                        {t('followingCompanies') || 'Following Companies'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {followedCompanies.length > 0
                            ? `You are following ${followedCompanies.length} ${followedCompanies.length === 1 ? 'company' : 'companies'}`
                            : t('followingSubtitle') || 'Companies you are keeping an eye on'}
                    </p>
                </div>

                <Button variant="outline" onClick={() => navigate('/companies')}>
                    <Globe size={16} />
                    {t('exploreCompanies') || 'Explore Companies'}
                </Button>
            </div>

            {followedCompanies.length === 0 ? (
                <div className="empty-state glass">
                    <Building size={56} className="empty-icon" />
                    <h3>{t('noFollowedCompanies') || 'You are not following any companies yet.'}</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        {t('findCompaniesToFollow') || 'Explore companies and follow them to stay updated on their latest opportunities.'}
                    </p>
                    <Button onClick={() => navigate('/companies')}>
                        {t('exploreCompanies') || 'Explore Companies'}
                    </Button>
                </div>
            ) : (
                <div className="following-grid">
                    {followedCompanies.map(company => {
                        const openJobs = openJobsCountFor(company.id);
                        return (
                            <div
                                key={company.id}
                                className="following-card glass"
                                onClick={() => navigate(`/companies/${company.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="following-card-header">
                                    <div className="company-logo-wrapper">
                                        <img
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(company.name)}&backgroundColor=6366f1`}
                                            alt={company.name}
                                        />
                                    </div>
                                    <div className="company-info">
                                        <h3>{company.name}</h3>
                                        <div className="company-meta">
                                            <span className="industry-badge">
                                                <Building size={12} />
                                                {company.industry || t('notProvided') || 'Not provided'}
                                            </span>
                                            {company.location && (
                                                <span className="location-info">
                                                    <MapPin size={12} />
                                                    {company.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="following-card-stats">
                                    <div className="following-stat">
                                        <Users size={14} />
                                        <span>{company.followerCount ?? 0}</span>
                                        <span className="following-stat-label">Followers</span>
                                    </div>
                                    <div className="following-stat-divider" />
                                    <div className="following-stat">
                                        <Briefcase size={14} />
                                        <span>{openJobs}</span>
                                        <span className="following-stat-label">Open Jobs</span>
                                    </div>
                                </div>

                                <div className="following-card-actions" onClick={e => e.stopPropagation()}>
                                    <button
                                        className="action-btn view-profile"
                                        onClick={() => navigate(`/companies/${company.id}`)}
                                    >
                                        {t('viewProfile') || 'View Profile'}
                                    </button>
                                    <button
                                        className="action-btn view-jobs"
                                        onClick={() => {
                                            navigate(`/companies/${company.id}`);
                                            setTimeout(() => {
                                                document.getElementById('company-jobs-section')?.scrollIntoView({ behavior: 'smooth' });
                                            }, 500);
                                        }}
                                    >
                                        {t('viewJobs') || 'View Jobs'} <ExternalLink size={14} />
                                    </button>
                                    <button
                                        className="action-btn unfollow-btn"
                                        onClick={(e) => handleUnfollow(e, company.id)}
                                        disabled={isUnfollowing}
                                        title={t('unfollow') || 'Unfollow'}
                                    >
                                        <HeartOff size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FollowingCompanies;
