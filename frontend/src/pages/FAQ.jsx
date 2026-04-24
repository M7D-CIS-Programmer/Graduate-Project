import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown, HelpCircle } from 'lucide-react';
import './FAQ.css';

const FAQ = () => {
    const { t, dir } = useLanguage();
    const [activeIndex, setActiveIndex] = useState(null);

    const faqData = [
        { q: t('faq1Q'), a: t('faq1A') },
        { q: t('faq2Q'), a: t('faq2A') },
        { q: t('faq3Q'), a: t('faq3A') },
        { q: t('faq4Q'), a: t('faq4A') },
        { q: t('faq5Q'), a: t('faq5A') },
        { q: t('faq6Q'), a: t('faq6A') }
    ];

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className={`faq-container ${dir}`}>
            <div className="faq-header">
                <HelpCircle className="faq-icon" size={48} />
                <h1>{t('faqTitle')}</h1>
                <p>{t('aboutHeroDesc')}</p>
            </div>

            <div className="faq-list">
                {faqData.map((item, index) => (
                    <div 
                        key={index} 
                        className={`faq-item glass ${activeIndex === index ? 'active' : ''}`}
                    >
                        <button 
                            className="faq-question" 
                            onClick={() => toggleAccordion(index)}
                            aria-expanded={activeIndex === index}
                        >
                            <span>{item.q}</span>
                            <ChevronDown className="chevron" size={20} />
                        </button>
                        <div className="faq-answer">
                            <div className="answer-content">
                                {item.a}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="faq-footer glass">
                <h3>{t('stillHaveQuestions')}</h3>
                <p>{t('contactSupportDesc')}</p>
                <button className="btn-primary" onClick={() => window.location.href='/contact'}>
                    {t('contactUs')}
                </button>
            </div>
        </div>
    );
};

export default FAQ;
