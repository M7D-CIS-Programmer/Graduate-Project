import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import {
    Mail, Phone, MapPin, Send, MessageSquare,
    Clock, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import {
    validateName, validateEmail, validatePhone, sanitize
} from '../utils/validators';
import './ContactUs.css';

// ── Field-level validation ────────────────────────────────────────────────────

const validateSubject = (v, lang) => {
    const t = (v || '').trim();
    if (!t) return lang === 'ar' ? 'الموضوع مطلوب' : 'Subject is required';
    if (t.length < 3) return lang === 'ar' ? 'الموضوع قصير جداً (3 أحرف على الأقل)' : 'Subject is too short (min 3 characters)';
    if (t.length > 200) return lang === 'ar' ? 'الموضوع طويل جداً (200 حرف كحد أقصى)' : 'Subject is too long (max 200 characters)';
    return null;
};

const validateMessage = (v, lang) => {
    const t = (v || '').trim();
    if (!t) return lang === 'ar' ? 'الرسالة مطلوبة' : 'Message is required';
    if (t.length < 10) return lang === 'ar' ? 'الرسالة قصيرة جداً (10 أحرف على الأقل)' : 'Message is too short (min 10 characters)';
    if (t.length > 2000) return lang === 'ar' ? 'الرسالة طويلة جداً (2000 حرف كحد أقصى)' : 'Message is too long (max 2000 characters)';
    return null;
};

// ── Inline error display ──────────────────────────────────────────────────────

const FieldError = ({ msg }) => msg
    ? <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <AlertCircle size={13} /> {msg}
      </p>
    : null;

// ── Main component ────────────────────────────────────────────────────────────

const ContactUs = () => {
    const { t, language, dir } = useLanguage();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const lang = language || 'en';
    const ar = lang === 'ar';

    // Read pre-filled subject from URL query param (?subject=...)
    const prefillSubject = searchParams.get('subject') || '';

    const [form, setForm] = useState({
        fullName: '',
        email:    '',
        phone:    '',
        subject:  prefillSubject,
        message:  '',
    });

    const [errors,    setErrors]    = useState({});
    const [touched,   setTouched]   = useState({});
    const [loading,   setLoading]   = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [serverErr, setServerErr] = useState('');

    // Auto-fill from logged-in user
    useEffect(() => {
        if (user) {
            setForm(f => ({
                ...f,
                fullName: f.fullName || user.name  || '',
                email:    f.email    || user.email || '',
            }));
        }
    }, [user]);

    // Update subject if prefillSubject prop changes (e.g. from SuspendedPage)
    useEffect(() => {
        if (prefillSubject) setForm(f => ({ ...f, subject: prefillSubject }));
    }, [prefillSubject]);

    // ── Validation ────────────────────────────────────────────────────────────

    const runValidation = (field, value) => {
        switch (field) {
            case 'fullName': return validateName(value, lang);
            case 'email':    return validateEmail(value, lang);
            case 'phone':    return validatePhone(value, lang);
            case 'subject':  return validateSubject(value, lang);
            case 'message':  return validateMessage(value, lang);
            default:         return null;
        }
    };

    const handleBlur = (field) => {
        setTouched(t => ({ ...t, [field]: true }));
        const err = runValidation(field, form[field]);
        setErrors(e => err ? { ...e, [field]: err } : (() => { const n = { ...e }; delete n[field]; return n; })());
    };

    const handleChange = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (touched[field]) {
            const err = runValidation(field, value);
            setErrors(e => err ? { ...e, [field]: err } : (() => { const n = { ...e }; delete n[field]; return n; })());
        }
    };

    const validateAll = () => {
        const fields = ['fullName', 'email', 'phone', 'subject', 'message'];
        const newErrors = {};
        fields.forEach(f => {
            const err = runValidation(f, form[f]);
            if (err) newErrors[f] = err;
        });
        setErrors(newErrors);
        setTouched({ fullName: true, email: true, phone: true, subject: true, message: true });
        return Object.keys(newErrors).length === 0;
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerErr('');

        if (!validateAll()) {
            const firstErrEl = document.querySelector('[data-field-error="true"]');
            firstErrEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);
        try {
            await api.submitContactMessage({
                fullName: sanitize(form.fullName.trim()),
                email:    form.email.trim().toLowerCase(),
                subject:  sanitize(form.subject.trim()),
                message:  sanitize(form.message.trim()),
                phone:    form.phone.trim() || null,
                userId:   user?.id   || null,
                userRole: user?.role || null,
            });
            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('DUPLICATE_SUBMISSION')) {
                setServerErr(ar
                    ? 'لقد أرسلت رسالة مشابهة مؤخراً. يرجى الانتظار بضع دقائق قبل المحاولة مجدداً.'
                    : 'You have already submitted a similar message recently. Please wait a few minutes before trying again.');
            } else {
                setServerErr(ar
                    ? 'حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.'
                    : 'Something went wrong while sending your message. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Success screen ────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="contact-container" dir={dir}>
                <div style={{
                    maxWidth: 520, margin: '4rem auto',
                    background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: 24, padding: '3rem', textAlign: 'center'
                }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <CheckCircle size={38} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginBottom: '0.75rem' }}>
                        {ar ? 'تم إرسال رسالتك!' : 'Message Sent!'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
                        {ar
                            ? 'شكراً للتواصل معنا. سيقوم فريقنا بمراجعة رسالتك والرد عليك في أقرب وقت ممكن.'
                            : 'Thank you for reaching out. Our team will review your message and get back to you as soon as possible.'}
                    </p>
                    <button
                        className="btn-primary"
                        onClick={() => { setSubmitted(false); setForm({ fullName: user?.name || '', email: user?.email || '', phone: '', subject: '', message: '' }); setErrors({}); setTouched({}); }}
                    >
                        {ar ? 'إرسال رسالة أخرى' : 'Send Another Message'}
                    </button>
                </div>
            </div>
        );
    }

    // ── Form ──────────────────────────────────────────────────────────────────

    const inputStyle = (field) => ({
        width: '100%',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${errors[field] && touched[field] ? '#ef4444' : 'var(--border-color)'}`,
        borderRadius: 12,
        padding: '0.75rem 1rem',
        color: 'var(--text-main)',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    });

    return (
        <div className="contact-container" dir={dir}>
            <section className="contact-hero">
                <h1>
                    {t('contactHeroTitle').split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="highlight">{t('contactHeroTitle').split(' ').pop()}</span>
                </h1>
                <p>{t('contactHeroDesc')}</p>
            </section>

            <div className="contact-grid">
                {/* Info cards */}
                <div className="contact-info">
                    {[
                        { icon: <Mail />,   title: t('emailUs'),      lines: ['support@insightcv.com', 'info@insightcv.com'] },
                        { icon: <Phone />,  title: t('callUs'),       lines: ['+962 (6) 123-4567', '+962 (79) 000-0000'] },
                        { icon: <MapPin />, title: t('visitUs'),      lines: [t('visitUsAmman')] },
                        { icon: <Clock />,  title: t('workingHours'), lines: [t('workingHoursSunThu'), t('workingHoursSat')] },
                    ].map(({ icon, title, lines }) => (
                        <div key={title} className="info-card glass">
                            <div className="info-icon">{icon}</div>
                            <div>
                                <h4>{title}</h4>
                                {lines.map(l => <p key={l}>{l}</p>)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact form */}
                <form className="contact-form glass" onSubmit={handleSubmit} noValidate>
                    <div className="form-header">
                        <MessageSquare size={24} color="var(--primary)" />
                        <h3>{t('sendUsMessage')}</h3>
                    </div>

                    {/* Server error banner */}
                    {serverErr && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#ef4444', fontSize: '0.875rem' }}>
                            <AlertCircle size={16} />
                            {serverErr}
                        </div>
                    )}

                    {/* Full Name */}
                    <div className="form-group" data-field-error={!!(errors.fullName && touched.fullName) || undefined}>
                        <label>{t('fullName')} <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={e => handleChange('fullName', e.target.value)}
                            onBlur={() => handleBlur('fullName')}
                            placeholder={ar ? 'الاسم الكامل' : 'Your full name'}
                            style={inputStyle('fullName')}
                        />
                        <FieldError msg={touched.fullName ? errors.fullName : null} />
                    </div>

                    {/* Email */}
                    <div className="form-group" data-field-error={!!(errors.email && touched.email) || undefined}>
                        <label>{t('email')} <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            placeholder="example@mail.com"
                            style={inputStyle('email')}
                        />
                        <FieldError msg={touched.email ? errors.email : null} />
                    </div>

                    {/* Phone (optional) */}
                    <div className="form-group" data-field-error={!!(errors.phone && touched.phone) || undefined}>
                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                            {t('phone') || 'Phone'}
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                {ar ? 'اختياري' : 'Optional'}
                            </span>
                        </label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={e => handleChange('phone', e.target.value)}
                            onBlur={() => handleBlur('phone')}
                            placeholder="+962 79 000 0000"
                            style={inputStyle('phone')}
                        />
                        <FieldError msg={touched.phone ? errors.phone : null} />
                    </div>

                    {/* Subject */}
                    <div className="form-group" data-field-error={!!(errors.subject && touched.subject) || undefined}>
                        <label>{t('subject')} <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={e => handleChange('subject', e.target.value)}
                            onBlur={() => handleBlur('subject')}
                            placeholder={ar ? 'موضوع رسالتك' : 'What is this about?'}
                            style={inputStyle('subject')}
                        />
                        <FieldError msg={touched.subject ? errors.subject : null} />
                    </div>

                    {/* Message */}
                    <div className="form-group" data-field-error={!!(errors.message && touched.message) || undefined}>
                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{t('message')} <span style={{ color: '#ef4444' }}>*</span></span>
                            <span style={{ fontSize: '0.75rem', color: form.message.length > 1800 ? '#ef4444' : 'var(--text-muted)', fontWeight: 400 }}>
                                {form.message.length}/2000
                            </span>
                        </label>
                        <textarea
                            rows={6}
                            value={form.message}
                            onChange={e => handleChange('message', e.target.value)}
                            onBlur={() => handleBlur('message')}
                            placeholder={ar ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                            maxLength={2000}
                            style={{ ...inputStyle('message'), resize: 'vertical', minHeight: 140 }}
                        />
                        <FieldError msg={touched.message ? errors.message : null} />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '1rem', marginTop: '0.5rem', opacity: loading ? 0.75 : 1 }}
                    >
                        {loading
                            ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> {ar ? 'جارٍ الإرسال...' : 'Sending...'}</>
                            : <><Send size={18} /> {t('sendMessage')}</>
                        }
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactUs;
