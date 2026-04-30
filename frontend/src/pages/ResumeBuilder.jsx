import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2pdf from 'html2pdf.js';
import {
    User,
    MapPin,
    Briefcase,
    GraduationCap,
    Plus,
    Trash2,
    Phone,
    Mail,
    Languages as LangIcon,
    Download,
    Eye,
    X,
    Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/api';
import './User.css';
import './ResumeBuilder.css';

const ResumeBuilder = () => {
    const { theme } = useTheme();
    const { t, dir } = useLanguage();
    const resumeRef = useRef();
    const [activeStep, setActiveStep] = useState(0);
    const { user } = useAuth();
    const { addToast } = useToast();
    const [resumeId, setResumeId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        personal: { name: '', email: '', phone: '', location: '', about: '' },
        experience: [{ id: Date.now(), title: '', company: '', start: '', end: '', description: '' }],
        education: [{ id: Date.now(), degree: '', school: '', year: '' }],
        skills: []
    });

    useEffect(() => {
        if (user?.id) {
            fetchResume();
        }
    }, [user?.id]);

    const fetchResume = async () => {
        try {
            const data = await api.getResumeByUserId(user.id);
            if (data) {
                setResumeId(data.id);
                setFormData({
                    personal: {
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        location: data.location || '',
                        about: data.bio || ''
                    },
                    experience: data.experiences.length > 0 
                        ? data.experiences.map(e => ({
                            id: e.id,
                            title: e.jobName,
                            company: e.companyName,
                            start: e.startDate,
                            end: e.endDate,
                            description: '' // Backend doesn't have description yet, but we'll keep it for UI
                        }))
                        : [{ id: Date.now(), title: '', company: '', start: '', end: '', description: '' }],
                    education: data.educations.length > 0
                        ? data.educations.map(e => ({
                            id: e.id,
                            degree: e.educationLevel,
                            school: e.institution,
                            year: e.graduationYear.toString()
                        }))
                        : [{ id: Date.now(), degree: '', school: '', year: '' }],
                    skills: data.skills.map(s => s.name)
                });
            }
        } catch (err) {
            // Ignore 404 as it just means the user hasn't created a resume yet
            if (!err.message.includes("404") && !err.message.includes("Not Found")) {
                console.error("Failed to fetch resume:", err);
            }
        }
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            const payload = {
                userId: user.id,
                name: formData.personal.name,
                email: formData.personal.email,
                phone: formData.personal.phone,
                location: formData.personal.location,
                bio: formData.personal.about,
                experiences: formData.experience.map(e => ({
                    jobName: e.title,
                    companyName: e.company,
                    startDate: e.start,
                    endDate: e.end
                })),
                educations: formData.education.map(e => ({
                    educationLevel: e.degree,
                    institution: e.school,
                    graduationYear: parseInt(e.year) || 0
                })),
                skills: formData.skills.map(s => ({ name: s }))
            };

            if (resumeId) {
                await api.updateResume(resumeId, payload);
                addToast(t('resumeUpdated') || 'Resume updated successfully!', 'success');
            } else {
                const res = await api.createResume(payload);
                setResumeId(res.id);
                addToast(t('resumeSaved') || 'Resume saved successfully!', 'success');
            }
        } catch (err) {
            console.error("Failed to save resume:", err);
            addToast(t('saveFailed') || 'Failed to save resume.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);

    const parseMonthYear = (str) => {
        if (!str || str === 'Present') return { month: '', year: '' };
        const [y, m] = str.split('-');
        return { month: parseInt(m) - 1, year: y };
    };

    const steps = [
        { title: t('personalInfo'), icon: <User size={20} /> },
        { title: t('experience'), icon: <Briefcase size={20} /> },
        { title: t('education'), icon: <GraduationCap size={20} /> },
    ];

    const addExperience = () => {
        setFormData({
            ...formData,
            experience: [...formData.experience, { id: Date.now(), title: '', company: '', start: '', end: '', description: '' }]
        });
    };

    const removeExperience = (id) => {
        setFormData({
            ...formData,
            experience: formData.experience.filter(exp => exp.id !== id)
        });
    };

    const addEducation = () => {
        setFormData({
            ...formData,
            education: [...formData.education, { id: Date.now(), degree: '', school: '', year: '' }]
        });
    };

    const removeEducation = (id) => {
        setFormData({
            ...formData,
            education: formData.education.filter(edu => edu.id !== id)
        });
    };

    const [newSkill, setNewSkill] = useState('');
    const addSkill = (e) => {
        e.preventDefault();
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(skill => skill !== skillToRemove)
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        if (dateStr === 'Present') return t('present') || 'Present';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(dir === 'rtl' ? 'ar-EG' : 'en-US', { 
                month: 'short', 
                year: 'numeric' 
            });
        } catch (e) {
            return dateStr;
        }
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let currentY = 20;

        // Colors
        const primaryColor = [37, 99, 235]; // #2563eb
        const textColor = [31, 41, 55]; // #1f2937
        const secondaryTextColor = [107, 114, 128]; // #6b7280

        // Helper: Draw line
        const drawSeparator = (y) => {
            doc.setDrawColor(229, 231, 235);
            doc.line(margin, y, pageWidth - margin, y);
        };

        // Header: Name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(...primaryColor);
        doc.text(formData.personal.name || t('yourName'), margin, currentY);
        currentY += 10;

        // Contact Info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...secondaryTextColor);
        const contactLine = [
            formData.personal.email,
            formData.personal.phone,
            formData.personal.location
        ].filter(Boolean).join(' | ');
        doc.text(contactLine, margin, currentY);
        currentY += 10;

        drawSeparator(currentY);
        currentY += 10;

        // About Me
        if (formData.personal.about) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(...primaryColor);
            doc.text(t('aboutMe').toUpperCase(), margin, currentY);
            currentY += 7;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(...textColor);
            const aboutLines = doc.splitTextToSize(formData.personal.about, pageWidth - 2 * margin);
            doc.text(aboutLines, margin, currentY);
            currentY += (aboutLines.length * 5) + 10;
        }

        // Experience Section
        if (formData.experience.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(...primaryColor);
            doc.text(t('experience').toUpperCase(), margin, currentY);
            currentY += 7;

            formData.experience.forEach(exp => {
                // Job Title & Dates
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(...textColor);
                doc.text(exp.title || t('rolePlaceholder'), margin, currentY);
                
                const dates = `${formatDate(exp.start)} - ${formatDate(exp.end)}`;
                const datesWidth = doc.getTextWidth(dates);
                doc.text(dates, pageWidth - margin - datesWidth, currentY);
                currentY += 5;

                // Company
                doc.setFont("helvetica", "italic");
                doc.setFontSize(10);
                doc.setTextColor(...secondaryTextColor);
                doc.text(exp.company || t('companyPlaceholder'), margin, currentY);
                currentY += 10;

                // Description would go here if we had it
            });
            currentY += 5;
        }

        // Education Section
        if (formData.education.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(...primaryColor);
            doc.text(t('education').toUpperCase(), margin, currentY);
            currentY += 7;

            formData.education.forEach(edu => {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(...textColor);
                doc.text(edu.degree || t('degree'), margin, currentY);
                
                const year = edu.year;
                const yearWidth = doc.getTextWidth(year);
                doc.text(year, pageWidth - margin - yearWidth, currentY);
                currentY += 5;

                doc.setFont("helvetica", "italic");
                doc.setFontSize(10);
                doc.setTextColor(...secondaryTextColor);
                doc.text(edu.school || t('institution'), margin, currentY);
                currentY += 10;
            });
            currentY += 5;
        }

        // Skills Section
        if (formData.skills.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(...primaryColor);
            doc.text(t('skills').toUpperCase(), margin, currentY);
            currentY += 7;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(...textColor);
            
            const skillsText = formData.skills.join(', ');
            const skillsLines = doc.splitTextToSize(skillsText, pageWidth - 2 * margin);
            doc.text(skillsLines, margin, currentY);
        }

        doc.save(`${formData.personal.name || 'Resume'}.pdf`);
    };

    return (
        <div className={`user-page-container ${dir}`}>
            <div className="dashboard-header">
                <h1 className="dashboard-title">{t('resumeBuilder')}</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? t('saving') || 'Saving...' : t('saveResume') || 'Save Resume'}
                    </Button>
                    <Button onClick={handleDownloadPDF}>
                        <Download size={20} />
                        {t('downloadPdf')}
                    </Button>
                </div>
            </div>

            <div className="resume-builder-layout">
                {/* Form Sections */}
                <div className="form-sections-container">
                    <div className="dashboard-section">
                        <div className="steps-tabs">
                            {steps.map((step, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveStep(i)}
                                    className={`step-tab ${activeStep === i ? 'active' : ''}`}
                                >
                                    {step.icon}
                                    {step.title}
                                </button>
                            ))}
                        </div>

                        {activeStep === 0 && (
                            <div className="form-grid">
                                <Input label={t('fullName')} placeholder={t('resumeNamePlaceholder')} value={formData.personal.name} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, name: e.target.value } })} icon={User} />
                                <Input label={t('email')} placeholder={t('resumeEmailPlaceholder')} value={formData.personal.email} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, email: e.target.value } })} icon={Mail} />
                                <Input label={t('phone')} placeholder={t('resumePhonePlaceholder')} value={formData.personal.phone} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, phone: e.target.value } })} icon={Phone} />
                                <div className="input-group">
                                    <label className="input-label input-label-with-icon">
                                        <MapPin size={16} /> {t('locationPlaceholder')}
                                    </label>
                                    <select
                                        className="custom-select"
                                        value={formData.personal.location}
                                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, location: e.target.value } })}
                                    >
                                        <option value="" className="select-option">
                                            {t('selectLocation') || 'Select Location'}
                                        </option>
                                        {['Amman', 'Irbid', 'Zarqa', 'Balqa', 'Madaba', 'Karak', 'Tafilah', 'Ma\'an', 'Aqaba', 'Mafraq', 'Jerash', 'Ajloun'].map(city => (
                                            <option 
                                                key={city} 
                                                value={city} 
                                                className="select-option"
                                            >
                                                {t(city.toLowerCase().replace("'", ''))}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="span-full">
                                    <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem' }}>{t('aboutMe')}</label>
                                    <textarea
                                        className="resume-textarea"
                                        placeholder={t('resumeAboutPlaceholder')}
                                        value={formData.personal.about}
                                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, about: e.target.value } })}
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {activeStep === 1 && (
                            <div className="form-sections-container">
                                {formData.experience.map((exp, idx) => (
                                    <div key={exp.id} className="entry-card">
                                        {formData.experience.length > 1 && (
                                            <button 
                                                className="remove-entry-btn"
                                                onClick={() => removeExperience(exp.id)} 
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <div className="form-grid">
                                            <Input label={t('jobTitle')} placeholder={t('resumeRolePlaceholder')} value={exp.title} onChange={(e) => {
                                                const newExp = [...formData.experience];
                                                newExp[idx].title = e.target.value;
                                                setFormData({ ...formData, experience: newExp });
                                            }} />
                                            <Input label={t('companyName')} placeholder={t('resumeCompanyPlaceholder')} value={exp.company} onChange={(e) => {
                                                const newExp = [...formData.experience];
                                                newExp[idx].company = e.target.value;
                                                setFormData({ ...formData, experience: newExp });
                                            }} />
                                            <div className="input-group">
                                                <label className="input-label">{t('startDate')}</label>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <select 
                                                        className="resume-input custom-select" 
                                                        style={{ flex: 2 }}
                                                        value={parseMonthYear(exp.start).month}
                                                        onChange={(e) => {
                                                            const { year } = parseMonthYear(exp.start);
                                                            const newMonth = e.target.value.padStart(2, '0');
                                                            const newExp = [...formData.experience];
                                                            newExp[idx].start = `${year || new Date().getFullYear()}-${parseInt(newMonth) + 1}`;
                                                            setFormData({ ...formData, experience: newExp });
                                                        }}
                                                    >
                                                        <option value="">{t('month') || 'Month'}</option>
                                                        {months.map((m, i) => (
                                                            <option key={m} value={i}>{t(m.toLowerCase()) || m}</option>
                                                        ))}
                                                    </select>
                                                    <select 
                                                        className="resume-input custom-select" 
                                                        style={{ flex: 1 }}
                                                        value={parseMonthYear(exp.start).year}
                                                        onChange={(e) => {
                                                            const { month } = parseMonthYear(exp.start);
                                                            const newExp = [...formData.experience];
                                                            newExp[idx].start = `${e.target.value}-${(month === '' ? 0 : month) + 1}`;
                                                            setFormData({ ...formData, experience: newExp });
                                                        }}
                                                    >
                                                        <option value="">{t('year') || 'Year'}</option>
                                                        {years.map(y => (
                                                            <option key={y} value={y}>{y}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <label className="input-label">{t('endDate')}</label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={exp.end === 'Present'}
                                                            onChange={(e) => {
                                                                const newExp = [...formData.experience];
                                                                newExp[idx].end = e.target.checked ? 'Present' : '';
                                                                setFormData({ ...formData, experience: newExp });
                                                            }}
                                                        />
                                                        {t('currentlyWorkHere') || 'Present'}
                                                    </label>
                                                </div>
                                                {exp.end !== 'Present' ? (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <select 
                                                            className="resume-input custom-select" 
                                                            style={{ flex: 2 }}
                                                            value={parseMonthYear(exp.end).month}
                                                            onChange={(e) => {
                                                                const { year } = parseMonthYear(exp.end);
                                                                const newMonth = e.target.value.padStart(2, '0');
                                                                const newExp = [...formData.experience];
                                                                newExp[idx].end = `${year || new Date().getFullYear()}-${parseInt(newMonth) + 1}`;
                                                                setFormData({ ...formData, experience: newExp });
                                                            }}
                                                        >
                                                            <option value="">{t('month') || 'Month'}</option>
                                                            {months.map((m, i) => (
                                                                <option key={m} value={i}>{t(m.toLowerCase()) || m}</option>
                                                            ))}
                                                        </select>
                                                        <select 
                                                            className="resume-input custom-select" 
                                                            style={{ flex: 1 }}
                                                            value={parseMonthYear(exp.end).year}
                                                            onChange={(e) => {
                                                                const { month } = parseMonthYear(exp.end);
                                                                const newExp = [...formData.experience];
                                                                newExp[idx].end = `${e.target.value}-${(month === '' ? 0 : month) + 1}`;
                                                                setFormData({ ...formData, experience: newExp });
                                                            }}
                                                        >
                                                            <option value="">{t('year') || 'Year'}</option>
                                                            {years.map(y => (
                                                                <option key={y} value={y}>{y}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <input 
                                                        type="text" 
                                                        className="resume-input" 
                                                        value={t('present') || 'Present'} 
                                                        disabled 
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="secondary" onClick={addExperience}><Plus size={18} /> {t('addExperience')}</Button>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="form-sections-container">
                                {formData.education.map((edu, idx) => (
                                    <div key={edu.id} className="entry-card">
                                        {formData.education.length > 1 && (
                                            <button 
                                                className="remove-entry-btn"
                                                onClick={() => removeEducation(edu.id)} 
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <div className="form-grid">
                                            <Input label={t('degree')} placeholder={t('degreePlaceholder')} value={edu.degree} onChange={(e) => {
                                                const newEdu = [...formData.education];
                                                newEdu[idx].degree = e.target.value;
                                                setFormData({ ...formData, education: newEdu });
                                            }} />
                                            <Input label={t('institution')} placeholder={t('institutionPlaceholder')} value={edu.school} onChange={(e) => {
                                                const newEdu = [...formData.education];
                                                newEdu[idx].school = e.target.value;
                                                setFormData({ ...formData, education: newEdu });
                                            }} />
                                            <Input 
                                                label={t('graduationYear')} 
                                                type="number" 
                                                placeholder="2024" 
                                                className="no-arrows"
                                                value={edu.year} 
                                                onChange={(e) => {
                                                    const newEdu = [...formData.education];
                                                    newEdu[idx].year = e.target.value;
                                                    setFormData({ ...formData, education: newEdu });
                                                }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button variant="secondary" onClick={addEducation}><Plus size={18} /> {t('addEducation')}</Button>

                                <div className="skills-manager">
                                    <h3 className="section-title-small">{t('skills')}</h3>
                                    <form onSubmit={addSkill} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <Input
                                                placeholder={t('skillPlaceholder')}
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                            />
                                        </div>
                                        <Button type="submit" style={{ height: '48px' }}>{t('addSkill')}</Button>
                                    </form>
                                    <div className="skills-list">
                                        {formData.skills.map((skill) => (
                                            <span key={skill} className="skill-tag">
                                                {skill}
                                                <button 
                                                    className="remove-skill-btn"
                                                    onClick={() => removeSkill(skill)} 
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Preview */}
                <aside className="preview-aside">
                    <div className="dashboard-section" style={{ height: 'fit-content' }}>
                        <h2 className="section-title"><Eye size={20} className="text-primary" /> {t('livePreview')}</h2>
                        <div 
                            ref={resumeRef}
                            className="resume-preview-sheet"
                        >
                            <header className="preview-header" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                                <h1 className="preview-name">{formData.personal.name || t('yourName')}</h1>
                                <p className="preview-contact">{formData.personal.email || t('emailExample')} | {formData.personal.phone || t('phone')}</p>
                                <p className="preview-contact">{formData.personal.location || t('locationPlaceholder')}</p>
                            </header>

                            {formData.personal.about && (
                                <section className="preview-section" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                                    <h3 className="preview-section-title">{t('aboutMe')}</h3>
                                    <p className="preview-about-text">{formData.personal.about}</p>
                                </section>
                            )}

                            <section className="preview-section" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                                <h3 className="preview-section-title">
                                    <Briefcase size={14} /> {t('experience')}
                                </h3>
                                {formData.experience.map(exp => (
                                    <div key={exp.id} className="preview-entry">
                                        <div className="preview-entry-header">
                                            <span>{exp.title || t('rolePlaceholder')}</span>
                                            <span style={{ color: 'var(--primary)' }}>{formatDate(exp.start)} - {formatDate(exp.end)}</span>
                                        </div>
                                        <p className="preview-entry-subtitle">{exp.company || t('companyPlaceholder')}</p>
                                    </div>
                                ))}
                            </section>

                            <section className="preview-section" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                                <h3 className="preview-section-title">
                                    <GraduationCap size={14} /> {t('education')}
                                </h3>
                                {formData.education.map(edu => (
                                    <div key={edu.id} className="preview-entry">
                                        <div className="preview-entry-header">
                                            <span>{edu.degree || t('degree')}</span>
                                            <span style={{ color: 'var(--primary)' }}>{edu.year}</span>
                                        </div>
                                        <p className="preview-entry-subtitle">{edu.school || t('institution')}</p>
                                    </div>
                                ))}
                            </section>

                            <section style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                                <h3 className="preview-section-title">
                                    <LangIcon size={14} /> {t('skills')}
                                </h3>
                                <div className="preview-skills-list">
                                    {formData.skills.map(skill => (
                                        <span key={skill} className="preview-skill-item">{skill}</span>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ResumeBuilder;
