import React, { useState } from 'react';
import {
    Settings as SettingsIcon,
    Lock,
    Bell,
    User,
    Globe,
    Shield,
    Trash2,
    Save,
    Smartphone
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import './Settings.css';

const Settings = () => {
    const { t, language, toggleLanguage, dir } = useLanguage();
    const { user } = useAuth();
    const { addToast } = useToast();

    // Form States
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [notifications, setNotifications] = useState({
        email: true,
        push: false
    });



    const handleSaveSecurity = (e) => {
        e.preventDefault();
        addToast(t('saveChanges') + '!', 'success');
        setPasswordData({ current: '', new: '', confirm: '' });
    };

    return (
        <div className="user-page-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('settings')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('accountSettings')}</p>
                </div>
            </div>

            <div className="settings-grid">
                {/* Left Column: Sections */}
                <div className="settings-content">
                    {/* Security Section */}
                    <div className="dashboard-section">
                        <h3 className="section-title">
                            <Lock size={20} />
                            {t('security')}
                        </h3>
                        <form onSubmit={handleSaveSecurity} className="settings-form">
                            <div className="input-grid">
                                <Input
                                    label={t('currentPassword')}
                                    type="password"
                                    icon={Lock}
                                    value={passwordData.current}
                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                />
                                <Input
                                    label={t('newPassword')}
                                    type="password"
                                    icon={Shield}
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                />
                                <Input
                                    label={t('confirmPassword')}
                                    type="password"
                                    icon={Shield}
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                />
                            </div>
                            <Button type="submit" style={{ marginTop: '1.5rem' }}>
                                <Save size={18} />
                                {t('saveChanges')}
                            </Button>
                        </form>
                    </div>

                    {/* Notifications Section */}
                    <div className="dashboard-section">
                        <h3 className="section-title">
                            <Bell size={20} />
                            {t('notificationPreferences')}
                        </h3>
                        <div className="toggle-list">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-label">{t('emailNotifications')}</span>
                                    <span className="toggle-desc">{t('emailNotifDesc')}</span>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={notifications.email}
                                        onChange={() => setNotifications({ ...notifications, email: !notifications.email })}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-label">{t('pushNotifications')}</span>
                                    <span className="toggle-desc">{t('pushNotifDesc')}</span>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={notifications.push}
                                        onChange={() => setNotifications({ ...notifications, push: !notifications.push })}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="dashboard-section">
                        <h3 className="section-title">
                            <Globe size={20} />
                            {t('languageAndRegion')}
                        </h3>
                        <div className="preference-item">
                            <span>{t('rolePlaceholder')} ({language === 'en' ? 'English' : 'العربية'})</span>
                            <Button variant="secondary" onClick={toggleLanguage}>
                                {language === 'en' ? t('switchToArabic') : t('switchToEnglish')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Account & Hazards */}
                <div className="settings-sidebar">

                    {user && (
                        <div className="dashboard-section danger-zone">
                            <h3 className="section-title" style={{ color: '#ef4444' }}>
                                <Trash2 size={20} />
                                {t('deleteAccount')}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '1.5rem' }}>
<<<<<<< HEAD:frontend/src/pages/Settings/Settings.jsx
                                {t('deleteAccountWarning')}
=======
                                Once you delete your account, there is no going back. Please be certain.
>>>>>>> 8905e2557c6f8eee2d2c02b1bfe69f0d5638ceb3:src/pages/Settings/Settings.jsx
                            </p>
                            <Button variant="secondary" style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}>
                                {t('deleteAccount')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
