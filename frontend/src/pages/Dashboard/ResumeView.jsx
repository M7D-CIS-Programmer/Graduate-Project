import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Briefcase, 
    GraduationCap, 
    Download,
    Calendar,
    Award
} from 'lucide-react';
import { api } from '../../api/api';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import './Dashboard.css';

const ResumeView = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { t, dir } = useLanguage();
    const { addToast } = useToast();
    const { user: currentUser } = useAuth();
    const [resume, setResume] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const data = await api.getResumeByUserId(userId, currentUser?.id);
                setResume(data);
            } catch (err) {
                console.error('Error fetching resume:', err);
                addToast('Could not load candidate resume.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) fetchResume();
    }, [userId, addToast]);

    if (isLoading) return <Spinner />;

    if (!resume) {
        return (
            <div className="dashboard-container" style={{ textAlign: 'center', padding: '100px 0' }}>
                <h2 style={{ color: 'var(--text-muted)' }}>No resume data available for this candidate.</h2>
                <Button onClick={() => navigate(-1)} style={{ marginTop: '1.5rem' }}>
                    <ChevronLeft size={20} />
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className={`dashboard-container ${dir}`}>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1 className="dashboard-title">{resume.name}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Dynamic Resume View</p>
                    </div>
                </div>
            </div>

            <div className="resume-view-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Left Column: Personal Info & Skills */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section className="dashboard-section card glass" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div className="profile-avatar-large" style={{ margin: '0 auto 1.5rem', width: '120px', height: '120px', fontSize: '3rem' }}>
                            {resume.name.charAt(0)}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{resume.name}</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                <Mail size={18} className="text-primary" />
                                <span>{resume.email}</span>
                            </div>
                            {resume.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                    <Phone size={18} className="text-primary" />
                                    <span>{resume.phone}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                <MapPin size={18} className="text-primary" />
                                <span>{resume.location || 'Location Not Set'}</span>
                            </div>
                        </div>
                    </section>

                    <section className="dashboard-section card glass" style={{ padding: '1.5rem' }}>
                        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Award size={20} className="text-primary" />
                            {t('skills') || 'Skills'}
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {resume.skills.length > 0 ? resume.skills.map(skill => (
                                <span key={skill.id} className="skill-tag" style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    borderRadius: '20px',
                                    color: 'var(--primary)',
                                    fontSize: '0.85rem'
                                }}>
                                    {skill.name}
                                </span>
                            )) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No skills listed.</p>
                            )}
                        </div>
                    </section>
                </aside>

                {/* Right Column: Bio, Experience, Education */}
                <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {resume.bio && (
                        <section className="dashboard-section card glass" style={{ padding: '2rem' }}>
                            <h3 className="section-title" style={{ marginBottom: '1rem' }}>{t('aboutMe') || 'About Me'}</h3>
                            <p style={{ lineHeight: '1.7', color: 'var(--text-muted)' }}>{resume.bio}</p>
                        </section>
                    )}

                    <section className="dashboard-section card glass" style={{ padding: '2rem' }}>
                        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                            <Briefcase size={20} className="text-primary" />
                            {t('experience') || 'Experience'}
                        </h3>
                        <div className="resume-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {resume.experiences.length > 0 ? resume.experiences.map((exp, idx) => (
                                <div key={exp.id} className="timeline-item" style={{
                                    position: 'relative',
                                    paddingLeft: '2rem',
                                    borderLeft: idx === resume.experiences.length - 1 ? 'none' : '2px solid var(--border-color)'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '-9px',
                                        top: '0',
                                        width: '16px',
                                        height: '16px',
                                        background: 'var(--primary)',
                                        borderRadius: '50%',
                                        border: '4px solid var(--bg-card)'
                                    }}></div>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{exp.jobName}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                        <span>{exp.companyName}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - 
                                                {exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: 'var(--text-muted)' }}>No experience listed.</p>
                            )}
                        </div>
                    </section>

                    <section className="dashboard-section card glass" style={{ padding: '2rem' }}>
                        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                            <GraduationCap size={20} className="text-primary" />
                            {t('education') || 'Education'}
                        </h3>
                        <div className="resume-education-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {resume.educations.length > 0 ? resume.educations.map(edu => (
                                <div key={edu.id} style={{
                                    padding: '1.5rem',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{edu.educationLevel} in Field</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{edu.institution}</p>
                                        <span style={{ 
                                            background: 'rgba(99, 102, 241, 0.1)', 
                                            color: 'var(--primary)', 
                                            padding: '0.25rem 0.75rem', 
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            Class of {edu.graduationYear}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: 'var(--text-muted)' }}>No education history listed.</p>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default ResumeView;
