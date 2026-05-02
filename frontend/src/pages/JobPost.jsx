import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Building2,
    FileText,
    Plus,
    LayoutDashboard
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './JobPost.css';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCreateJob, useUpdateJob, useJob } from '../hooks/useJobs';
import { useDepartments } from '../hooks/useDepartments';

export default function JobPost() {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('editId');
    const createJobMutation = useCreateJob();
    const updateJobMutation = useUpdateJob();
    const { data: editJobData } = useJob(editId);
    const { data: departments = [] } = useDepartments();

    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        departmentId: '',
        type: 'Full-time',
        workMode: 'On-site',
        location: '',
        salaryMin: '',
        salaryMax: '',
        isNegotiable: false,
        description: '',
        responsibilities: '',
        requirements: '',
        benefits: ''
    });

    useEffect(() => {
        if (editId && editJobData) {
            setFormData({
                title: editJobData.title || '',
                company: editJobData.company || '',
                departmentId: editJobData.departmentId || '',
                type: editJobData.type || 'Full-time',
                workMode: editJobData.workMode || 'On-site',
                location: editJobData.location || '',
                salaryMin: editJobData.salaryMin || '',
                salaryMax: editJobData.salaryMax || '',
                isNegotiable: editJobData.isSalaryNegotiable || false,
                description: editJobData.description || '',
                responsibilities: editJobData.responsibilities || '',
                requirements: editJobData.requirements || '',
                benefits: editJobData.features || ''
            });
        }
    }, [editId, editJobData]);

    const jordanCities = ['Amman', 'Irbid', 'Zarqa', 'Balqa', 'Madaba', 'Karak', 'Tafilah', 'Ma\'an', 'Aqaba', 'Mafraq', 'Jerash', 'Ajloun'];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handlePrev = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step < 3) {
            handleNext();
            return;
        }

        try {
            // Find department ID by name
            const departmentObj = departments.find(d => d.name === formData.departmentId || d.id.toString() === formData.departmentId);

            // Map frontend data to backend model
            const jobData = {
                userId: user?.id || 1,
                title: formData.title,
                description: formData.description,
                type: formData.type,
                workMode: formData.workMode,
                responsibilities: formData.responsibilities,
                requirements: formData.requirements,
                departmentId: parseInt(formData.departmentId),
                isSalaryNegotiable: formData.isNegotiable,
                salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
                salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
                features: formData.benefits,
                status: 'Active',
                location: formData.location,
                company: formData.company
            };

            if (editId) {
                await updateJobMutation.mutateAsync({ id: editId, job: jobData });
            } else {
                await createJobMutation.mutateAsync(jobData);
            }
            setIsSubmitted(true);
            window.scrollTo(0, 0);
        } catch (err) {
            console.error('Failed to post job:', err);
            alert(t('actionFailed') || 'Failed to post job. Please try again.');
        }
    };

    if (isSubmitted) {
        return (
            <div className={`job-post-container ${dir}`}>
                <div className="job-post-card success-card glass">
                    <div className="success-icon">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2>{editId ? t('jobUpdatedSuccess') || 'Job Updated Successfully!' : t('jobPostedSuccess')}</h2>
                    <p>{editId ? '' : t('jobPostedSubtitle')}</p>

                    <div className="success-actions">
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/dashboard/employer')}
                        >
                            <LayoutDashboard size={20} />
                            {t('goToDashboard')}
                        </button>
                        <button
                            className="btn-primary"
                            onClick={() => {
                                setIsSubmitted(false);
                                setStep(1);
                                setFormData({
                                    title: '',
                                    company: '',
                                    departmentId: '',
                                    type: 'Full-time',
                                    workMode: 'On-site',
                                    location: '',
                                    salaryMin: '',
                                    salaryMax: '',
                                    isNegotiable: false,
                                    description: '',
                                    responsibilities: '',
                                    requirements: '',
                                    benefits: ''
                                });
                            }}
                        >
                            <Plus size={20} />
                            {t('createAnother')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`job-post-container ${dir}`}>
            <div className="job-post-header">
                <h1>{editId ? (t('editJobHeader') || 'Edit Job') : t('postJobHeader')}</h1>
                <p>{editId ? '' : t('postJobSubtitle')}</p>
            </div>

            {/* Stepper */}
            <div className="post-stepper">
                <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <div className="step-number">{step > 1 ? <CheckCircle2 size={20} /> : '1'}</div>
                    <span className="step-label">{t('step1')}</span>
                </div>
                <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <div className="step-number">{step > 2 ? <CheckCircle2 size={20} /> : '2'}</div>
                    <span className="step-label">{t('step2')}</span>
                </div>
                <div className={`step ${step >= 3 ? 'active' : ''}`}>
                    <div className="step-number">3</div>
                    <span className="step-label">{t('step3')}</span>
                </div>
            </div>

            <div className="job-post-card glass">
                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>{t('jobTitle')}</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder={t('jobTitlePlaceholder')}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('companyName')}</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder={t('companyPlaceholder')}
                                    required
                                />
                            </div>
                             <div className="form-group">
                                <label>{t('department')}</label>
                                <select
                                    name="departmentId"
                                    value={formData.departmentId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">{t('selectDepartment')}</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('jobType')}</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                >
                                    <option value="Full-time">{t('fullTime')}</option>
                                    <option value="Part-time">{t('partTime')}</option>
                                    <option value="Contract">{t('contract')}</option>
                                    <option value="Remote">{t('remote')}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('workMode') || 'Work Mode'}</label>
                                <select
                                    name="workMode"
                                    value={formData.workMode}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="On-site">{t('onSite') || 'On-site'}</option>
                                    <option value="Remote">{t('remote') || 'Remote'}</option>
                                    <option value="Hybrid">{t('hybrid') || 'Hybrid'}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('locationPlaceholder')}</label>
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">{t('selectLocation') || 'Select Location'}</option>
                                    {jordanCities.map(city => (
                                        <option key={city} value={city}>{t(city.toLowerCase().replace("'", ''))}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('minSalary') || 'Minimum Salary'}</label>
                                <input
                                    type="number"
                                    name="salaryMin"
                                    value={formData.salaryMin}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 2000"
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('maxSalary') || 'Maximum Salary'}</label>
                                <input
                                    type="number"
                                    name="salaryMax"
                                    value={formData.salaryMax}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 3500"
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    name="isNegotiable"
                                    id="negotiable"
                                    checked={formData.isNegotiable}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="negotiable">{t('salaryNegotiable')}</label>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>{t('jobDescription')}</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder={t('jobDescriptionPlaceholder')}
                                    required
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>{t('responsibilities')}</label>
                                <textarea
                                    name="responsibilities"
                                    value={formData.responsibilities}
                                    onChange={handleInputChange}
                                    placeholder={t('responsibilitiesPlaceholder')}
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>{t('requirements')}</label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleInputChange}
                                    placeholder={t('requirementsPlaceholder')}
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>{t('benefits')}</label>
                                <textarea
                                    name="benefits"
                                    value={formData.benefits}
                                    onChange={handleInputChange}
                                    placeholder={t('benefitsPlaceholder')}
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="review-area">
                            <div className="review-section">
                                <h3>{t('step1')}</h3>
                                <div className="review-grid">
                                    <div className="review-item">
                                        <label>{t('jobTitle')}</label>
                                        <span>{formData.title}</span>
                                    </div>
                                    <div className="review-item">
                                        <label>{t('companyName')}</label>
                                        <span>{formData.company}</span>
                                    </div>
                                    <div className="review-item">
                                        <label>{t('department')}</label>
                                        <span>{departments.find(d => d.id.toString() === formData.departmentId)?.name || formData.departmentId}</span>
                                    </div>
                                    <div className="review-item">
                                        <label>{t('jobType')}</label>
                                        <span>{formData.type}</span>
                                    </div>
                                    <div className="review-item">
                                        <label>{t('workMode') || 'Work Mode'}</label>
                                        <span>{formData.workMode}</span>
                                    </div>
                                    <div className="review-item">
                                        <label>{t('locationPlaceholder')}</label>
                                        <span>{formData.location}</span>
                                    </div>
                                    <div className="review-item">
                                        <label>{t('salaryRange')}</label>
                                        <span>${formData.salaryMin} - ${formData.salaryMax} {formData.isNegotiable ? `(${t('salaryNegotiable')})` : ''}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="review-section">
                                <h3>{t('step2')}</h3>
                                <div className="review-grid" style={{ display: 'block' }}>
                                    <div className="review-item" style={{ marginBottom: '1.5rem' }}>
                                        <label>{t('jobDescription')}</label>
                                        <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{formData.description}</p>
                                    </div>
                                    <div className="review-item" style={{ marginBottom: '1.5rem' }}>
                                        <label>{t('responsibilities')}</label>
                                        <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{formData.responsibilities}</p>
                                    </div>
                                    <div className="review-item" style={{ marginBottom: '1.5rem' }}>
                                        <label>{t('requirements')}</label>
                                        <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{formData.requirements}</p>
                                    </div>
                                    <div className="review-item">
                                        <label>{t('benefits')}</label>
                                        <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{formData.benefits}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        {step > 1 ? (
                            <button type="button" className="btn-primary" style={{ background: 'var(--primary)', boxShadow: 'none' }} onClick={handlePrev}>
                                <ChevronLeft size={20} /> {t('back')}
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {step < 3 && (
                            <button type="button" className="btn-primary" onClick={handleNext}>
                                {t('nextStep') || "Next"} <ChevronRight size={20} />
                            </button>
                        )}
                        {step === 3 && (
                            <button type="submit" className="btn-primary">
                                <CheckCircle2 size={20} /> {editId ? (t('saveChanges') || 'Save Changes') : t('publishJob')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

