import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import logo from '../assets/logo.png';
import './Footer.css';

const Footer = () => {
    const { t, dir } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`footer glass ${dir}`}>
            <div className="footer-content">
                <div className="footer-section brand-section">
                    <Link to="/" className="footer-logo">
                        <img src={logo} alt="SmartJob" />
                    </Link>
                    <p className="footer-tagline">{t('footerTagline')}</p>
                    <div className="social-links">
                        <a href="#"><Facebook size={20} /></a>
                        <a href="#"><Twitter size={20} /></a>
                        <a href="#"><Instagram size={20} /></a>
                        <a href="#"><Linkedin size={20} /></a>
                    </div>
                </div>

                <div className="footer-links-grid">
                    <div className="footer-section">
                        <h4>{t('platform')}</h4>
                        <ul>
                            <li><Link to="/jobs">{t('findJobs')}</Link></li>
                            <li><Link to="/companies">{t('companies')}</Link></li>

                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>{t('support')}</h4>
                        <ul>
                            <li><Link to="/contact">{t('contactUs')}</Link></li>
                            <li><Link to="/about">{t('aboutUs')}</Link></li>
                            <li><Link to="/faq">{t('faq')}</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>{t('legal')}</h4>
                        <ul>
                            <li><Link to="/privacy-policy">{t('privacyPolicy')}</Link></li>
                            <li><Link to="/terms-of-service">{t('termsOfService')}</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} SmartJob. {t('copyright')}</p>
                <div className="footer-bottom-links">
                    <a href="mailto:info@smartjob.com" className="contact-email">
                        <Mail size={16} />
                        info@smartjob.com
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
