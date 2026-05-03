import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api, getImageUrl } from '../api/api';
import {
    User,
    Mail,
    MapPin,
    Briefcase,
    Globe,
    Github,
    Linkedin,
    Phone,
    Edit,
    Calendar,
    ExternalLink,
    Building,
    HeartOff,
    Users
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFollowedCompanies, useUnfollowCompany } from '../hooks/useFollows';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import './User.css';

const Profile = () => {
    const { id } = useParams();
    const { t, dir } = useLanguage();
    const { user: currentUser } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const isOwnProfile = !id || id === currentUser?.id?.toString();

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'bio';
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { data: followedCompanies = [], isLoading: followingLoading } = useFollowedCompanies();
    const { mutate: unfollowCompany, isPending: isUnfollowing } = useUnfollowCompany();

    const { data: allJobs = [] } = useQuery({
        queryKey: ['jobs'],
        queryFn: () => api.getJobs(),
        staleTime: 60_000,
        enabled: activeTab === 'following'
    });

    const openJobsCountFor = (companyId) =>
        allJobs.filter(j => j.userId === companyId && (j.status === 'Active' || !j.status)).length;

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!id && !currentUser) return; // Wait for currentUser if viewing own profile
            
            setIsLoading(true);
            try {
                if (isOwnProfile && currentUser) {
                    setUserData(currentUser);
                } else if (id && id !== 'undefined') {
                    const fetchedUser = await api.getUser(id, currentUser?.id);
                    setUserData(fetchedUser);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                addToast(t('actionFailed'), 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [id, isOwnProfile, currentUser]);

    useEffect(() => {
        // Redirect Admin users to Settings since they don't have a public profile
        if (isOwnProfile && currentUser?.role?.toLowerCase() === 'admin') {
            navigate('/settings');
        }
    }, [isOwnProfile, currentUser, navigate]);

    if (isLoading) return <Spinner />;
    if (!userData) return <div className="user-page-container">{t('userNotFound')}</div>;

    const profilePhoto = getImageUrl(userData.profilePicture || userData.photo);
    const isEmployer = userData.role === 'Employer' || userData.role === 'Company';
    const isAdmin = userData.role?.toLowerCase() === 'admin';

    return (
        <div className="user-page-container" dir={dir}>
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{isOwnProfile ? t('myProfile') || 'My Profile' : t('userProfile')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isEmployer ? t('employerProfile') || 'Employer Account' 
                          : isAdmin ? t('adminProfile') || 'Administrator Account'
                          : t('jobSeekerProfile') || 'Job Seeker Account'}
                    </p>
                </div>
                {isOwnProfile && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button onClick={() => navigate('/profile/edit')}>
                            <Edit size={18} />
                            {t('editProfile') || 'Edit Profile'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Only show tabs if there is more than one available (e.g., Job Seeker's own profile) */}
            {isOwnProfile && currentUser?.role === 'Job Seeker' && (
                <div className="profile-tabs glass">
                    <button 
                        className={`profile-tab-btn ${activeTab === 'bio' ? 'active' : ''}`}
                        onClick={() => handleTabChange('bio')}
                    >
                        <User size={18} />
                        {t('bio') || 'Bio'}
                    </button>
                    <button 
                        className={`profile-tab-btn ${activeTab === 'following' ? 'active' : ''}`}
                        onClick={() => handleTabChange('following')}
                    >
                        <Building size={18} />
                        {t('following') || 'Following'}
                    </button>
                </div>
            )}

            <div className="profile-layout">
                <aside className="profile-card-left">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar-large">
                            {profilePhoto ? (
                                <img src={profilePhoto} alt={userData.name} />
                            ) : (
                                userData.name?.charAt(0) || <User size={48} />
                            )}
                        </div>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{userData.name}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        {userData.email}
                    </p>

                    <div className="profile-social-links">
                        {userData.linkedIn && (
                            <a href={userData.linkedIn} target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                                <Linkedin size={20} />
                            </a>
                        )}
                        {userData.github && (
                            <a href={userData.github} target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                                <Github size={20} />
                            </a>
                        )}
                        {userData.website && (
                            <a href={userData.website} target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                                <Globe size={20} />
                            </a>
                        )}
                    </div>

                    <div className="profile-meta-info">
                        <div className="meta-item">
                            <Calendar size={16} />
                            <span>{t('memberSince') || 'Member since'}: {new Date(userData.createdAt).getFullYear()}</span>
                        </div>
                        {userData.location && (
                            <div className="meta-item">
                                <MapPin size={16} />
                                <span>{userData.location}</span>
                            </div>
                        )}
                    </div>
                </aside>

                <div className="profile-content-main">
                    {activeTab === 'bio' ? (
                        <>
                            {/* About Section */}
                            <div className="dashboard-section">
                                <h3 className="section-title">
                                    <User size={20} />
                                    {isEmployer ? t('aboutCompany') || 'About Company' 
                                      : isAdmin ? t('aboutAdmin') || 'Administrator Bio'
                                      : t('aboutMe')}
                                </h3>
                                <p className="profile-bio-text">
                                    {userData.description || userData.bio || t('noDescriptionProvided') || 'No description provided yet.'}
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="profile-details-grid">
                                <div className="dashboard-section">
                                    <h3 className="section-title">
                                        <Briefcase size={20} />
                                        {t('professionalDetails') || 'Professional Details'}
                                    </h3>
                                    <div className="info-list">
                                        <div className="info-row">
                                            <span className="info-label">{t('role') || 'Role'}:</span>
                                            <span className="info-value">{userData.role}</span>
                                        </div>
                                        {isEmployer && userData.industry && (
                                            <div className="info-row">
                                                <span className="info-label">{t('industry') || 'Industry'}:</span>
                                                <span className="info-value">{t(userData.industry.toLowerCase().replace(' ', '')) || userData.industry}</span>
                                            </div>
                                        )}
                                        <div className="info-row">
                                            <span className="info-label">{t('location') || 'Location'}:</span>
                                            <span className="info-value">{userData.location || t('notSpecified') || 'Not specified'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="dashboard-section">
                                    <h3 className="section-title">
                                        <Mail size={20} />
                                        {t('contactInformation') || 'Contact Information'}
                                    </h3>
                                    <div className="info-list">
                                        <div className="info-row">
                                            <span className="info-label">{t('email') || 'Email'}:</span>
                                            <span className="info-value">{userData.email}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">{t('phone') || 'Phone'}:</span>
                                            <span className="info-value">{userData.phone || t('notSpecified') || 'Not specified'}</span>
                                        </div>
                                        {userData.website && (
                                            <div className="info-row">
                                                <span className="info-label">{t('website') || 'Website'}:</span>
                                                <a href={userData.website} target="_blank" rel="noopener noreferrer" className="info-value link">
                                                    {userData.website.replace(/^https?:\/\//, '')}
                                                    <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="following-tab-content">
                            {followingLoading ? (
                                <Spinner />
                            ) : followedCompanies.length === 0 ? (
                                <div className="empty-state glass">
                                    <Building size={56} className="empty-icon" />
                                    <h3>{t('noFollowedCompanies')}</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                        {t('findCompaniesToFollow')}
                                    </p>
                                    <Button onClick={() => navigate('/companies')}>
                                        {t('exploreCompanies')}
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
                                                                {company.industry || t('notProvided')}
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

                                                <div className="following-card-stats">
                                                    <div className="following-stat">
                                                        <Users size={14} />
                                                        <span>{company.followerCount ?? 0}</span>
                                                        <span className="following-stat-label">{t('followers')}</span>
                                                    </div>
                                                    <div className="following-stat-divider" />
                                                    <div className="following-stat">
                                                        <Briefcase size={14} />
                                                        <span>{openJobs}</span>
                                                        <span className="following-stat-label">{t('openPositions')}</span>
                                                    </div>
                                                </div>

                                                <div className="following-card-actions" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        className="action-btn view-profile"
                                                        onClick={() => navigate(`/companies/${company.id}`)}
                                                    >
                                                        {t('viewProfile')}
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
                                                        {t('viewJobs')} <ExternalLink size={14} />
                                                    </button>
                                                    <button
                                                        className="action-btn unfollow-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            unfollowCompany(company.id);
                                                        }}
                                                        disabled={isUnfollowing}
                                                        title={t('unfollow')}
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
