import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import {
    Mail,
    MapPin,
    Briefcase,
    Globe,
    Github,
    Linkedin,
    Phone,
    User,
    Calendar,
    ChevronLeft,
    FileText,
    ExternalLink,
    MessageSquare
} from 'lucide-react';
import './User.css';

const CandidateProfile = () => {
    const { id } = useParams();
    const { t, dir } = useLanguage();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const isEmployer = currentUser &&
        (currentUser.role?.toLowerCase() === 'employer' || currentUser.role?.toLowerCase() === 'company');

    const { data: candidate, isLoading, error } = useQuery({
        queryKey: ['candidate', id],
        queryFn: () => api.getUser(id),
        enabled: !!id && id !== 'undefined'
    });

    // Employer: find an existing application from this candidate to any of the employer's jobs
    const { data: employerApplications = [] } = useQuery({
        queryKey: ['employer-applications-for-candidate', currentUser?.id, id],
        queryFn: () => api.getApplicationsByCompany(currentUser.id),
        enabled: isEmployer && !!currentUser?.id,
        staleTime: 60_000,
    });

    const applicationWithCandidate = isEmployer
        ? employerApplications.find(a => a.userId === Number(id))
        : null;

    if (isLoading) return <Spinner />;

    if (error || !candidate) {
        return (
            <div className="user-page-container">
                <div className="empty-state glass">
                    <User size={64} className="empty-icon" />
                    <h3>{t('candidateNotFound') || 'Candidate Not Found'}</h3>
                    <Button onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
                        {t('back')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`user-page-container ${dir}`}>
            <div className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-icon" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                    </button>
                    <h1 className="dashboard-title">{t('candidateProfile') || 'Candidate Profile'}</h1>
                </div>

                {/* Message button — only shown when the logged-in employer has an application from this candidate */}
                {applicationWithCandidate && (
                    <Button
                        onClick={() => navigate(`/messages?applicationId=${applicationWithCandidate.id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <MessageSquare size={16} />
                        Message
                    </Button>
                )}
            </div>

            <div className="profile-layout">
                {/* Left Sidebar - Info Card */}
                <aside className="profile-card-left glass">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar-large">
                            {candidate.photo ? (
                                <img src={candidate.photo} alt={candidate.name} />
                            ) : (
                                candidate.name?.charAt(0)
                            )}
                        </div>
                    </div>

                    <h2 className="candidate-name">{candidate.name}</h2>
                    <p className="candidate-role">{candidate.industry || t('jobSeeker')}</p>

                    <div className="candidate-stats">
                        <div className="stat-item">
                            <span className="stat-val">{candidate.appliedJobs?.length || 0}</span>
                            <span className="stat-lbl">{t('applications') || 'Applications'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-val">{candidate.resumes?.length || 0}</span>
                            <span className="stat-lbl">{t('resumes') || 'Resumes'}</span>
                        </div>
                    </div>

                    <div className="contact-info-list">
                        <div className="contact-info-item">
                            <Mail size={18} />
                            <span>{candidate.email}</span>
                        </div>
                        {candidate.phone && (
                            <div className="contact-info-item">
                                <Phone size={18} />
                                <span>{candidate.phone}</span>
                            </div>
                        )}
                        {candidate.location && (
                            <div className="contact-info-item">
                                <MapPin size={18} />
                                <span>{candidate.location}</span>
                            </div>
                        )}
                        <div className="contact-info-item">
                            <Calendar size={18} />
                            <span>{t('memberSince') || 'Joined'}: {new Date(candidate.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="social-links-grid">
                        {candidate.linkedIn && (
                            <a href={candidate.linkedIn} target="_blank" rel="noreferrer" className="social-btn">
                                <Linkedin size={20} />
                            </a>
                        )}
                        {candidate.github && (
                            <a href={candidate.github} target="_blank" rel="noreferrer" className="social-btn">
                                <Github size={20} />
                            </a>
                        )}
                        {candidate.website && (
                            <a href={candidate.website} target="_blank" rel="noreferrer" className="social-btn">
                                <Globe size={20} />
                            </a>
                        )}
                    </div>
                </aside>

                {/* Right Content Area */}
                <div className="profile-main-content">
                    {/* Bio Section */}
                    <section className="dashboard-section glass">
                        <h3 className="section-title">
                            <User size={20} />
                            {t('aboutMe')}
                        </h3>
                        <p className="bio-text">
                            {candidate.description || t('noBio') || 'No biography provided yet.'}
                        </p>
                    </section>

                    {/* Education/Experience Summary (Simulated for now, can be expanded) */}
                    <div className="info-grid-two">
                        <section className="dashboard-section glass">
                            <h3 className="section-title">
                                <Briefcase size={20} />
                                {t('experience') || 'Experience'}
                            </h3>
                            <div className="info-summary-card">
                                <p className="text-muted">
                                    {t('experienceLevel') || 'Experience Level'}:
                                    <span className="text-main"> {candidate.experienceLevel || t('notSpecified') || 'Not specified'}</span>
                                </p>
                            </div>
                        </section>

                        <section className="dashboard-section glass">
                            <h3 className="section-title">
                                <Globe size={20} />
                                {t('skills') || 'Top Skills'}
                            </h3>
                            <div className="skills-tag-cloud">
                                {candidate.resumes?.[0]?.skills?.map((skill, index) => (
                                    <span key={index} className="skill-tag">{skill.name}</span>
                                )) || (
                                        <p className="text-muted">{t('noSkills') || 'No skills listed.'}</p>
                                    )}
                            </div>
                        </section>
                    </div>

                    {/* Applications History (Optional visibility for Employer) */}
                    <section className="dashboard-section glass">
                        <h3 className="section-title">
                            <FileText size={20} />
                            {t('resumeOverview') || 'Resume Overview'}
                        </h3>
                        {candidate.resumes?.length > 0 ? (
                            candidate.resumes.map(resume => (
                                <div key={resume.id} className="resume-preview-card">
                                    <div className="resume-icon">
                                        <FileText size={24} />
                                    </div>
                                    <div className="resume-info">
                                        <h4>{resume.title}</h4>
                                        <p>{resume.summary?.substring(0, 100)}...</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/resume/${candidate.id}`)}>
                                        {t('view')}
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">{t('noResumes') || 'No resumes uploaded.'}</p>
                        )}
                    </section>
                </div>
            </div>

        </div>
    );
};

export default CandidateProfile;
