import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import {
    User, MapPin, Briefcase, GraduationCap, Plus, Trash2,
    Phone, Mail, Globe, Github, Linkedin,
    Languages as LangIcon, Download, Eye, X, Save
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/api';
import {
    validateName, validateEmail, validatePhone,
    validateUrl, validateLinkedIn, validateGitHub
} from '../utils/validators';
import './User.css';
import './ResumeBuilder.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];
const years = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i);

const parseMonthYear = (str) => {
    if (!str || str === 'Present') return { month: '', year: '' };
    const parts = str.split('-');
    return { month: parseInt(parts[1]) - 1, year: parts[0] };
};

const buildMonthYear = (month, year) =>
    month !== '' && year ? `${year}-${String(Number(month) + 1).padStart(2, '0')}` : '';

const formatDate = (dateStr, dir) => {
    if (!dateStr) return '';
    if (dateStr === 'Present') return 'Present';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString(dir === 'rtl' ? 'ar-EG' : 'en-US', { month: 'short', year: 'numeric' });
    } catch { return dateStr; }
};

const useDebounce = (value, delay) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
};

// ── Whether an experience entry has any content at all ───────────────────────
const expIsEmpty = e => !e.title.trim() && !e.company.trim() && !e.start && !e.description.trim();
const eduIsEmpty = e => !e.degree.trim() && !e.school.trim() && !e.year;

// ── Date picker subcomponent ──────────────────────────────────────────────────

const MonthYearPicker = ({ value, onChange, label, allowPresent, isPresent, onPresentToggle, error }) => (
    <div className="input-group">
        {allowPresent ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="input-label" style={{ margin: 0 }}>{label}</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <input type="checkbox" checked={isPresent} onChange={onPresentToggle} />
                    Present
                </label>
            </div>
        ) : (
            <label className="input-label">{label}</label>
        )}

        {isPresent ? (
            <input type="text" className="resume-input" value="Present" disabled />
        ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                    className="resume-input custom-select"
                    style={{ flex: 2, borderColor: error ? '#ef4444' : undefined }}
                    value={parseMonthYear(value).month}
                    onChange={e => {
                        const { year } = parseMonthYear(value);
                        onChange(buildMonthYear(e.target.value, year || new Date().getFullYear()));
                    }}
                >
                    <option value="">Month</option>
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select
                    className="resume-input custom-select"
                    style={{ flex: 1, borderColor: error ? '#ef4444' : undefined }}
                    value={parseMonthYear(value).year}
                    onChange={e => {
                        const { month } = parseMonthYear(value);
                        onChange(buildMonthYear(month === '' ? 0 : month, e.target.value));
                    }}
                >
                    <option value="">Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        )}
        {error && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
);

// ── Inline error message ──────────────────────────────────────────────────────

const Err = ({ msg }) => msg
    ? <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem' }}>{msg}</p>
    : null;

// ── Main Component ────────────────────────────────────────────────────────────

