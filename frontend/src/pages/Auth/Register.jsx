import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import './Auth.css';

const Register = () => {
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ 
        fullName: '', 
        email: '', 
        password: '', 
        confirmPassword: '', 
        role: 'seeker',
        industry: '' 
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName) newErrors.fullName = t('nameRequired');
        if (!formData.email) newErrors.email = t('emailRequired');
        if (!formData.password) {
            newErrors.password = t('passRequired');
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (!formData.confirmPassword) {
            newErrors.confirmPassword = t('passRequired');
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('passMismatch');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({});

        try {
            const roleName = formData.role === 'seeker' ? 'Job Seeker' : 'Employer';

            const userResponse = await api.register({
                name: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                pass: formData.password,
                roleName: roleName,
                industry: formData.role === 'company' ? formData.industry.trim() : ''
            });

            const dashboardPaths = {
                'admin': '/dashboard/admin',
                'employer': '/dashboard/employer',
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
            console.error('Registration failed:', err);
            const msg = err.message || '';
            const isEmailTaken = msg.toLowerCase().includes('already registered')
                || msg.toLowerCase().includes('already exists');
            setErrors({
                email: isEmailTaken
                    ? 'This email is already registered. Please sign in instead.'
                    : msg || 'Registration failed. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">{t('registerHeader')}</h1>
                    <p className="auth-subtitle">{t('registerSubtitle')}</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="role-selector">
                        <label className="role-option">
                            <input
                                type="radio"
                                name="role"
                                value="seeker"
                                checked={formData.role === 'seeker'}
                                onChange={() => setFormData({ ...formData, role: 'seeker' })}
                                disabled={loading}
                            />
                            <div className="role-card">
                                <Briefcase size={24} />
                                <span className="role-label">{t('jobSeeker')}</span>
                            </div>
                        </label>
                        <label className="role-option">
                            <input
                                type="radio"
                                name="role"
                                value="company"
                                checked={formData.role === 'company'}
                                onChange={() => setFormData({ ...formData, role: 'company' })}
                                disabled={loading}
                            />
                            <div className="role-card">
                                <Building size={24} />
                                <span className="role-label">{t('company')}</span>
                            </div>
                        </label>
                    </div>

                    <Input
                        label={t('fullName')}
                        placeholder="full name"
                        icon={User}
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        error={errors.fullName}
                        disabled={loading}
                    />
                    {formData.role === 'company' && (
                        <Input
                            label={t('industry')}
                            placeholder={t('industryPlaceholder')}
                            icon={Building}
                            type="text"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            disabled={loading}
                            required
                        />
                    )}
                    <Input
                        label={t('email')}
                        placeholder="example@mail.com"
                        icon={Mail}
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={errors.email}
                        disabled={loading}
                    />
                    <Input
                        label={t('password')}
                        placeholder="••••••••"
                        icon={Lock}
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        error={errors.password}
                        disabled={loading}
                    />
                    <Input
                        label={t('confirmPassword')}
                        placeholder="••••••••"
                        icon={Lock}
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        error={errors.confirmPassword}
                        disabled={loading}
                    />


                    <Button 
                        type="submit" 
                        className="btn-full"
                        disabled={loading}
                    >
                        {loading ? t('registering') : t('registerBtn')}
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
