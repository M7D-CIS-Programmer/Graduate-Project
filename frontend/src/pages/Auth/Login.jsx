import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { validateEmail, validatePasswordLogin } from '../../utils/validators';
import { SuspendedError } from '../../api/api';
import './Auth.css';

const Login = () => {
    const { login } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const lang = language || 'en';

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        const emailErr = validateEmail(formData.email, lang);
        if (emailErr) newErrors.email = emailErr;

        const passErr = validatePasswordLogin(formData.password, lang);
        if (passErr) newErrors.password = passErr;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Live field validation on blur
    const handleBlur = (field) => {
        const newErrors = { ...errors };
        if (field === 'email') {
            const err = validateEmail(formData.email, lang);
            err ? (newErrors.email = err) : delete newErrors.email;
        }
        if (field === 'password') {
            const err = validatePasswordLogin(formData.password, lang);
            err ? (newErrors.password = err) : delete newErrors.password;
        }
        setErrors(newErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({});

        try {
            const response = await api.login({
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            });

            const dashboardPaths = {
                'admin': '/dashboard/admin',
                'employer': '/dashboard/employer',
                'job seeker': '/dashboard/seeker'
            };

            const userRole = (response.role || 'job seeker').toLowerCase().trim();
            const userData = {
                ...response,
                dashboardPath: dashboardPaths[userRole] || '/dashboard/seeker'
            };

            login(userData);
            navigate(userData.dashboardPath, { replace: true });
        } catch (err) {
            if (err instanceof SuspendedError) {
                // Show a dedicated suspension banner instead of the generic error
                setErrors({
                    suspended: lang === 'ar'
                        ? 'تم تعليق حسابك مؤقتاً من قِبَل المسؤول. يرجى التواصل مع الدعم للاستفسار.'
                        : 'Your account has been temporarily suspended by the administrator. Please contact support.'
                });
            } else {
                setErrors({
                    email: err.message ||
                        (lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password')
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">{t('loginHeader')}</h1>
                    <p className="auth-subtitle">{t('loginSubtitle')}</p>
                </div>

                {/* Suspension banner — shown instead of the regular form errors */}
                {errors.suspended && (
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem',
                    }}>
                        <ShieldOff size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                        <p style={{ margin: 0, color: '#ef4444', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            {errors.suspended}
                        </p>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <Input
                        label={t('email')}
                        placeholder="example@mail.com"
                        icon={Mail}
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onBlur={() => handleBlur('email')}
                        error={errors.email}
                        disabled={loading}
                        autoComplete="email"
                    />
                    <Input
                        label={t('password')}
                        placeholder="••••••••"
                        icon={Lock}
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onBlur={() => handleBlur('password')}
                        error={errors.password}
                        disabled={loading}
                        autoComplete="current-password"
                    />

                    <Button
                        type="submit"
                        className="btn-full"
                        disabled={loading}
                    >
                        {loading
                            ? (lang === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Logging in...')
                            : t('loginBtn')}
                    </Button>
                </form>

                <div className="auth-footer">
                    {t('noAccount')}
                    <Link to="/register" className="auth-link">{t('registerBtn')}</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
