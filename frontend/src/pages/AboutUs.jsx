import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Users, Target, Shield, Award } from 'lucide-react';
import './AboutUs.css';

const AboutUs = () => {
    const { t } = useLanguage();

    const values = [
        {
            icon: <Users size={32} />,
            title: t('communityFirst'),
            desc: t('communityFirstDesc')
        },
        {
            icon: <Target size={32} />,
            title: t('smartMatching'),
            desc: t('smartMatchingDesc')
        },
        {
            icon: <Shield size={32} />,
            title: t('secureTrusted'),
            desc: t('secureTrustedDesc')
        },
        {
            icon: <Award size={32} />,
            title: t('innovation'),
            desc: t('innovationDesc')
        }
    ];

    return (
        <div className="about-container">
            <section className="about-hero">
                <div className="hero-content">
                    <h1>{t('aboutHeroTitle').split(' ').slice(0, -1).join(' ')} <span className="highlight">{t('aboutHeroTitle').split(' ').pop()}</span></h1>
                    <p>{t('aboutHeroDesc')}</p>
                </div>
            </section>

            <section className="about-values">
                <h2 className="section-title">{t('ourValues')}</h2>
                <div className="values-grid">
                    {values.map((v, i) => (
                        <div key={i} className="value-card glass">
                            <div className="value-icon">{v.icon}</div>
                            <h3>{v.title}</h3>
                            <p>{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="about-mission">
                <div className="mission-content glass">
                    <h2>{t('ourMission')}</h2>
                    <p>{t('missionDesc')}</p>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
