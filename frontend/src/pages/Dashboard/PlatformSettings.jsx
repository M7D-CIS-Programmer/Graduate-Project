import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
    Settings as SettingsIcon,
    Shield,
    Server,
    Save,
    Trash2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './Dashboard.css';

const PlatformSettings = () => {
    const { t, dir } = useLanguage();
    const { addToast } = useToast();

    // Mock State for Settings
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'JobPortal Pro',
        contactEmail: 'support@jobportal.com'
    });

    const [securitySettings, setSecuritySettings] = useState({
        requireEmailVerification: true,
        twoFactorAuth: false,
        passwordPolicy: true
    });

    const [systemSettings, setSystemSettings] = useState({
        maintenanceMode: false
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleSave = () => {
        setIsSaving(true);
        setSaveMessage('');

        // Mock API call
        setTimeout(() => {
            setIsSaving(false);
            setSaveMessage(t('saveChanges') + ' ✓');
            setTimeout(() => setSaveMessage(''), 3000);
        }, 1000);
    };

    const handleClearCache = () => {
        if (window.confirm(t('clearCache') + '?')) {
            addToast('Cache cleared successfully.', 'success');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('platformSettings')}</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t('overview')}</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ minWidth: '150px' }}
                >
                    <Save size={18} />
                    {isSaving ? '...' : saveMessage || t('saveChanges')}
                </button>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>

                {/* General Settings */}
                <section className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}>
                            <SettingsIcon size={20} />
                        </div>
                        <h2 className="section-title" style={{ margin: 0 }}>{t('generalSettings')}</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('siteName')}</label>
                            <input
                                type="text"
                                className="glass"
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                                value={generalSettings.siteName}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('contactEmail')}</label>
                            <input
                                type="email"
                                className="glass"
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                                value={generalSettings.contactEmail}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* Security Settings */}
                <section className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem', borderRadius: '8px' }}>
                            <Shield size={20} />
                        </div>
                        <h2 className="section-title" style={{ margin: 0 }}>{t('securitySettings')}</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0' }}>{t('requireEmailVerification')}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Users must verify their email before accessing features.</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={securitySettings.requireEmailVerification}
                                onChange={(e) => setSecuritySettings({ ...securitySettings, requireEmailVerification: e.target.checked })}
                                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                            />
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0' }}>{t('twoFactorAuth')}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Require 2FA for all admin accounts.</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={securitySettings.twoFactorAuth}
                                onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                            />
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0' }}>{t('passwordPolicy')}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Require complex passwords (min 8 chars, numbers, symbols).</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={securitySettings.passwordPolicy}
                                onChange={(e) => setSecuritySettings({ ...securitySettings, passwordPolicy: e.target.checked })}
                                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                            />
                        </label>
                    </div>
                </section>

                {/* System Settings */}
                <section className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.5rem', borderRadius: '8px' }}>
                            <Server size={20} />
                        </div>
                        <h2 className="section-title" style={{ margin: 0 }}>{t('systemSettings')}</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#ef4444' }}>{t('maintenanceMode')}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Take the website offline for regular users.</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={systemSettings.maintenanceMode}
                                onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                                style={{ width: '20px', height: '20px', accentColor: '#ef4444' }}
                            />
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0' }}>{t('cacheManagement')}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clear application cache to resolve rendering issues.</span>
                            </div>
                            <button
                                className="btn-icon"
                                onClick={handleClearCache}
                                style={{
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    gap: '0.5rem',
                                    alignItems: 'center'
                                }}
                            >
                                <Trash2 size={16} />
                                {t('clearCache')}
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default PlatformSettings;
