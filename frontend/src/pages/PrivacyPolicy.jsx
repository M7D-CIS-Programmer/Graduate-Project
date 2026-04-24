import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Lock, Eye, FileText, UserCheck, Globe, Info } from 'lucide-react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    const { t, dir } = useLanguage();

    const sections = [
        {
            icon: <Info size={24} />,
            title: t('infoWeCollectTitle'),
            desc: t('infoWeCollectDesc'),
            items: [
                t('personalInfoItem'),
                t('accountDataItem'),
                t('jobDataItem'),
                t('usageDataItem')
            ]
        },
        {
            icon: <FileText size={24} />,
            title: t('howWeUseTitle'),
            desc: t('howWeUseDesc'),
            items: [
                t('useAccountItem'),
                t('useApplicationItem'),
                t('useConnectItem'),
                t('useImproveItem')
            ]
        },
        {
            icon: <Eye size={24} />,
            title: t('sharingTitle'),
            desc: t('sharingDesc'),
            items: [
                t('shareEmployerItem'),
                t('shareProviderItem'),
                t('shareLawItem')
            ]
        },
        {
            icon: <Lock size={24} />,
            title: t('dataProtectionTitle'),
            desc: t('dataProtectionDesc')
        },
        {
            icon: <UserCheck size={24} />,
            title: t('userRightsTitle'),
            desc: t('userRightsDesc'),
            items: [
                t('userRightsAccess'),
                t('userRightsUpdate'),
                t('userRightsRequest')
            ]
        },
        {
            icon: <Globe size={24} />,
            title: t('cookiesTitle'),
            desc: t('cookiesDesc')
        }
    ];

    return (
        <div className={`privacy-container ${dir}`}>
            <header className="privacy-header">
                <Shield className="privacy-hero-icon" size={64} />
                <h1>{t('privacyPolicy')}</h1>
                <div className="privacy-intro glass">
                    <p><strong>{t('privacyIntro')}</strong></p>
                    <p>{t('privacyIntroDesc')}</p>
                </div>
            </header>

            <div className="privacy-content">
                {sections.map((section, index) => (
                    <section key={index} className="privacy-section glass">
                        <div className="section-header">
                            <div className="section-icon">{section.icon}</div>
                            <h2>{section.title}</h2>
                        </div>
                        <p>{section.desc}</p>
                        {section.items && (
                            <ul className="privacy-list">
                                {section.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}

                <section className="privacy-section glass">
                    <div className="section-header">
                        <div className="section-icon"><FileText size={24} /></div>
                        <h2>{t('policyChangesTitle')}</h2>
                    </div>
                    <p>{t('policyChangesDesc')}</p>
                </section>

                <div className="privacy-contact glass">
                    <h2>{t('contactUs')}</h2>
                    <p>{t('contactUsPrivacy')}</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
