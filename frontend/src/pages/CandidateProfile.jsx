import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/api';
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
    ExternalLink
} from 'lucide-react';
import './User.css';

const CandidateProfile = () => {
    const { id } = useParams();
    const { t, dir } = useLanguage();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const { data: candidate, isLoading, error } = useQuery({
        queryKey: ['candidate', id],
        queryFn: () => api.getUser(id)
    });

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
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="outline" onClick={() => window.print()}>
                        <FileText size={18} />
                        {t('printCV') || 'Print Profile'}
                    </Button>
                    <Button onClick={() => navigate(`/resume/${id}`)}>
                        <ExternalLink size={18} />
                        {t('viewFullResume') || 'View Resume'}
                    </Button>
                </div>
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

            <style jsx>{`
                .candidate-name {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-top: 1rem;
                    color: var(--text-main);
                }
                .candidate-role {
                    color: var(--primary);
                    font-weight: 500;
                    margin-bottom: 1.5rem;
                }
                .candidate-stats {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    margin-bottom: 2rem;
                    padding: 1rem;
                    border-top: 1px solid var(--border-color);
                    border-bottom: 1px solid var(--border-color);
                }
                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .stat-val {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .stat-lbl {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }
                .contact-info-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                    margin-bottom: 2rem;
                }
                .contact-info-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                .social-links-grid {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    width: 100%;
                }
                .social-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-main);
                    transition: all 0.3s ease;
                }
                .social-btn:hover {
                    background: var(--primary);
                    color: white;
                    transform: translateY(-3px);
                }
                .profile-main-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .bio-text {
                    line-height: 1.6;
                    color: var(--text-muted);
                }
                .info-grid-two {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .skills-tag-cloud {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .skill-tag {
                    padding: 0.4rem 0.8rem;
                    background: var(--primary-light);
                    color: var(--primary);
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .resume-preview-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(255,255,255,0.03);
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                }
                .resume-info {
                    flex: 1;
                }
                .resume-info h4 {
                    margin-bottom: 0.25rem;
                }
                .resume-info p {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
};

export default CandidateProfile;
