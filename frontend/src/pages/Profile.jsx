import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    Phone
} from 'lucide-react';
import { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './User.css';

const Profile = () => {
    const { id } = useParams();
    const { t } = useLanguage();
    const { user: currentUser, updateUser } = useAuth();
    const { addToast } = useToast();
    const fileInputRef = useRef(null);

    const isOwnProfile = !id || id === currentUser?.id?.toString();
    // Stable ID used as effect dependency — avoids re-running after save when currentUser object reference changes
    const currentUserId = currentUser?.id;

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
        role: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (isOwnProfile) {
                setFormData({
                    name: currentUser?.name || '',
                    email: currentUser?.email || '',
                    location: currentUser?.location || '',
                    bio: currentUser?.description || '',
                    website: currentUser?.website || '',
                    linkedin: currentUser?.linkedIn || '',
                    github: currentUser?.github || '',
                    phone: currentUser?.phone || '',
                    photo: getImageUrl(currentUser?.profilePicture || currentUser?.photo) || null,
                    role: currentUser?.role || ''
                });
            } else {
                setIsLoading(true);
                try {
                    const fetchedUser = await api.getUser(id, currentUser?.id);
                    setFormData({
                        name: fetchedUser.name || '',
                        email: fetchedUser.email || '',
                        location: fetchedUser.location || '',
                        bio: fetchedUser.description || '',
                        website: fetchedUser.website || '',
                        linkedin: fetchedUser.linkedIn || '',
                        github: fetchedUser.github || '',
                        phone: fetchedUser.phone || '',
                        photo: getImageUrl(fetchedUser.profilePicture) || null,
                        role: fetchedUser.role || ''
                    });
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    addToast(t('actionFailed') || 'Failed to load user profile.', 'error');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchUserData();
    }, [id, currentUserId]); // intentionally omit full currentUser object — avoids overwriting form after save

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show a local preview immediately while upload is in progress
        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
        reader.readAsDataURL(file);

        try {
            const result = await api.uploadProfilePicture(currentUser.id, file);
            const fullUrl = getImageUrl(result.imagePath);
            setFormData(prev => ({ ...prev, photo: fullUrl }));
            // Keep the auth context in sync so the avatar in the navbar updates too
            updateUser({ profilePicture: result.imagePath });
            addToast(t('profileUpdated') || 'Profile picture updated!', 'success');
        } catch (error) {
            addToast(t('actionFailed') || 'Failed to upload profile picture.', 'error');
        }
    };

    const handleSave = async () => {
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
            };

            const updatedUser = await updateUser(payload);

            setFormData(prev => ({
                ...prev,
                name:     updatedUser.name     || prev.name,
                email:    updatedUser.email    || prev.email,
                location: updatedUser.location ?? prev.location,
                bio:      updatedUser.description ?? prev.bio,
                website:  updatedUser.website  ?? prev.website,
                linkedin: updatedUser.linkedIn  ?? prev.linkedin,
                github:   updatedUser.github   ?? prev.github,
                phone:    updatedUser.phone    ?? prev.phone,
            }));

            addToast(t('profileUpdated'), 'success');
        } catch (error) {
            addToast(t('actionFailed') || 'Failed to update profile. Please try again.', 'error');
        }
    };

    return (
        <div className="user-page-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">{isOwnProfile ? t('profile') : t('userProfile')}</h1>
                {isOwnProfile && (
                    <Button onClick={handleSave}>
                        <Save size={20} />
                        {t('saveProfile')}
                    </Button>
                )}
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
                        {isOwnProfile && (
                            <div className="avatar-overlay" onClick={() => fileInputRef.current.click()}>
                                <Camera size={24} />
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{formData.name}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{formData.role === 'Employer' || formData.role === 'Company' ? t('employer') : t('jobSeeker')}</p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <Button variant="secondary" style={{ padding: '0.5rem' }}><Linkedin size={20} /></Button>
                        <Button variant="secondary" style={{ padding: '0.5rem' }}><Github size={20} /></Button>
                        <Button variant="secondary" style={{ padding: '0.5rem' }}><Globe size={20} /></Button>
                    </div>
                </aside>

                <div className="dashboard-section" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input
                            label={t('fullName')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            icon={User}
                        />
                        <Input
                            label={t('email')}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            icon={Mail}
                            type="email"
                        />
                        <div className="input-group">
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <MapPin size={16} /> {t('locationPlaceholder')}
                            </label>
                            <select
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            >
                                <option value="">{t('selectLocation') || 'Select Location'}</option>
                                {['Amman', 'Irbid', 'Zarqa', 'Balqa', 'Madaba', 'Karak', 'Tafilah', 'Ma\'an', 'Aqaba', 'Mafraq', 'Jerash', 'Ajloun'].map(city => (
                                    <option key={city} value={city}>{t(city.toLowerCase().replace("'", ''))}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label={t('website')}
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            icon={Globe}
                        />
                        <Input
                            label={t('phone')}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            icon={Phone}
                            type="tel"
                            disabled={!isOwnProfile}
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
                        />
                        <Input
                            label={t('github')}
                            value={formData.github}
                            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                            icon={Github}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
