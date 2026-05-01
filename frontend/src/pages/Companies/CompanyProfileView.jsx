import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Building,
    MapPin,
    Globe,
    Mail,
    Phone,
    Briefcase,
    ExternalLink,
    ChevronLeft,
    Heart,
    Share2,
    MessageSquare
} from 'lucide-react';
import { api } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useFollowedCompanies, useFollowCompany, useUnfollowCompany } from '../../hooks/useFollows';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import './CompanyProfileView.css';

const CompanyProfileView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { t, dir } = useLanguage();
    const { addToast } = useToast();
    const [isLocalFollowed, setIsLocalFollowed] = useState(false); // To handle optimistic UI
    const { data: followedCompanies } = useFollowedCompanies();
    const { mutate: followCompany } = useFollowCompany();
    const { mutate: unfollowCompany } = useUnfollowCompany();

    // Fetch company data
    const { data: company, isLoading, error } = useQuery({
        queryKey: ['company', id],
        queryFn: async () => {
            // Routing requirement: Employer viewing their OWN profile → redirect to edit
            if (
                currentUser &&
                currentUser.id?.toString() === id &&
                (currentUser.role === 'Employer' || currentUser.role === 'Company')
            ) {
                navigate('/profile', { replace: true });
                return null;
            }

            const data = await api.getUser(id);

            // Validate this is actually an employer profile
            if (data.role !== 'Employer' && data.role !== 'Company') {
                throw new Error('not_a_company');
            }

            return data;
        },
        enabled: !!id,
        retry: false,
    });

    // Fetch company's active jobs
    const { data: jobs = [], isLoading: jobsLoading } = useQuery({
        queryKey: ['company-jobs', id],
        queryFn: () => api.getJobsByUser(id),
        enabled: !!id,
        staleTime: 30_000,
    });

    const isJobSeeker = !currentUser || currentUser.role === 'Job Seeker' || currentUser.role === 'JobSeeker';

    // Job seeker: find any application they have to a job from this company
    const { data: seekerApplications = [] } = useQuery({
        queryKey: ['seeker-applications-for-company', currentUser?.id, id],
        queryFn: () => api.getApplications(),
        enabled: isJobSeeker && !!currentUser?.id,
        staleTime: 60_000,
    });

    const applicationToCompany = isJobSeeker
        ? seekerApplications.find(a => a.job?.userId?.toString() === id || a.job?.user?.id?.toString() === id)
        : null;

    const isFollowed = followedCompanies?.some(c => c.id.toString() === id) || isLocalFollowed;

    const handleFollow = () => {
        if (!currentUser) {
            addToast(t('loginRequired') || 'Please log in to follow companies.', 'info');
            return;
        }

        if (isFollowed) {
            unfollowCompany(id);
            setIsLocalFollowed(false); // Optimistic UI update
        } else {
            followCompany(id);
            setIsLocalFollowed(true); // Optimistic UI update
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        addToast(t('linkCopied') || 'Profile link copied to clipboard!', 'success');
    };

    const scrollToJobs = () => {
        document.getElementById('company-jobs-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (isLoading) return <Spinner />;

    if (error || !company) {
        return (
            <div className="user-page-container">
                <div className="empty-state glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
                    <Building size={64} style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
                    <h3>{t('companyNotFound') || 'Company not found'}</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        {t('companyNotFoundMsg') || 'This profile does not exist or is not a company account.'}
                    </p>
                    <Button onClick={() => navigate('/companies')}>
                        <ChevronLeft size={18} />
                        {t('backToCompanies') || 'Back to Companies'}
                    </Button>
                </div>
            </div>
        );
    }

    const logoUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(company.name)}&backgroundColor=6366f1`;
    const activeJobs = jobs.filter(j => j.status === 'Active' || !j.status);

    return (
        <div className="company-view-container" dir={dir}>
            {/* Banner */}
            <div className="company-view-banner glass">
                <button className="cv-back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                    {t('back') || 'Back'}
                </button>

                <div className="cv-banner-actions">
                    <button className="cv-icon-btn" onClick={handleShare} title="Share">
                        <Share2 size={18} />
                    </button>
                    {/* Message button — job seekers who have applied to this company */}
                    {isJobSeeker && applicationToCompany && (
                        <button
                            className="cv-follow-btn"
                            onClick={() => navigate(`/messages?applicationId=${applicationToCompany.id}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                            <MessageSquare size={16} />
                            Message
                        </button>
                    )}
                    {/* Follow button — job seekers only */}
                    {isJobSeeker && (
                        <button
                            className={`cv-follow-btn ${isFollowed ? 'followed' : ''}`}
                            onClick={handleFollow}
                        >
                            <Heart size={18} fill={isFollowed ? 'currentColor' : 'none'} />
                            {isFollowed ? t('followed') || 'Following' : t('follow') || 'Follow'}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Layout */}
            <div className="cv-layout">
                {/* Sidebar */}
                <aside className="cv-sidebar">
                    <div className="cv-card glass">
                        <div className="cv-logo-wrapper">
                            <img src={logoUrl} alt={company.name} />
                        </div>

                        <h1 className="cv-company-name">{company.name}</h1>

                        <div className="cv-industry-badge">
                            <Building size={14} />
                            {company.industry || t('notProvided') || 'Not provided'}
                        </div>

                        {/* Quick Stats */}
                        <div className="cv-stats-row">
                            <div className="cv-stat">
                                <span className="cv-stat-num">{activeJobs.length}</span>
                                <span className="cv-stat-lbl">{t('openPositions') || 'Open Jobs'}</span>
                            </div>
                            <div className="cv-stat-divider" />
                            <div className="cv-stat">
                                <span className="cv-stat-num">{company.followerCount || 0}</span>
                                <span className="cv-stat-lbl">{t('followers') || 'Followers'}</span>
                            </div>
                            <div className="cv-stat-divider" />
                            <div className="cv-stat">
                                <span className="cv-stat-num">{company.createdAt ? new Date(company.createdAt).getFullYear() : '—'}</span>
                                <span className="cv-stat-lbl">{t('founded') || 'Since'}</span>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="cv-contact-list">
                            <div className="cv-contact-item">
                                <MapPin size={16} />
                                <span>{company.location || t('notProvided') || 'Not provided'}</span>
                            </div>
                            <div className="cv-contact-item">
                                <Mail size={16} />
                                <span className="cv-text-ellipsis">{company.email}</span>
                            </div>
                            {company.phone ? (
                                <div className="cv-contact-item">
                                    <Phone size={16} />
                                    <span>{company.phone}</span>
                                </div>
                            ) : (
                                <div className="cv-contact-item cv-muted">
                                    <Phone size={16} />
                                    <span>{t('notProvided') || 'Not provided'}</span>
                                </div>
                            )}
                            {company.website ? (
                                <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cv-contact-item cv-link"
                                >
                                    <Globe size={16} />
                                    <span className="cv-text-ellipsis">
                                        {company.website.replace(/^https?:\/\//, '')}
                                    </span>
                                    <ExternalLink size={12} />
                                </a>
                            ) : (
                                <div className="cv-contact-item cv-muted">
                                    <Globe size={16} />
                                    <span>{t('notProvided') || 'Not provided'}</span>
                                </div>
                            )}
                        </div>


                    </div>
                </aside>

                {/* Main Content */}
                <main className="cv-main">
                    {/* About Section */}
                    <section className="cv-section glass">
                        <h2 className="cv-section-title">{t('aboutCompany') || 'About the Company'}</h2>
                        {company.description ? (
                            <p className="cv-description">{company.description}</p>
                        ) : (
                            <p className="cv-description cv-muted-text">
                                {t('noDescription') || 'This company has not provided a description yet.'}
                            </p>
                        )}
                    </section>

                    {/* Jobs Section */}
                    <section id="company-jobs-section" className="cv-section glass">
                        <div className="cv-section-header">
                            <h2 className="cv-section-title">{t('openPositions') || 'Open Positions'}</h2>
                            <span className="cv-badge">{activeJobs.length}</span>
                        </div>

                        <div className="cv-jobs-list">
                            {jobsLoading ? (
                                <Spinner />
                            ) : activeJobs.length > 0 ? (
                                activeJobs.map(job => (
                                    <div
                                        key={job.id}
                                        className="cv-job-item"
                                        onClick={() => navigate(`/jobs/${job.id}`)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={e => e.key === 'Enter' && navigate(`/jobs/${job.id}`)}
                                    >
                                        <div className="cv-job-icon">
                                            <Briefcase size={20} />
                                        </div>
                                        <div className="cv-job-info">
                                            <h3 className="cv-job-title">{job.title}</h3>
                                            <div className="cv-job-meta">
                                                {job.workMode && (
                                                    <span><MapPin size={13} /> {job.workMode}</span>
                                                )}
                                                {job.type && (
                                                    <span><Briefcase size={13} /> {job.type}</span>
                                                )}
                                                {job.location && (
                                                    <span><MapPin size={13} /> {job.location}</span>
                                                )}
                                            </div>
                                        </div>
                                        <ExternalLink size={16} className="cv-job-arrow" />
                                    </div>
                                ))
                            ) : (
                                <div className="cv-empty-jobs">
                                    <Briefcase size={40} />
                                    <p>{t('noJobsFound') || 'No open positions at the moment.'}</p>
                                    <span>{t('checkBackLater') || 'Check back later for new opportunities.'}</span>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default CompanyProfileView;
