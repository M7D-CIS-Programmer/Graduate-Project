import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ChevronLeft, Building, Briefcase, MapPin, DollarSign, Clock, X, Bookmark, Share2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useJob } from '../../hooks/useJobs';
import { useApplyForJob } from '../../hooks/useApplications';
import { formatTimeAgo } from '../../utils/dateUtils';

const JobDetails = () => {
    const { id } = useParams();
    const { t, dir } = useLanguage();
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const { data: job, isLoading, error } = useJob(id);
    const { mutate: applyForJob, isPending: isApplying } = useApplyForJob();

    const isJobSaved = user?.savedJobs?.some(j => j.id === parseInt(id)) || false;
    const isJobApplied = user?.appliedJobs?.some(j => j.id === parseInt(id)) || false;

    const [isSaved, setIsSaved] = useState(isJobSaved);
    const [isApplied, setIsApplied] = useState(isJobApplied);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        coverLetter: '',
        cv: ''
    });

    React.useEffect(() => {
        if (!job) return;
        setIsSaved(user?.savedJobs?.some(j => j.id === job.id) || false);
        setIsApplied(user?.appliedJobs?.some(j => j.id === job.id) || false);
    }, [job, user?.savedJobs, user?.appliedJobs]);

    if (isLoading) return <Spinner />;
    if (error || !job) {
        return (
            <div className="job-details-page">
                <div style={{ textAlign: 'center', padding: '5rem', color: 'white' }}>
                    <h2>{error ? `Error: ${error.message}` : 'Job Not Found'}</h2>
                    <Button onClick={() => navigate('/jobs')} style={{ marginTop: '1rem' }}>
                        Back to Search
                    </Button>
                </div>
            </div>
        );
    }

    const handleSave = () => {
        if (!user) {
            addToast(t('signInToApply') || 'Please sign in to save jobs', 'error');
            return;
        }

        const newSavedJobs = isSaved
            ? user.savedJobs.filter(j => j.id !== job.id)
            : [...(user.savedJobs || []), job];

        updateUser({ savedJobs: newSavedJobs });
        setIsSaved(!isSaved);
    };

    const handleApplyClick = () => {
        if (!user) {
            addToast(t('signInToApply') || 'Please sign in to apply', 'error');
            return;
        }
        if (isApplied) return;
        setIsModalOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApplySubmit = (e) => {
        e.preventDefault();

        if (!user) {
            addToast(t('signInToApply') || 'Please sign in to apply', 'error');
            return;
        }

        if (isApplied) return;

        const appliedDate = new Date().toISOString();
        const applicationData = {
            jobId: job.id,
            userId: user.id || 1,
            applicationDate: appliedDate,
            status: 'New',
            note: formData.coverLetter,
            cv: formData.cv
        };

        applyForJob(applicationData, {
            onSuccess: () => {
                const appliedJobData = { ...job, applicantInfo: formData, appliedDate };
                const newAppliedJobs = [...(user.appliedJobs || []), appliedJobData];

                const newNotification = {
                    id: Date.now(),
                    title: t('appliedSuccess') || 'Application Submitted',
                    message: t('appliedSuccessMsg')
                        ? t('appliedSuccessMsg').replace('{role}', job.title).replace('{company}', job.user?.name || 'Company')
                        : `You successfully applied for ${job.title} at ${job.user?.name || 'Company'}`,
                    time: t('justNow') || 'Just now',
                    type: 'system',
                    unread: true,
                    iconName: 'CheckCircle'
                };
                const newNotifications = [newNotification, ...(user.notifications || [])];

                updateUser({
                    appliedJobs: newAppliedJobs,
                    notifications: newNotifications
                });

                setIsApplied(true);
                setIsModalOpen(false);
                addToast(t('appliedSuccess') || 'Application submitted successfully!', 'success');
            },
            onError: () => {
                addToast('Failed to submit application', 'error');
            }
        });
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        addToast('Job link copied to clipboard!', 'info');
    };

    return (
        <div className="job-details-page">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                {t('back')}
            </button>

            <div className="job-details-grid">
                <main className="main-content">
                    <div className="card glass job-main-card">
                        <div className="job-header-top">
                            <div className="company-info-large">
                                <div className="company-logo-large">
                                    <Building size={32} />
                                </div>
                                <div>
                                    <h1 className="job-title-large">{job.title}</h1>
                                    <p className="company-name-large">{job.user?.name || 'Company'}</p>
                                </div>
                            </div>
                            <div className="job-actions-top">
                                <button
                                    className={`btn-icon-large ${isSaved ? 'saved' : ''}`}
                                    onClick={handleSave}
                                    title={isSaved ? t('saved') : t('saveJob')}
                                >
                                    <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
                                </button>
                                <button className="btn-icon-large" onClick={handleShare} title="Share">
                                    <Share2 size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="job-tags">
                            <span className="tag"><Briefcase size={16} /> {t(job.type.toLowerCase().replace(' ', '')) || job.type}</span>
                            <span className="tag"><MapPin size={16} /> {t(job.workMode.toLowerCase()) || job.workMode}</span>
                            <span className="tag"><DollarSign size={16} /> ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}</span>
                            <span className="tag"><Clock size={16} /> {formatTimeAgo(job.postedDate, t, dir === 'rtl' ? 'ar' : 'en')}</span>
                        </div>

                        <div className="job-description-section">
                            <h3>{t('jobDescription')}</h3>
                            <p>{job.description}</p>
                        </div>

                        {job.responsibilities && (
                            <div className="job-list-section">
                                <h3>{t('responsibilities')}</h3>
                                <p>{job.responsibilities}</p>
                            </div>
                        )}

                        {job.requirements && (
                            <div className="job-list-section">
                                <h3>{t('requirements')}</h3>
                                <p>{job.requirements}</p>
                            </div>
                        )}
                    </div>
                </main>


                <aside className="job-details-sidebar">
                    <div className="card glass sidebar-card">
                        <h3>{t('applyNow')}</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            {t('applySubtitle') || "Interested in this position? Apply directly through our platform."}
                        </p>
                        <Button 
                            className={`btn-full ${isApplied ? 'btn-disabled' : ''}`} 
                            onClick={handleApplyClick}
                            disabled={isApplied}
                        >
                            {isApplied ? (t('alreadyApplied') || 'Already Applied') : t('submitApplication')}
                        </Button>
                        <div className="sidebar-footer-links">
                            <span>{t('securityPolicy')}  ,</span>
                            <span>{t('reportJob')}</span>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Application Modal */}
            {isModalOpen && (
                <div className="application-modal-overlay">
                    <div className="application-modal">
                        <div className="modal-header">
                            <h3>{t('applyFor')} {t(job.title) || job.title}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleApplySubmit} className="application-form">
                            <div className="form-group">
                                <label>{t('fullName') || 'Full Name'}</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleFormChange} 
                                    required 
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('email') || 'Email'}</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleFormChange} 
                                    required 
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('phone') || 'Phone Number'}</label>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleFormChange} 
                                    required 
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('coverLetter') || 'Cover Letter'}</label>
                                <textarea 
                                    name="coverLetter" 
                                    value={formData.coverLetter} 
                                    onChange={handleFormChange} 
                                    rows="4" 
                                    className="form-input"
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>{t('resumeLink') || 'Resume Link / URL'}</label>
                                <input 
                                    type="url" 
                                    name="cv" 
                                    value={formData.cv} 
                                    onChange={handleFormChange} 
                                    placeholder="https://example.com/your-resume.pdf"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-actions">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    {t('cancel') || 'Cancel'}
                                </Button>
                                <Button type="submit" variant="primary">
                                    {t('submit') || 'Submit'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDetails;
