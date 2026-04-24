import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Scale, CheckCircle, User, ShieldAlert, Briefcase, FileSignature, Power, AlertTriangle, RefreshCw, Gavel } from 'lucide-react';
import './TermsOfService.css';

const TermsOfService = () => {
    const { t, dir } = useLanguage();

    const sections = [
        {
            icon: <CheckCircle size={24} />,
            title: t('termsAcceptance'),
            desc: t('termsAcceptanceDesc')
        },
        {
            icon: <User size={24} />,
            title: t('userAccountsTitle'),
            desc: t('userAccountsDesc'),
            items: [
                t('accurateInfoItem'),
                t('accountSecurityItem'),
                t('noSharingItem')
            ]
        },
        {
            icon: <ShieldAlert size={24} />,
            title: t('platformUseTitle'),
            desc: t('platformUseDesc'),
            items: [
                t('legalUseItem'),
                t('noHarmfulItem')
            ]
        },
        {
            icon: <Briefcase size={24} />,
            title: t('jobListingsTitle'),
            desc: t('jobListingsDesc'),
            items: [
                t('companyResponsibilityItem'),
                t('noGuaranteeItem'),
                t('userResponsibilityItem')
            ]
        },
        {
            icon: <FileSignature size={24} />,
            title: t('contentOwnershipTitle'),
            desc: t('contentOwnershipDesc'),
            items: [
                t('ownershipItem'),
                t('licenseItem')
            ]
        },
        {
            icon: <Power size={24} />,
            title: t('terminationTitle'),
            desc: t('terminationDesc')
        },
        {
            icon: <AlertTriangle size={24} />,
            title: t('liabilityTitle'),
            desc: t('liabilityDesc'),
            items: [
                t('hiringDecisionItem'),
                t('interactionItem')
            ]
        },
        {
            icon: <RefreshCw size={24} />,
            title: t('termsChangesTitle'),
            desc: t('termsChangesDesc')
        },
        {
            icon: <Gavel size={24} />,
            title: t('governingLawTitle'),
            desc: t('governingLawDesc')
        }
    ];

    return (
        <div className="terms-container" dir={dir}>
            <header className="terms-header">
                <Scale className="terms-hero-icon" size={64} />
                <h1>{t('termsOfService')}</h1>
                <div className="terms-intro glass">
                    <p>{t('termsIntro')}</p>
                </div>
            </header>

            <div className="terms-content">
                {sections.map((section, index) => (
                    <section key={index} className="terms-section glass">
                        <div className="section-header">
                            <div className="section-icon">{section.icon}</div>
                            <h2>{section.title}</h2>
                        </div>
                        <p>{section.desc}</p>
                        {section.items && (
                            <ul className="terms-list">
                                {section.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}

                <div className="terms-contact glass">
                    <h2>{t('contactUs')}</h2>
                    <p>{t('contactUsTerms')}</p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
