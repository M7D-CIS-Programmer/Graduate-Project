import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateName,
} from '../../utils/validators';
import './Auth.css';

const Register = () => {
    const { login }  = useAuth();
    const { t, language } = useLanguage();
    const navigate   = useNavigate();
    const lang       = language || 'en';

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'seeker',
        industry: ''
    });
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};

        const nameErr = validateName(formData.fullName, lang);
        if (nameErr) e.fullName = nameErr;

        if (formData.role === 'company' && !formData.industry.trim())
            e.industry = lang === 'ar' ? 'يرجى اختيار القطاع' : 'Please select an industry';

        const emailErr = validateEmail(formData.email, lang);
        if (emailErr) e.email = emailErr;

        const passErr = validatePassword(formData.password, lang);
        if (passErr) e.password = passErr;

        const confirmErr = validateConfirmPassword(formData.password, formData.confirmPassword, lang);
        if (confirmErr) e.confirmPassword = confirmErr;

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // Live validation on blur for each field
    const handleBlur = (field) => {
        const e = { ...errors };
        const check = (key, fn) => {
            const err = fn();
            err ? (e[key] = err) : delete e[key];
        };

        if (field === 'fullName')       check('fullName',        () => validateName(formData.fullName, lang));
        if (field === 'email')          check('email',           () => validateEmail(formData.email, lang));
        if (field === 'password')       check('password',        () => validatePassword(formData.password, lang));
        if (field === 'confirmPassword') check('confirmPassword', () => validateConfirmPassword(formData.password, formData.confirmPassword, lang));
        if (field === 'industry' && formData.role === 'company') {
            if (!formData.industry.trim())
                e.industry = lang === 'ar' ? 'يرجى اختيار القطاع' : 'Please select an industry';
            else
                delete e.industry;
        }

        setErrors(e);
    };

    // Clear confirm-password error when password changes
    const handlePasswordChange = (value) => {
        const e = { ...errors };
        delete e.password;
        delete e.confirmPassword;
        setFormData(f => ({ ...f, password: value }));
        setErrors(e);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            // Scroll to first error
            const firstErr = document.querySelector('[data-error="true"]');
            firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const roleName = formData.role === 'seeker' ? 'Job Seeker' : 'Employer';

            const userResponse = await api.register({
                name:     formData.fullName.trim(),
                email:    formData.email.trim().toLowerCase(),
                pass:     formData.password,
                roleName: roleName,
                industry: formData.role === 'company' ? formData.industry.trim() : ''
            });

            const dashboardPaths = {
                'admin':      '/dashboard/admin',
                'employer':   '/dashboard/employer',
                'job seeker': '/dashboard/seeker'
            };

            const userRole = (userResponse.role || 'job seeker').toLowerCase().trim();
            const userData = {
                ...userResponse,
                dashboardPath: dashboardPaths[userRole] || '/dashboard/seeker'
            };

            login(userData);
            navigate(userData.dashboardPath, { replace: true });
        } catch (err) {
            const msg = err.message || '';
            const isEmailTaken = msg.toLowerCase().includes('already registered')
                || msg.toLowerCase().includes('already exists');
            setErrors({
                email: isEmailTaken
                    ? (lang === 'ar'
                        ? 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.'
                        : 'This email is already registered. Please sign in instead.')
                    : (msg || (lang === 'ar' ? 'فشل التسجيل. يرجى المحاولة مرة أخرى.' : 'Registration failed. Please try again.'))
            });
        } finally {
            setLoading(false);
        }
    };

    // Password strength indicator
    const strength = (() => {
        const p = formData.password;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();

    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthLabelAr = ['', 'ضعيف', 'مقبول', 'جيد', 'قوي'];
    const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">{t('registerHeader')}</h1>
                    <p className="auth-subtitle">{t('registerSubtitle')}</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {/* Role selector */}
                    <div className="role-selector">
                        {[
                            { val: 'seeker',  Icon: Briefcase, label: t('jobSeeker') },
                            { val: 'company', Icon: Building,  label: t('company') },
                        ].map(({ val, Icon, label }) => (
                            <label key={val} className="role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value={val}
                                    checked={formData.role === val}
                                    onChange={() => setFormData(f => ({ ...f, role: val, industry: '' }))}
                                    disabled={loading}
                                />
                                <div className="role-card">
                                    <Icon size={24} />
                                    <span className="role-label">{label}</span>
                                </div>
                            </label>
                        ))}
                    </div>

                    {/* Full name */}
                    <div data-error={!!errors.fullName || undefined}>
                        <Input
                            label={t('fullName')}
                            placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full name'}
                            icon={User}
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData(f => ({ ...f, fullName: e.target.value }))}
                            onBlur={() => handleBlur('fullName')}
                            error={errors.fullName}
                            disabled={loading}
                            autoComplete="name"
                        />
                    </div>

                    {/* Industry — company only */}
                    {formData.role === 'company' && (
                        <div className="input-group" data-error={!!errors.industry || undefined}>
                            <label className="input-label">{t('industry')}</label>
                            <div className="input-wrapper has-icon">
                                <Building className="input-icon" size={20} />
                                <select
                                    className={`input-field${errors.industry ? ' input-error' : ''}`}
                                    value={formData.industry}
                                    onChange={(e) => setFormData(f => ({ ...f, industry: e.target.value }))}
                                    onBlur={() => handleBlur('industry')}
                                    disabled={loading}
                                    style={{ appearance: 'none', background: 'transparent' }}
                                >
                                    <option value="" disabled>{t('selectIndustry')}</option>
                                    {[
                                        'Technology','Healthcare','Finance','Education',
                                        'Manufacturing','Retail','Real Estate','Transportation',
                                        'Hospitality','Construction','Marketing','Media','Other'
                                    ].map(ind => (
                                        <option key={ind} value={ind}
                                            style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                                            {t(ind.toLowerCase().replace(' ', '')) || ind}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.industry && (
                                <p className="input-error-msg">{errors.industry}</p>
                            )}
                        </div>
                    )}

                    {/* Email */}
                    <div data-error={!!errors.email || undefined}>
                        <Input
                            label={t('email')}
                            placeholder="example@mail.com"
                            icon={Mail}
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                            onBlur={() => handleBlur('email')}
                            error={errors.email}
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    {/* Password */}
                    <div data-error={!!errors.password || undefined}>
                        <Input
                            label={t('password')}
                            placeholder="••••••••"
                            icon={Lock}
                            type="password"
                            value={formData.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            onBlur={() => handleBlur('password')}
                            error={errors.password}
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        {/* Password strength bar */}
                        {formData.password.length > 0 && (
                            <div style={{ marginTop: '0.4rem' }}>
                                <div style={{ display: 'flex', gap: '3px', marginBottom: '0.2rem' }}>
                                    {[1,2,3,4].map(i => (
                                        <div key={i} style={{
                                            flex: 1, height: 4, borderRadius: 2,
                                            background: i <= strength ? strengthColor[strength] : 'var(--border-color)',
                                            transition: 'background 0.3s'
                                        }} />
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.75rem', color: strengthColor[strength] || 'var(--text-muted)' }}>
                                    {lang === 'ar' ? strengthLabelAr[strength] : strengthLabel[strength]}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div data-error={!!errors.confirmPassword || undefined}>
                        <Input
                            label={t('confirmPassword')}
                            placeholder="••••••••"
                            icon={Lock}
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(f => ({ ...f, confirmPassword: e.target.value }))}
                            onBlur={() => handleBlur('confirmPassword')}
                            error={errors.confirmPassword}
                            disabled={loading}
                            autoComplete="new-password"
                        />
                    </div>

                    <Button type="submit" className="btn-full" disabled={loading}>
                        {loading
                            ? (lang === 'ar' ? 'جارٍ التسجيل...' : 'Registering...')
                            : t('registerBtn')}
                    </Button>
                </form>

                <div className="auth-footer">
                    {t('haveAccount')}
                    <Link to="/login" className="auth-link">{t('loginBtn')}</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
