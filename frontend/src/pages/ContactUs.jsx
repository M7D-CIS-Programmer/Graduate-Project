import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import './ContactUs.css';

const ContactUs = () => {
    const { t } = useLanguage();

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(t('contactSuccess'));
    };

    return (
        <div className="contact-container">
            <section className="contact-hero">
                <h1>{t('contactHeroTitle').split(' ').slice(0, -1).join(' ')} <span className="highlight">{t('contactHeroTitle').split(' ').pop()}</span></h1>
                <p>{t('contactHeroDesc')}</p>
            </section>

            <div className="contact-grid">
                <div className="contact-info">
                    <div className="info-card glass">
                        <div className="info-icon"><Mail /></div>
                        <div>
                            <h4>{t('emailUs')}</h4>
                            <p>support@insightcv.com</p>
                            <p>info@insightcv.com</p>
                        </div>
                    </div>

                    <div className="info-card glass">
                        <div className="info-icon"><Phone /></div>
                        <div>
                            <h4>{t('callUs')}</h4>
                            <p>+962 (6) 123-4567</p>
                            <p>+962 (79) 000-0000</p>
                        </div>
                    </div>

                    <div className="info-card glass">
                        <div className="info-icon"><MapPin /></div>
                        <div>
                            <h4>{t('visitUs')}</h4>
                            <p>{t('visitUsAmman')}</p>
                        </div>
                    </div>

                    <div className="info-card glass">
                        <div className="info-icon"><Clock /></div>
                        <div>
                            <h4>{t('workingHours')}</h4>
                            <p>{t('workingHoursSunThu')}</p>
                            <p>{t('workingHoursSat')}</p>
                        </div>
                    </div>
                </div>

                <form className="contact-form glass" onSubmit={handleSubmit}>
                    <div className="form-header">
                        <MessageSquare size={24} color="var(--primary)" />
                        <h3>{t('sendUsMessage')}</h3>
                    </div>

                    <div className="form-group">
                        <label>{t('fullName')}</label>
                        <input type="text" placeholder={t('fullName')} required />
                    </div>

                    <div className="form-group">
                        <label>{t('email')}</label>
                        <input type="email" placeholder={t('email')} required />
                    </div>

                    <div className="form-group">
                        <label>{t('subject')}</label>
                        <input type="text" placeholder={t('subjectPlaceholder')} required />
                    </div>

                    <div className="form-group">
                        <label>{t('message')}</label>
                        <textarea rows="5" placeholder={t('messagePlaceholder')} required></textarea>
                    </div>

                    <button type="submit" className="btn-primary">
                        <Send size={18} />
                        {t('sendMessage')}
                    </button>
                </form>
            </div>


        </div>
    );
};

export default ContactUs;
