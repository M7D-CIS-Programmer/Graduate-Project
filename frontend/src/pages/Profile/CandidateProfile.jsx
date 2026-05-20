import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
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
    FileText,
    MessageSquare
} from 'lucide-react';
import './User.css';

const CandidateProfile = () => {
    const { id } = useParams();
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const isCompany = currentUser &&
        (currentUser.role?.toLowerCase() === 'company');

    const { data: candidate, isLoading, error } = useQuery({
        queryKey: ['candidate', id],
        queryFn: () => api.getUser(id),
        enabled: !!id && id !== 'undefined'
    });

    // Company: find an existing application from this candidate to any of the company's jobs
    const { data: companyApplications = [] } = useQuery({
        queryKey: ['company-applications-for-candidate', currentUser?.id, id],
        queryFn: () => api.getApplicationsByCompany(currentUser.id),
        enabled: isCompany && !!currentUser?.id,
        staleTime: 60_000,
    });

    const applicationWithCandidate = isCompany
        ? companyApplications.find(a => a.userId === Number(id))
        : null;

    if (isLoading) return <Spinner />;

    if (error || !candidate) {
        return (
            <div className="user-page-container">
                <div className="empty-state glass">
                    <User size={64} className="empty-icon" />
                    <h3>{t('candidateNotFound') || 'Candidate Not Found'}</h3>
                </div>
            </div>
        );
    }

    return (
        <div className={`user-page-container ${dir}`}>
            <div className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 className="dashboard-title">{t('candidateProfile') || 'Candidate Profile'}</h1>
                </div>

                {/* Message button — only shown when the logged-in company has an application from this candidate */}
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
                            {candidate.profilePicture ? (
                                <img src={candidate.profilePicture} alt={candidate.name} />
                            ) : (
                                candidate.name?.charAt(0)
                            )}
                        </div>
                    </div>

                    <h2 className="candidate-name">{candidate.name}</h2>
                    <p className="candidate-role">{candidate.industry || t('jobSeeker')}</p>

                    <div className="candidate-stats">
                        <div className="stat-item">
                            <span className="stat-val">{(candidate.appliedJobs ?? candidate.AppliedJobs)?.length || 0}</span>
                            <span className="stat-lbl">{t('applications') || 'Applications'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-val">{(candidate.resumes ?? candidate.Resumes)?.length || 0}</span>
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
                        {(candidate.linkedIn || candidate.LinkedIn) && (
                            <a href={candidate.linkedIn || candidate.LinkedIn} target="_blank" rel="noreferrer" className="social-btn">
                                <Linkedin size={20} />
                            </a>
                        )}
                        {(candidate.github || candidate.Github) && (
                            <a href={candidate.github || candidate.Github} target="_blank" rel="noreferrer" className="social-btn">
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
                                    <span className="text-main"> {candidate.experienceLevel || candidate.ExperienceLevel || t('notSpecified') || 'Not specified'}</span>
                                </p>
                                {/* Real experiences from resume */}
                                {(() => {
                                    const resumes = candidate.resumes ?? candidate.Resumes ?? [];
                                    const experiences = resumes[0]?.experiences ?? resumes[0]?.Experiences ?? [];
                                    return experiences.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                                            {experiences.map((exp, idx) => (
                                                <div key={idx} style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--primary)' }}>
                                                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem' }}>{exp.jobName}</h4>
                                                    <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                                                        {exp.companyName}
                                                        {exp.startDate ? ` · ${new Date(exp.startDate).getFullYear()} – ${exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}` : ''}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        </section>

                        <section className="dashboard-section glass">
                            <h3 className="section-title">
                                <Globe size={20} />
                                {t('skills') || 'Top Skills'}
                            </h3>
                            <div className="skills-tag-cloud">
                                {(() => {
                                    const resumes = candidate.resumes ?? candidate.Resumes ?? [];
                                    const skills = resumes[0]?.skills ?? resumes[0]?.Skills ?? [];
                                    return skills.length > 0
                                        ? skills.map((skill, index) => (
                                            <span key={index} className="skill-tag">{skill.name ?? skill.Name}</span>
                                        ))
                                        : <p className="text-muted">{t('noSkills') || 'No skills listed.'}</p>;
                                })()}
                            </div>
                        </section>
                    </div>


                </div>
            </div>

        </div>
    );
};

export default CandidateProfile;
