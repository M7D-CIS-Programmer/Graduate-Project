import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings as SettingsIcon,
    Lock,
    Bell,
    User,
    Globe,
    Shield,
    Trash2,
    Save,
    Smartphone,
    AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import './Settings.css';

const Settings = () => {
    const { t, language, toggleLanguage, dir } = useLanguage();
    const { user, logout } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    // Form States
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSaveSecurity = (e) => {
        e.preventDefault();
        addToast(t('saveChanges') + '!', 'success');
        setPasswordData({ current: '', new: '', confirm: '' });
    };

    const handleDeleteAccount = async () => {
        if (!user?.id) return;
        setIsDeleting(true);
        try {
            await api.deleteUser(user.id);
            addToast(t('accountDeletedSuccess') || 'Account deleted successfully', 'success');
            logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to delete account', error);
            addToast(error.message || t('actionFailed'), 'error');
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="user-page-container" dir={dir}>
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
                                {t('deleteAccountWarning')}
                            </p>
                            <Button 
                                variant="secondary" 
                                style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                {t('deleteAccount')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={t('deleteAccount') || 'Delete Account'}
                type="danger"
                footer={(
                    <>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                            {t('cancel')}
                        </Button>
                        <Button 
                            style={{ background: '#ef4444' }} 
                            onClick={handleDeleteAccount}
                            loading={isDeleting}
                        >
                            {t('delete')}
                        </Button>
                    </>
                )}
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '50%', 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        color: '#ef4444', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <AlertTriangle size={32} />
                    </div>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        {t('deleteUserConfirmation') || 'Are you sure you want to delete your account?'}
                    </p>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {t('deleteAccountWarning') || 'This action is permanent and all your data will be lost.'}
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;
