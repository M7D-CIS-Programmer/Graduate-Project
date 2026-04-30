import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getImageUrl } from '../api/api';
import {
    User,
    Mail,
    MapPin,
    Briefcase,
    Camera,
    Globe,
    Github,
    Linkedin,
    Save,
    Phone,
    ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './User.css';

const EditProfile = () => {
    const { t, dir } = useLanguage();
    const { user: currentUser, updateUser } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        location: '',
        bio: '',
        website: '',
        linkedin: '',
        github: '',
        phone: '',
        photo: null,
        role: '',
        industry: ''
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            location: currentUser.location || '',
            bio: currentUser.description || '',
            website: currentUser.website || '',
            linkedin: currentUser.linkedIn || '',
            github: currentUser.github || '',
            phone: currentUser.phone || '',
            photo: getImageUrl(currentUser.profilePicture) || null,
            role: currentUser.role || '',
            industry: currentUser.industry || ''
        });
    }, [currentUser, navigate]);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
        reader.readAsDataURL(file);

        try {
            const result = await api.uploadProfilePicture(currentUser.id, file);
            updateUser({ profilePicture: result.imagePath });
            addToast(t('profileUpdated'), 'success');
        } catch (error) {
            addToast(t('actionFailed'), 'error');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                location: formData.location,
                website: formData.website,
                phone: formData.phone,
                description: formData.bio,
                linkedIn: formData.linkedin,
                github: formData.github,
                industry: formData.industry,
            };

            await updateUser(payload);
            addToast(t('profileUpdated'), 'success');
            navigate('/profile');
        } catch (error) {
            addToast(t('actionFailed'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="user-page-container" dir={dir}>
            <div className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="cv-back-btn" onClick={() => navigate('/profile')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="dashboard-title">{t('editProfile') || 'Edit Profile'}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{t('updateInfoMsg') || 'Keep your profile information up to date'}</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save size={20} />
                    {isSaving ? t('saving') || 'Saving...' : t('saveChanges')}
                </Button>
            </div>

            <div className="profile-layout">
                <aside className="profile-card-left">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar-large">
                            {formData.photo ? (
                                <img src={formData.photo} alt={formData.name} />
                            ) : (
                                formData.name.charAt(0)
                            )}
                        </div>
                        <div className="avatar-overlay" onClick={() => fileInputRef.current.click()}>
                            <Camera size={24} />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{formData.name}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        {formData.role === 'Employer' || formData.role === 'Company' ? t('employer') : t('jobSeeker')}
                    </p>
                </aside>

                <form className="dashboard-section" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input
                            label={t('fullName')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            icon={User}
                            required
                        />
                        <Input
                            label={t('email')}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            icon={Mail}
                            type="email"
                            required
                        />
                        
                        {(formData.role === 'Employer' || formData.role === 'Company') && (
                            <div className="input-group">
                                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Briefcase size={16} /> {t('industry') || 'Industry'}
                                </label>
                                <select
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    className="focus:border-primary"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-main)',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">{t('selectIndustry') || 'Select Industry'}</option>
                                    {[
                                        'Technology', 'Healthcare', 'Finance', 'Education', 
                                        'Manufacturing', 'Retail', 'Real Estate', 'Transportation', 
                                        'Hospitality', 'Construction', 'Marketing', 'Media', 'Other'
                                    ].map(ind => (
                                        <option key={ind} value={ind}>{t(ind.toLowerCase().replace(' ', '')) || ind}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="input-group">
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <MapPin size={16} /> {t('locationPlaceholder')}
                            </label>
                            <select
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-main)',
                                    outline: 'none'
                                }}
                            >
                                <option value="">{t('selectLocation') || 'Select Location'}</option>
                                {['Amman', 'Irbid', 'Zarqa', 'Balqa', 'Madaba', 'Karak', 'Tafilah', 'Ma\'an', 'Aqaba', 'Mafraq', 'Jerash', 'Ajloun'].map(city => (
                                    <option key={city} value={city}>{t(city.toLowerCase().replace("'", '')) || city}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label={t('website')}
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            icon={Globe}
                            placeholder="https://example.com"
                        />
                        <Input
                            label={t('phone')}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            icon={Phone}
                            type="tel"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t('aboutMe')}</label>
                        <textarea
                            style={{
                                width: '100%',
                                minHeight: '150px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                padding: '1rem',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontFamily: 'inherit',
                                transition: 'var(--transition)'
                            }}
                            className="focus:border-primary"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        ></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input
                            label={t('linkedin')}
                            value={formData.linkedin}
                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                            icon={Linkedin}
                            placeholder="LinkedIn Profile URL"
                        />
                        <Input
                            label={t('github')}
                            value={formData.github}
                            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                            icon={Github}
                            placeholder="GitHub Profile URL"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
