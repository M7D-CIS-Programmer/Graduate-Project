import React, { useState, useRef } from 'react';
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
import './User.css';

const ResumeBuilder = () => {
    const { theme } = useTheme();
    const { t, dir } = useLanguage();
    const resumeRef = useRef();
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        personal: { name: '', email: '', phone: '', location: '', about: '' },
        experience: [{ id: 1, title: '', company: '', start: '', end: '', description: '' }],
        education: [{ id: 1, degree: '', school: '', year: '' }],
        skills: ['React', 'JavaScript', 'Design']
    });

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

    const handleDownloadPDF = () => {
        const element = resumeRef.current;
        const opt = {
            margin: 10,
            filename: `${formData.personal.name || 'Resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save();
    };

    return (
        <div className="user-page-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">{t('resumeBuilder')}</h1>
                <Button onClick={handleDownloadPDF}>
                    <Download size={20} />
                    {t('downloadPdf')}
                </Button>
            </div>

            <div className="resume-builder-layout">
                {/* Form Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="dashboard-section">
                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            {steps.map((step, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveStep(i)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: activeStep === i ? 'var(--primary)' : 'var(--text-muted)',
                                        borderBottom: activeStep === i ? '2px solid var(--primary)' : 'none',
                                        paddingBottom: '0.5rem',
                                        fontWeight: activeStep === i ? '600' : '400'
                                    }}
                                >
                                    {step.icon}
                                    {step.title}
                                </button>
                            ))}
                        </div>

                        {activeStep === 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <Input label={t('fullName')} placeholder={t('resumeNamePlaceholder')} value={formData.personal.name} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, name: e.target.value } })} icon={User} />
                                <Input label={t('email')} placeholder={t('resumeEmailPlaceholder')} value={formData.personal.email} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, email: e.target.value } })} icon={Mail} />
                                <Input label={t('phone')} placeholder={t('resumePhonePlaceholder')} value={formData.personal.phone} onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, phone: e.target.value } })} icon={Phone} />
                                <div className="input-group">
                                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <MapPin size={16} /> {t('locationPlaceholder')}
                                    </label>
                                    <select
                                        style={{
                                            width: '100%',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '12px',
                                            padding: '0.85rem 1rem',
                                            color: 'white',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            fontSize: '0.95rem'
                                        }}
                                        value={formData.personal.location}
                                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, location: e.target.value } })}
                                    >
<<<<<<< HEAD:frontend/src/pages/ResumeBuilder.jsx
                                        <option 
                                            value="" 
                                            style={{ 
                                                background: theme === 'dark' ? '#0f172a' : '#4357a7', 
                                                color: theme === 'dark' ? 'white' : 'black' 
                                            }}
                                        >
                                            {t('selectLocation') || 'Select Location'}
                                        </option>
                                        {['Amman', 'Irbid', 'Zarqa', 'Balqa', 'Madaba', 'Karak', 'Tafilah', 'Ma\'an', 'Aqaba', 'Mafraq', 'Jerash', 'Ajloun'].map(city => (
                                            <option 
                                                key={city} 
                                                value={city} 
                                                style={{ 
                                                    background: theme === 'dark' ? '#0f172a' : '#4357a7', 
                                                    color: theme === 'dark' ? 'white' : 'black' 
                                                }}
                                            >
                                                {t(city.toLowerCase().replace("'", ''))}
                                            </option>
=======
                                        <option value="" style={{ color: '#0f172a' }}>{t('selectLocation') || 'Select Location'}</option>
                                        {['Amman', 'Irbid', 'Zarqa', 'Balqa', 'Madaba', 'Karak', 'Tafilah', 'Ma\'an', 'Aqaba', 'Mafraq', 'Jerash', 'Ajloun'].map(city => (
                                            <option key={city} value={city} style={{ color: '#0f172a' }}>{t(city.toLowerCase().replace("'", ''))}</option>
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/ResumeBuilder.jsx
                                        ))}
                                    </select>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem' }}>{t('aboutMe')}</label>
                                    <textarea
                                        style={{ width: '100%', minHeight: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', color: 'white', outline: 'none' }}
                                        placeholder={t('resumeAboutPlaceholder')}
                                        value={formData.personal.about}
                                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, about: e.target.value } })}
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {activeStep === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {formData.experience.map((exp, idx) => (
                                    <div key={exp.id} style={{ position: 'relative', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                        {formData.experience.length > 1 && (
                                            <button onClick={() => removeExperience(exp.id)} style={{ position: 'absolute', top: '1rem', right: dir === 'rtl' ? 'auto' : '1rem', left: dir === 'rtl' ? '1rem' : 'auto', color: '#ef4444' }}><Trash2 size={18} /></button>
                                        )}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
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
                                            <Input label={t('startDate')} placeholder={t('resumeDatePlaceholder')} type="text" value={exp.start} onChange={(e) => {
                                                const newExp = [...formData.experience];
                                                newExp[idx].start = e.target.value;
                                                setFormData({ ...formData, experience: newExp });
                                            }} />
                                            <Input label={t('endDate')} placeholder={t('resumeDatePlaceholder')} type="text" value={exp.end} onChange={(e) => {
                                                const newExp = [...formData.experience];
                                                newExp[idx].end = e.target.value;
                                                setFormData({ ...formData, experience: newExp });
                                            }} />
                                        </div>
                                    </div>
                                ))}
                                <Button variant="secondary" onClick={addExperience}><Plus size={18} /> {t('addExperience')}</Button>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {formData.education.map((edu, idx) => (
                                    <div key={edu.id} style={{ position: 'relative', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                        {formData.education.length > 1 && (
                                            <button onClick={() => removeEducation(edu.id)} style={{ position: 'absolute', top: '1rem', right: dir === 'rtl' ? 'auto' : '1rem', left: dir === 'rtl' ? '1rem' : 'auto', color: '#ef4444' }}><Trash2 size={18} /></button>
                                        )}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
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

                                <div className="skills-manager" style={{ marginTop: '2rem' }}>
                                    <h3 style={{ color: 'white', marginBottom: '1rem' }}>{t('skills')}</h3>
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
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        {formData.skills.map((skill) => (
                                            <span key={skill} className="skill-tag" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                                borderRadius: '20px',
                                                color: 'var(--primary)',
                                                fontSize: '0.9rem'
                                            }}>
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Preview */}
                <aside style={{ position: 'sticky', top: 'var(--navbar-height)' }}>
                    <div className="dashboard-section" style={{ height: 'fit-content' }}>
                        <h2 className="section-title"><Eye size={20} className="text-primary" /> {t('livePreview')}</h2>
                        <div 
                            ref={resumeRef}
                            style={{
                                background: 'white',
                                color: '#334155',
                                aspectRatio: '1 / 1.414',
                                padding: '2rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                overflowY: 'auto'
                            }}
                        >
                            <header style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '1.5rem', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                                <h1 style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>{formData.personal.name || t('yourName')}</h1>
                                <p>{formData.personal.email || t('emailExample')} | {formData.personal.phone || t('phone')}</p>
                                <p>{formData.personal.location || t('locationPlaceholder')}</p>
                            </header>

                            {formData.personal.about && (
                                <section style={{ marginBottom: '1.5rem', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                                    <h3 style={{ textTransform: 'uppercase', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('aboutMe')}</h3>
                                    <p style={{ lineHeight: '1.5' }}>{formData.personal.about}</p>
                                </section>
                            )}

                            <section style={{ marginBottom: '1.5rem', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                                <h3 style={{ textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Briefcase size={14} /> {t('experience')}
                                </h3>
                                {formData.experience.map(exp => (
                                    <div key={exp.id} style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                            <span>{exp.title || t('rolePlaceholder')}</span>
                                            <span style={{ color: 'var(--primary)' }}>{exp.start} - {exp.end || t('present')}</span>
                                        </div>
                                        <p style={{ fontStyle: 'italic', color: '#64748b' }}>{exp.company || t('companyPlaceholder')}</p>
                                    </div>
                                ))}
                            </section>

                            <section style={{ marginBottom: '1.5rem', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                                <h3 style={{ textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <GraduationCap size={14} /> {t('education')}
                                </h3>
                                {formData.education.map(edu => (
                                    <div key={edu.id} style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                            <span>{edu.degree || t('degree')}</span>
                                            <span style={{ color: 'var(--primary)' }}>{edu.year}</span>
                                        </div>
                                        <p style={{ color: '#64748b' }}>{edu.school || t('institution')}</p>
                                    </div>
                                ))}
                            </section>

                            <section style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                                <h3 style={{ textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <LangIcon size={14} /> {t('skills')}
                                </h3>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {formData.skills.map(skill => (
                                        <span key={skill} style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{skill}</span>
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
