import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                if (isOwnProfile && currentUser) {
                    setUserData(currentUser);
                } else {
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

    if (isLoading) return <Spinner />;
    if (!userData) return <div className="user-page-container">{t('userNotFound')}</div>;

    const profilePhoto = getImageUrl(userData.profilePicture || userData.photo);
    const isEmployer = userData.role === 'Employer' || userData.role === 'Company';

    return (
        <div className="user-page-container" dir={dir}>
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{isOwnProfile ? t('myProfile') || 'My Profile' : t('userProfile')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isEmployer ? t('employerProfile') || 'Employer Account' : t('jobSeekerProfile') || 'Job Seeker Account'}
                    </p>
                </div>
                {isOwnProfile && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {!isEmployer && (
                            <Button 
                                variant="outline" 
                                onClick={() => navigate('/dashboard/seeker/following')}
                                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                            >
                                <Briefcase size={18} />
                                {t('followingCompanies') || 'Following'}
                            </Button>
                        )}
                        <Button onClick={() => navigate('/profile/edit')}>
                            <Edit size={18} />
                            {t('editProfile') || 'Edit Profile'}
                        </Button>
                    </div>
                )}
            </div>

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
                    {/* About Section */}
                    <div className="dashboard-section">
                        <h3 className="section-title">
                            <User size={20} />
                            {isEmployer ? t('aboutCompany') || 'About Company' : t('aboutMe')}
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
                </div>
            </div>
        </div>
    );
};

export default Profile;