const ResumeBuilder = () => {
    const { dir, language } = useLanguage();
    const { theme } = useTheme();
    const resumeRef = useRef();
    const [activeStep, setActiveStep] = useState(0);
    const { user } = useAuth();
    const { addToast } = useToast();
    const lang = language || 'en';

    const [resumeId, setResumeId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState('');
    const isFirstLoad = useRef(true);

    // ── Field-level errors ─────────────────────────────────────────────────────
    // Keys: 'personal.name', 'personal.email', 'personal.phone', 'personal.about',
    //       'personal.linkedin', 'personal.github', 'personal.website',
    //       'exp.0.title', 'exp.0.company', 'exp.0.start', 'exp.0.dateRange',
    //       'edu.0.degree', 'edu.0.school', 'edu.0.year',
    //       'skill.input'
    const [errors, setErrors] = useState({});

    const setErr = (key, val) => setErrors(e => val ? { ...e, [key]: val } : (() => { const n = { ...e }; delete n[key]; return n; })());
    const getErr = (key) => errors[key];

    const [formData, setFormData] = useState({
        personal: {
            name: '', email: '', phone: '', location: '',
            linkedin: '', github: '', website: '', about: ''
        },
        experience: [{ id: Date.now(), title: '', company: '', start: '', end: '', description: '' }],
        education: [{ id: Date.now(), degree: '', school: '', year: '' }],
        skills: [],
    });

    // ── Load existing resume ──────────────────────────────────────────────────

    useEffect(() => {
        if (!user?.id) return;
        api.getResumeByUserId(user.id)
            .then(data => {
                if (!data) return;
                setResumeId(data.id);
                setFormData({
                    personal: {
                        name:     data.name      || '',
                        email:    data.email     || '',
                        phone:    data.phone     || '',
                        location: data.location  || '',
                        linkedin: data.linkedin  || '',
                        github:   data.github    || '',
                        website:  data.website   || '',
                        about:    data.bio        || '',
                    },
                    experience: data.experiences?.length
                        ? data.experiences.map(e => ({
                            id: e.id, title: e.jobName, company: e.companyName,
                            start: e.startDate, end: e.endDate || '', description: e.description || ''
                        }))
                        : [{ id: Date.now(), title: '', company: '', start: '', end: '', description: '' }],
                    education: data.educations?.length
                        ? data.educations.map(e => ({
                            id: e.id, degree: e.educationLevel,
                            school: e.institution, year: String(e.graduationYear)
                        }))
                        : [{ id: Date.now(), degree: '', school: '', year: '' }],
                    skills: data.skills?.map(s => s.name) || [],
                });
            })
            .catch(() => {});
    }, [user?.id]);

    // ── Validation ────────────────────────────────────────────────────────────

    const validatePersonal = (p = formData.personal) => {
        const e = {};
        const nameErr = validateName(p.name, lang);
        if (nameErr) e['personal.name'] = nameErr;

        const emailErr = validateEmail(p.email, lang);
        if (emailErr) e['personal.email'] = emailErr;

        const phoneErr = validatePhone(p.phone, lang);
        if (phoneErr) e['personal.phone'] = phoneErr;

        const linkedinErr = validateLinkedIn(p.linkedin, lang);
        if (linkedinErr) e['personal.linkedin'] = linkedinErr;

        const githubErr = validateGitHub(p.github, lang);
        if (githubErr) e['personal.github'] = githubErr;

        const websiteErr = validateUrl(p.website, lang);
        if (websiteErr) e['personal.website'] = websiteErr;

        if (p.about && p.about.trim().length > 600) {
            e['personal.about'] = lang === 'ar'
                ? 'الملخص طويل جداً (الحد الأقصى 600 حرف)'
                : 'Summary is too long (max 600 characters)';
        }
        return e;
    };

    const validateExperience = (experiences = formData.experience) => {
        const e = {};
        const currentYear = new Date().getFullYear();

        experiences.forEach((exp, idx) => {
            if (expIsEmpty(exp)) return; // skip completely blank entries

            if (!exp.title.trim())
                e[`exp.${idx}.title`] = lang === 'ar' ? 'المسمى الوظيفي مطلوب' : 'Job title is required';

            if (!exp.company.trim())
                e[`exp.${idx}.company`] = lang === 'ar' ? 'اسم الشركة مطلوب' : 'Company name is required';

            if (!exp.start)
                e[`exp.${idx}.start`] = lang === 'ar' ? 'تاريخ البدء مطلوب' : 'Start date is required';

            // End date must be after start date (if both filled and not "Present")
            if (exp.start && exp.end && exp.end !== 'Present') {
                const s = new Date(exp.start);
                const en = new Date(exp.end);
                if (en < s)
                    e[`exp.${idx}.dateRange`] = lang === 'ar'
                        ? 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء'
                        : 'End date must be after start date';
            }

            if (exp.description && exp.description.length > 1000)
                e[`exp.${idx}.description`] = lang === 'ar'
                    ? 'الوصف طويل جداً (الحد الأقصى 1000 حرف)'
                    : 'Description is too long (max 1000 characters)';
        });
        return e;
    };

    const validateEducation = (educations = formData.education) => {
        const e = {};
        const currentYear = new Date().getFullYear();

        educations.forEach((edu, idx) => {
            if (eduIsEmpty(edu)) return;

            if (!edu.degree.trim())
                e[`edu.${idx}.degree`] = lang === 'ar' ? 'الدرجة العلمية مطلوبة' : 'Degree is required';

            if (!edu.school.trim())
                e[`edu.${idx}.school`] = lang === 'ar' ? 'اسم المؤسسة مطلوب' : 'Institution name is required';

            if (edu.year) {
                const y = parseInt(edu.year);
                if (isNaN(y) || y < 1950 || y > currentYear + 6)
                    e[`edu.${idx}.year`] = lang === 'ar'
                        ? `يجب أن تكون سنة التخرج بين 1950 و ${currentYear + 6}`
                        : `Graduation year must be between 1950 and ${currentYear + 6}`;
            }
        });
        return e;
    };

    // Full validation — used before Save and Download PDF
    const validateAll = () => {
        const allErrors = {
            ...validatePersonal(),
            ...validateExperience(),
            ...validateEducation(),
        };
        setErrors(allErrors);
        return Object.keys(allErrors).length === 0;
    };

    // ── Save ─────────────────────────────────────────────────────────────────

    const buildPayload = useCallback(() => ({
        userId:   user.id,
        name:     formData.personal.name,
        email:    formData.personal.email,
        phone:    formData.personal.phone,
        location: formData.personal.location,
        linkedin: formData.personal.linkedin,
        github:   formData.personal.github,
        website:  formData.personal.website,
        bio:      formData.personal.about,
        experiences: formData.experience
            .filter(e => !expIsEmpty(e))
            .map(e => ({
                jobName:     e.title,
                companyName: e.company,
                startDate:   e.start,
                endDate:     e.end || null,
                description: e.description || null,
            })),
        educations: formData.education
            .filter(e => !eduIsEmpty(e))
            .map(e => ({
                educationLevel: e.degree,
                institution:    e.school,
                graduationYear: parseInt(e.year) || 0,
            })),
        skills: formData.skills.map(s => ({ name: s })),
    }), [formData, user?.id]);

    const save = useCallback(async (silent = false) => {
        if (!user?.id) return;
        // Validate before manual save
        if (!silent && !validateAll()) {
            addToast(
                lang === 'ar'
                    ? 'يرجى تصحيح الأخطاء قبل الحفظ'
                    : 'Please fix the errors before saving',
                'error'
            );
            return false;
        }
        if (!silent) setIsSaving(true);
        try {
            const payload = buildPayload();
            if (resumeId) {
                await api.updateResume(resumeId, payload);
            } else {
                const res = await api.createResume(payload);
                setResumeId(res.id);
            }
            if (!silent) addToast(
                lang === 'ar' ? 'تم حفظ السيرة الذاتية!' : 'Resume saved!',
                'success'
            );
            return true;
        } catch {
            if (!silent) addToast(
                lang === 'ar' ? 'فشل الحفظ. حاول مرة أخرى.' : 'Failed to save resume.',
                'error'
            );
            return false;
        } finally {
            if (!silent) setIsSaving(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buildPayload, resumeId, user?.id, addToast, formData]);

    // ── Auto-save (debounced, 3 s — silent, no validation block) ─────────────

    const debouncedForm = useDebounce(formData, 3000);

    useEffect(() => {
        if (isFirstLoad.current) { isFirstLoad.current = false; return; }
        if (!user?.id) return;
        setAutoSaveStatus('saving');
        // Auto-save is always silent and skips validation to avoid interrupting typing
        (async () => {
            try {
                const payload = buildPayload();
                if (resumeId) await api.updateResume(resumeId, payload);
                else {
                    const res = await api.createResume(payload);
                    setResumeId(res.id);
                }
                setAutoSaveStatus('saved');
            } catch {
                setAutoSaveStatus('');
            } finally {
                setTimeout(() => setAutoSaveStatus(''), 4000);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedForm]);

    // ── Experience helpers ────────────────────────────────────────────────────

    const updateExp = (idx, field, value) =>
        setFormData(f => {
            const exp = f.experience.map((e, i) => i === idx ? { ...e, [field]: value } : e);
            return { ...f, experience: exp };
        });

    const addExp = () =>
        setFormData(f => ({
            ...f,
            experience: [...f.experience, { id: Date.now(), title: '', company: '', start: '', end: '', description: '' }]
        }));

    const removeExp = id =>
        setFormData(f => ({ ...f, experience: f.experience.filter(e => e.id !== id) }));

    // ── Education helpers ─────────────────────────────────────────────────────

    const updateEdu = (idx, field, value) =>
        setFormData(f => {
            const edu = f.education.map((e, i) => i === idx ? { ...e, [field]: value } : e);
            return { ...f, education: edu };
        });

    const addEdu = () =>
        setFormData(f => ({
            ...f,
            education: [...f.education, { id: Date.now(), degree: '', school: '', year: '' }]
        }));

    const removeEdu = id =>
        setFormData(f => ({ ...f, education: f.education.filter(e => e.id !== id) }));

    // ── Skills helpers ────────────────────────────────────────────────────────

    const [newSkill, setNewSkill] = useState('');
    const [skillError, setSkillError] = useState('');

    const addSkill = e => {
        e.preventDefault();
        const s = newSkill.trim();
        setSkillError('');

        if (!s) {
            setSkillError(lang === 'ar' ? 'أدخل اسم المهارة' : 'Please enter a skill name');
            return;
        }
        if (s.length > 50) {
            setSkillError(lang === 'ar' ? 'اسم المهارة طويل جداً (الحد 50 حرفاً)' : 'Skill name is too long (max 50 characters)');
            return;
        }
        if (formData.skills.map(sk => sk.toLowerCase()).includes(s.toLowerCase())) {
            setSkillError(lang === 'ar' ? 'هذه المهارة موجودة بالفعل' : 'This skill is already added');
            return;
        }
        if (formData.skills.length >= 30) {
            setSkillError(lang === 'ar' ? 'الحد الأقصى 30 مهارة' : 'Maximum 30 skills allowed');
            return;
        }

        setFormData(f => ({ ...f, skills: [...f.skills, s] }));
        setNewSkill('');
    };

    const removeSkill = skill =>
        setFormData(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));

    // ── PDF export ────────────────────────────────────────────────────────────

    const handleDownloadPDF = () => {
        // Only require name for download — everything else is optional
        const nameErr = validateName(formData.personal.name, lang);
        if (nameErr) {
            setErrors(e => ({ ...e, 'personal.name': nameErr }));
            setActiveStep(0);
            addToast(
                lang === 'ar' ? 'يرجى إدخال اسمك أولاً' : 'Please enter your name first',
                'error'
            );
            return;
        }

        const doc = new jsPDF();
        const pw  = doc.internal.pageSize.getWidth();
        const ph  = doc.internal.pageSize.getHeight();
        const ml  = 18, mr = 18;
        let y = 22;

        const primary = [99, 102, 241];
        const dark    = [30,  41,  59];
        const muted   = [100, 116, 139];

        const checkPage = (needed = 10) => {
            if (y + needed > ph - 15) { doc.addPage(); y = 20; }
        };

        const sectionTitle = (text) => {
            checkPage(14);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...primary);
            doc.text(text.toUpperCase(), ml, y);
            y += 3;
            doc.setDrawColor(...primary);
            doc.setLineWidth(0.4);
            doc.line(ml, y, pw - mr, y);
            y += 6;
        };

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(...primary);
        doc.text(formData.personal.name || 'Your Name', ml, y);
        y += 9;

        const contactParts = [
            formData.personal.email,
            formData.personal.phone,
            formData.personal.location,
        ].filter(Boolean);
        if (contactParts.length) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...muted);
            doc.text(contactParts.join('  |  '), ml, y);
            y += 5;
        }

        const socialParts = [
            formData.personal.linkedin && `LinkedIn: ${formData.personal.linkedin}`,
            formData.personal.github   && `GitHub: ${formData.personal.github}`,
            formData.personal.website  && formData.personal.website,
        ].filter(Boolean);
        if (socialParts.length) {
            doc.setFontSize(9);
            doc.setTextColor(...muted);
            doc.text(socialParts.join('  |  '), ml, y);
            y += 5;
        }

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(ml, y, pw - mr, y);
        y += 8;

        if (formData.personal.about) {
            sectionTitle('Profile Summary');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(...dark);
            const lines = doc.splitTextToSize(formData.personal.about, pw - ml - mr);
            checkPage(lines.length * 5 + 4);
            doc.text(lines, ml, y);
            y += lines.length * 5 + 8;
        }

        const filledExp = formData.experience.filter(e => e.title || e.company);
        if (filledExp.length) {
            sectionTitle('Experience');
            filledExp.forEach(exp => {
                checkPage(20);
                const dates = `${formatDate(exp.start, dir)} – ${formatDate(exp.end, dir) || 'Present'}`;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10.5);
                doc.setTextColor(...dark);
                doc.text(exp.title || '', ml, y);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...muted);
                const datesW = doc.getTextWidth(dates);
                doc.text(dates, pw - mr - datesW, y);
                y += 5;
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(9.5);
                doc.setTextColor(...muted);
                doc.text(exp.company || '', ml, y);
                y += 6;
                if (exp.description) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    doc.setTextColor(...dark);
                    const descLines = doc.splitTextToSize(exp.description, pw - ml - mr - 4);
                    checkPage(descLines.length * 4.5 + 4);
                    doc.text(descLines, ml + 2, y);
                    y += descLines.length * 4.5 + 3;
                }
                y += 4;
            });
        }

        const filledEdu = formData.education.filter(e => e.degree || e.school);
        if (filledEdu.length) {
            sectionTitle('Education');
            filledEdu.forEach(edu => {
                checkPage(14);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10.5);
                doc.setTextColor(...dark);
                doc.text(edu.degree || '', ml, y);
                if (edu.year) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    doc.setTextColor(...muted);
                    const yw = doc.getTextWidth(edu.year);
                    doc.text(edu.year, pw - mr - yw, y);
                }
                y += 5;
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(9.5);
                doc.setTextColor(...muted);
                doc.text(edu.school || '', ml, y);
                y += 9;
            });
        }

        if (formData.skills.length) {
            sectionTitle('Skills');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(...dark);
            const skillLines = doc.splitTextToSize(formData.skills.join('  •  '), pw - ml - mr);
            checkPage(skillLines.length * 5 + 4);
            doc.text(skillLines, ml, y);
        }

        doc.save(`${formData.personal.name || 'Resume'}.pdf`);
    };

    // ── Tabs ──────────────────────────────────────────────────────────────────

    const steps = [
        { title: 'Personal',   icon: <User size={18} /> },
        { title: 'Experience', icon: <Briefcase size={18} /> },
        { title: 'Education',  icon: <GraduationCap size={18} /> },
        { title: 'Skills',     icon: <LangIcon size={18} /> },
    ];

    const p = formData.personal;

    // Count errors per tab for badge indicators
    const tabErrorCounts = [
        Object.keys(errors).filter(k => k.startsWith('personal.')).length,
        Object.keys(errors).filter(k => k.startsWith('exp.')).length,
        Object.keys(errors).filter(k => k.startsWith('edu.')).length,
        0,
    ];

    return (
        <div className={`user-page-container ${dir}`}>
            {/* ── Header ── */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">
                        {lang === 'ar' ? 'منشئ السيرة الذاتية' : 'Resume Builder'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                        {autoSaveStatus === 'saving' && '● Auto-saving…'}
                        {autoSaveStatus === 'saved'  && '✓ Auto-saved'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button variant="outline" onClick={() => save(false)} disabled={isSaving}>
                        <Save size={16} />
                        {isSaving
                            ? (lang === 'ar' ? 'جارٍ الحفظ…' : 'Saving…')
                            : (lang === 'ar' ? 'حفظ' : 'Save')}
                    </Button>
                    <Button onClick={handleDownloadPDF}>
                        <Download size={16} />
                        {lang === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                    </Button>
                </div>
            </div>

            <div className="resume-builder-layout">
                {/* ── Form ── */}
                <div className="form-sections-container">
                    <div className="dashboard-section">
                        {/* Tabs */}
                        <div className="steps-tabs">
                            {steps.map((s, i) => (
                                <button key={i} onClick={() => setActiveStep(i)}
                                    className={`step-tab ${activeStep === i ? 'active' : ''}`}
                                    style={{ position: 'relative' }}>
                                    {s.icon}{s.title}
                                    {tabErrorCounts[i] > 0 && (
                                        <span style={{
                                            position: 'absolute', top: -6, right: -6,
                                            background: '#ef4444', color: '#fff',
                                            borderRadius: '50%', width: 16, height: 16,
                                            fontSize: '0.65rem', fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>{tabErrorCounts[i]}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* ── Personal ── */}
                        {activeStep === 0 && (
                            <div className="form-grid">
                                <Input label={lang === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                                    placeholder="Jane Smith"
                                    value={p.name} icon={User}
                                    error={getErr('personal.name')}
                                    onChange={e => setFormData(f => ({ ...f, personal: { ...f.personal, name: e.target.value } }))}
                                    onBlur={() => setErr('personal.name', validateName(p.name, lang))} />

                                <Input label={lang === 'ar' ? 'البريد الإلكتروني *' : 'Email *'}
                                    placeholder="jane@example.com"
                                    value={p.email} icon={Mail}
                                    error={getErr('personal.email')}
                                    onChange={e => setFormData(f => ({ ...f, personal: { ...f.personal, email: e.target.value } }))}
                                    onBlur={() => setErr('personal.email', validateEmail(p.email, lang))} />

                                <Input label={lang === 'ar' ? 'رقم الهاتف' : 'Phone'}
                                    placeholder="+1 555 000 0000"
                                    value={p.phone} icon={Phone}
                                    error={getErr('personal.phone')}
                                    onChange={e => setFormData(f => ({ ...f, personal: { ...f.personal, phone: e.target.value } }))}
                                    onBlur={() => setErr('personal.phone', validatePhone(p.phone, lang))} />

                                <Input label={lang === 'ar' ? 'الموقع' : 'Location'}
                                    placeholder="Dubai, UAE"
                                    value={p.location} icon={MapPin}
                                    onChange={e => setFormData(f => ({ ...f, personal: { ...f.personal, location: e.target.value } }))} />

                                <Input label="LinkedIn"
                                    placeholder="https://linkedin.com/in/yourname"
                                    value={p.linkedin} icon={Linkedin}
                                    error={getErr('personal.linkedin')}
                                    onChange={e => setFormData(f => ({ ...f, personal: { ...f.personal, linkedin: e.target.value } }))}
                                    onBlur={() => setErr('personal.linkedin', validateLinkedIn(p.linkedin, lang))} />

                                <Input label="GitHub"
                                    placeholder="https://github.com/yourname"
                                    value={p.github} icon={Github}
                                    error={getErr('personal.github')}
                                    onChange={e => setFormData(f => ({ ...f, personal: { ...f.personal, github: e.target.value } }))}
                                    onBlur={() => setErr('personal.github', validateGitHub(p.github, lang))} />

                                <div className="span-full">
                                    <Input label={lang === 'ar' ? 'الموقع الإلكتروني / المحفظة' : 'Website / Portfolio'}
                                        placeholder="https://yoursite.com"
                                        value={p.website} icon={Globe}
                                        error={getErr('personal.website')}
                                        onChange={e => setFormData(f => ({ ...f, personal: { ...f.personal, website: e.target.value } }))}
                                        onBlur={() => setErr('personal.website', validateUrl(p.website, lang))} />
                                </div>

                                <div className="span-full">
                                    <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>{lang === 'ar' ? 'ملخص المهنة' : 'Profile Summary'}</span>
                                        <span style={{ fontSize: '0.75rem', color: p.about.length > 550 ? '#ef4444' : 'var(--text-muted)' }}>
                                            {p.about.length}/600
                                        </span>
                                    </label>
                                    <textarea className="resume-textarea"
                                        placeholder={lang === 'ar'
                                            ? 'اكتب 2-3 جمل عن خلفيتك وما تقدمه للفريق…'
                                            : 'Write 2–3 sentences about your background and what you bring to a team…'}
                                        value={p.about}
                                        maxLength={600}
                                        style={{ borderColor: getErr('personal.about') ? '#ef4444' : undefined }}
                                        onChange={e => setFormData(f => ({ ...f, personal: { ...f.personal, about: e.target.value } }))} />
                                    <Err msg={getErr('personal.about')} />
                                </div>
                            </div>
                        )}

                        {/* ── Experience ── */}
                        {activeStep === 1 && (
                            <div className="form-sections-container">
                                {formData.experience.map((exp, idx) => (
                                    <div key={exp.id} className="entry-card">
                                        {formData.experience.length > 1 && (
                                            <button className="remove-entry-btn" onClick={() => removeExp(exp.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <div className="form-grid">
                                            <Input label={lang === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
                                                placeholder="Software Engineer"
                                                value={exp.title}
                                                error={getErr(`exp.${idx}.title`)}
                                                onChange={e => updateExp(idx, 'title', e.target.value)}
                                                onBlur={() => {
                                                    if (!expIsEmpty(exp) && !exp.title.trim())
                                                        setErr(`exp.${idx}.title`, lang === 'ar' ? 'المسمى الوظيفي مطلوب' : 'Job title is required');
                                                    else
                                                        setErr(`exp.${idx}.title`, null);
                                                }} />

                                            <Input label={lang === 'ar' ? 'الشركة' : 'Company'}
                                                placeholder="Acme Corp"
                                                value={exp.company}
                                                error={getErr(`exp.${idx}.company`)}
                                                onChange={e => updateExp(idx, 'company', e.target.value)}
                                                onBlur={() => {
                                                    if (!expIsEmpty(exp) && !exp.company.trim())
                                                        setErr(`exp.${idx}.company`, lang === 'ar' ? 'اسم الشركة مطلوب' : 'Company name is required');
                                                    else
                                                        setErr(`exp.${idx}.company`, null);
                                                }} />

                                            <MonthYearPicker
                                                label={lang === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                                                value={exp.start}
                                                error={getErr(`exp.${idx}.start`)}
                                                onChange={v => {
                                                    updateExp(idx, 'start', v);
                                                    setErr(`exp.${idx}.start`, null);
                                                    setErr(`exp.${idx}.dateRange`, null);
                                                }} />

                                            <MonthYearPicker
                                                label={lang === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                                                value={exp.end}
                                                allowPresent
                                                isPresent={exp.end === 'Present'}
                                                error={getErr(`exp.${idx}.dateRange`)}
                                                onPresentToggle={e => {
                                                    updateExp(idx, 'end', e.target.checked ? 'Present' : '');
                                                    setErr(`exp.${idx}.dateRange`, null);
                                                }}
                                                onChange={v => {
                                                    updateExp(idx, 'end', v);
                                                    setErr(`exp.${idx}.dateRange`, null);
                                                }} />

                                            <div className="span-full">
                                                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span>{lang === 'ar' ? 'الوصف' : 'Description'}</span>
                                                    <span style={{ fontSize: '0.75rem', color: exp.description.length > 900 ? '#ef4444' : 'var(--text-muted)' }}>
                                                        {exp.description.length}/1000
                                                    </span>
                                                </label>
                                                <textarea className="resume-textarea"
                                                    placeholder={lang === 'ar'
                                                        ? 'اذكر مسؤولياتك وإنجازاتك، استخدم أرقاماً إن أمكن…'
                                                        : "Describe your responsibilities and achievements. Use metrics (e.g. 'Reduced load time by 40%')…"}
                                                    value={exp.description}
                                                    maxLength={1000}
                                                    style={{ minHeight: 90, borderColor: getErr(`exp.${idx}.description`) ? '#ef4444' : undefined }}
                                                    onChange={e => updateExp(idx, 'description', e.target.value)} />
                                                <Err msg={getErr(`exp.${idx}.description`)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="secondary" onClick={addExp}>
                                    <Plus size={18} /> {lang === 'ar' ? 'إضافة خبرة' : 'Add Experience'}
                                </Button>
                            </div>
                        )}

                        {/* ── Education ── */}
                        {activeStep === 2 && (
                            <div className="form-sections-container">
                                {formData.education.map((edu, idx) => (
                                    <div key={edu.id} className="entry-card">
                                        {formData.education.length > 1 && (
                                            <button className="remove-entry-btn" onClick={() => removeEdu(edu.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <div className="form-grid">
                                            <Input
                                                label={lang === 'ar' ? 'الدرجة العلمية' : 'Degree'}
                                                placeholder="Bachelor of Science in Computer Science"
                                                value={edu.degree}
                                                error={getErr(`edu.${idx}.degree`)}
                                                onChange={e => updateEdu(idx, 'degree', e.target.value)}
                                                onBlur={() => {
                                                    if (!eduIsEmpty(edu) && !edu.degree.trim())
                                                        setErr(`edu.${idx}.degree`, lang === 'ar' ? 'الدرجة العلمية مطلوبة' : 'Degree is required');
                                                    else setErr(`edu.${idx}.degree`, null);
                                                }} />

                                            <Input
                                                label={lang === 'ar' ? 'المؤسسة' : 'Institution'}
                                                placeholder="University of Dubai"
                                                value={edu.school}
                                                error={getErr(`edu.${idx}.school`)}
                                                onChange={e => updateEdu(idx, 'school', e.target.value)}
                                                onBlur={() => {
                                                    if (!eduIsEmpty(edu) && !edu.school.trim())
                                                        setErr(`edu.${idx}.school`, lang === 'ar' ? 'اسم المؤسسة مطلوب' : 'Institution is required');
                                                    else setErr(`edu.${idx}.school`, null);
                                                }} />

                                            <div>
                                                <Input
                                                    label={lang === 'ar' ? 'سنة التخرج' : 'Graduation Year'}
                                                    type="number"
                                                    placeholder={String(new Date().getFullYear())}
                                                    className="no-arrows"
                                                    value={edu.year}
                                                    error={getErr(`edu.${idx}.year`)}
                                                    onChange={e => {
                                                        updateEdu(idx, 'year', e.target.value);
                                                        setErr(`edu.${idx}.year`, null);
                                                    }}
                                                    onBlur={() => {
                                                        if (!edu.year) { setErr(`edu.${idx}.year`, null); return; }
                                                        const y = parseInt(edu.year);
                                                        const cy = new Date().getFullYear();
                                                        if (isNaN(y) || y < 1950 || y > cy + 6)
                                                            setErr(`edu.${idx}.year`, lang === 'ar'
                                                                ? `سنة التخرج يجب أن تكون بين 1950 و ${cy + 6}`
                                                                : `Year must be between 1950 and ${cy + 6}`);
                                                        else setErr(`edu.${idx}.year`, null);
                                                    }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="secondary" onClick={addEdu}>
                                    <Plus size={18} /> {lang === 'ar' ? 'إضافة تعليم' : 'Add Education'}
                                </Button>
                            </div>
                        )}

                        {/* ── Skills ── */}
                        {activeStep === 3 && (
                            <div className="skills-manager">
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                                    {lang === 'ar'
                                        ? 'أضف مهاراتك التقنية والشخصية التي تمثل خبرتك بشكل أفضل.'
                                        : 'Add technical and soft skills that best represent your expertise.'}
                                </p>
                                <form onSubmit={addSkill} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <Input
                                            placeholder={lang === 'ar' ? 'مثال: React، إدارة المشاريع، SQL…' : 'e.g. React, Project Management, SQL…'}
                                            value={newSkill}
                                            onChange={e => { setNewSkill(e.target.value); setSkillError(''); }}
                                            error={skillError} />
                                    </div>
                                    <Button type="submit" style={{ height: 48 }}>
                                        <Plus size={16} /> {lang === 'ar' ? 'إضافة' : 'Add'}
                                    </Button>
                                </form>

                                {/* Skill count badge */}
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    {formData.skills.length}/30 {lang === 'ar' ? 'مهارة' : 'skills'}
                                </p>

                                {formData.skills.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                                        {lang === 'ar' ? 'لا توجد مهارات بعد. اكتب مهارة أعلاه واضغط إضافة.' : 'No skills added yet. Type a skill above and press Add.'}
                                    </p>
                                ) : (
                                    <div className="skills-list">
                                        {formData.skills.map(skill => (
                                            <span key={skill} className="skill-tag">
                                                {skill}
                                                <button className="remove-skill-btn" onClick={() => removeSkill(skill)}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Live Preview ── */}
                <aside className="preview-aside">
                    <div className="dashboard-section" style={{ height: 'fit-content' }}>
                        <h2 className="section-title">
                            <Eye size={20} className="text-primary" />
                            {lang === 'ar' ? 'معاينة مباشرة' : 'Live Preview'}
                        </h2>
                        <div ref={resumeRef} className="resume-preview-sheet">

                            <header className="preview-header">
                                <h1 className="preview-name">{p.name || (lang === 'ar' ? 'اسمك' : 'Your Name')}</h1>
                                <p className="preview-contact">
                                    {[p.email, p.phone, p.location].filter(Boolean).join(' · ')}
                                </p>
                                {(p.linkedin || p.github || p.website) && (
                                    <p className="preview-contact" style={{ marginTop: 2 }}>
                                        {[p.linkedin, p.github, p.website].filter(Boolean).join(' · ')}
                                    </p>
                                )}
                            </header>

                            {p.about && (
                                <section className="preview-section">
                                    <h3 className="preview-section-title">
                                        {lang === 'ar' ? 'ملخص المهنة' : 'Profile Summary'}
                                    </h3>
                                    <p className="preview-about-text">{p.about}</p>
                                </section>
                            )}

                            <section className="preview-section">
                                <h3 className="preview-section-title">
                                    <Briefcase size={13} /> {lang === 'ar' ? 'الخبرة' : 'Experience'}
                                </h3>
                                {formData.experience.map(exp => (
                                    <div key={exp.id} className="preview-entry">
                                        <div className="preview-entry-header">
                                            <span>{exp.title || (lang === 'ar' ? 'المسمى الوظيفي' : 'Job Title')}</span>
                                            <span style={{ color: '#6366f1', fontSize: '0.78rem' }}>
                                                {formatDate(exp.start, dir)} – {formatDate(exp.end, dir) || (lang === 'ar' ? 'الحاضر' : 'Present')}
                                            </span>
                                        </div>
                                        <p className="preview-entry-subtitle">{exp.company || (lang === 'ar' ? 'الشركة' : 'Company')}</p>
                                        {exp.description && (
                                            <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5, marginTop: 3 }}>
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </section>

                            <section className="preview-section">
                                <h3 className="preview-section-title">
                                    <GraduationCap size={13} /> {lang === 'ar' ? 'التعليم' : 'Education'}
                                </h3>
                                {formData.education.map(edu => (
                                    <div key={edu.id} className="preview-entry">
                                        <div className="preview-entry-header">
                                            <span>{edu.degree || (lang === 'ar' ? 'الدرجة العلمية' : 'Degree')}</span>
                                            <span style={{ color: '#6366f1', fontSize: '0.78rem' }}>{edu.year}</span>
                                        </div>
                                        <p className="preview-entry-subtitle">{edu.school || (lang === 'ar' ? 'المؤسسة' : 'Institution')}</p>
                                    </div>
                                ))}
                            </section>

                            {formData.skills.length > 0 && (
                                <section>
                                    <h3 className="preview-section-title">
                                        <LangIcon size={13} /> {lang === 'ar' ? 'المهارات' : 'Skills'}
                                    </h3>
                                    <div className="preview-skills-list">
                                        {formData.skills.map(s => (
                                            <span key={s} className="preview-skill-item">{s}</span>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ResumeBuilder;
