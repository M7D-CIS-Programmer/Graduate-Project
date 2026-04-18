import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import './Auth.css';

const Login = () => {
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = t('emailRequired');
        if (!formData.password) newErrors.password = t('passRequired');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({});

        try {
            const response = await api.login({ 
                email: formData.email, 
                password: formData.password 
            });
            
            // Map roles to dashboard paths
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
            console.error('Login failed:', err);
            setErrors({ 
                email: t('invalidCredentials') || 'Invalid email or password' 
            });
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

                <form className="auth-form" onSubmit={handleSubmit}>
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

                    <Button 
                        type="submit" 
                        className="btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : t('loginBtn')}
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
