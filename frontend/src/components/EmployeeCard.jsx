import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './EmployeeCard.css';

const EmployeeCard = ({ id, name, email, location, role }) => {
    const { t } = useLanguage();
    const profileUrl = `/candidate/${id}`;

    return (
        <div className="employee-card">
            <div className="employee-card__avatar">
                <User size={32} />
            </div>

            <div className="employee-card__body">
                <h3 className="employee-card__name">{name || t('anonymousApplicant')}</h3>
                {role && <span className="employee-card__role">{role}</span>}

                <div className="employee-card__meta">
                    {email && (
                        <div className="employee-card__meta-item">
                            <Mail size={14} className="employee-card__meta-icon" />
                            <span className="employee-card__meta-text">{email}</span>
                        </div>
                    )}
                    {location && (
                        <div className="employee-card__meta-item">
                            <MapPin size={14} className="employee-card__meta-icon" />
                            <span className="employee-card__meta-text">{location}</span>
                        </div>
                    )}
                </div>
            </div>

            <Link to={profileUrl} className="employee-card__btn">
                {t('viewProfile')}
            </Link>
        </div>
    );
};

export default EmployeeCard;
