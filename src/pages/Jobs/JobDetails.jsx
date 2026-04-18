import React, { useState } from 'react';
import {
    Briefcase,
    MapPin,
    Clock,
    Building,
    DollarSign,
    Share2,
    Bookmark,
    ChevronLeft,
    CheckCircle,
    X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { mockJobs } from './JobListings';
import './Jobs.css';

const JobDetails = () => {
    const { id } = useParams();
    const { t, dir } = useLanguage();
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const isJobSaved = user?.savedJobs?.some(job => job.id === parseInt(id)) || false;
    const isJobApplied = user?.appliedJobs?.some(job => job.id === parseInt(id)) || false;

    const [isSaved, setIsSaved] = useState(isJobSaved);
    const [isApplied, setIsApplied] = useState(isJobApplied);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        coverLetter: ''
    });

    // Find the specific job based on the URL id
    const specificJob = mockJobs.find(j => j.id === parseInt(id));

    // Optional: handle "not found" state or fallback to a default
    // We'll wrap the structure below.
    const job = specificJob ? {
        ...specificJob,
        // Supplement with missing details that aren't in mockJobs stub
        description: t('jobDescriptionText'),
        responsibilities: [
            t('resp1'),
            t('resp2'),
            t('resp3'),
            t('resp4')
        ],
        requirements: [
            t('req1'),
            t('req2'),
            t('req3'),
            t('req4')
        ]
    } : null;

    if (!job) {
        return (
            <div className="job-details-page">
                <div style={{ textAlign: 'center', padding: '5rem', color: 'white' }}>
                    <h2>Job Not Found</h2>
                    <Button onClick={() => navigate('/jobs')} style={{ marginTop: '1rem' }}>
                        Back to Search
                    </Button>
                </div>
            </div>
        );
    }

    const displayTitle = t(job.title.toLowerCase()) === job.title.toLowerCase() ? job.title : t(job.title.toLowerCase());

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
        const applicationData = { ...job, applicantInfo: formData, appliedDate };
        const newAppliedJobs = [...(user.appliedJobs || []), applicationData];
        
        // Push notification for the user
        const newNotification = {
            id: Date.now(),
            title: t('appliedSuccess') || 'Application Submitted',
            message: t('appliedSuccessMsg')
                ? t('appliedSuccessMsg').replace('{role}', job.title).replace('{company}', job.company)
                : `You successfully applied for ${job.title} at ${job.company}`,
            time: t('justNow') || 'Just now',
            type: 'system',
            unread: true,
            iconName: 'CheckCircle' // Name instead of JSX to serialize in localStorage
        };
        const newNotifications = [newNotification, ...(user.notifications || [])];
        
        updateUser({ 
            appliedJobs: newAppliedJobs,
            notifications: newNotifications
        });
        
        // Push to global applications list for Employer/Admin views
        const allApplications = JSON.parse(localStorage.getItem('allApplications') || '[]');
        allApplications.push({
            id: Date.now(),
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            applicantName: user.name || t('anonymousApplicant') || 'Anonymous Applicant',
            applicantEmail: user.email,
            role: job.title, // Maps role correctly in candidates
            location: user.location || t('unknownLocation') || 'Unknown',
            appliedDate,
            time: t('justNow') || 'Just now',
            status: t('newApplication') || 'New'
        });
        localStorage.setItem('allApplications', JSON.stringify(allApplications));

        setIsApplied(true);
        setIsModalOpen(false);
        addToast(t('appliedSuccess') || 'Application submitted successfully!', 'success');
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
                                    <h1 className="job-title-large">{t(job.title) || job.title}</h1>
                                    <p className="company-name-large">{job.company}</p>
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
                            <span className="tag"><Briefcase size={16} /> {t(job.type) || job.type}</span>
                            <span className="tag"><MapPin size={16} /> {t(job.location) || job.location}</span>
                            <span className="tag"><DollarSign size={16} /> {job.salary}</span>
                            <span className="tag"><Clock size={16} /> {job.time || '1 week ago'}</span>
                        </div>

                        <div className="job-description-section">
                            <h3>{t('jobDescription')}</h3>
                            <p>{job.description}</p>
                        </div>

                        <div className="job-list-section">
                            <h3>{t('responsibilities')}</h3>
                            <ul>
                                {job.responsibilities.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="job-list-section">
                            <h3>{t('requirements')}</h3>
                            <ul>
                                {job.requirements.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
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
