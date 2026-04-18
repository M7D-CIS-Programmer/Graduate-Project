import React from 'react';
import './Input.css';

const Input = ({ label, error, icon: Icon, className = '', ...props }) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <div className={`input-wrapper ${error ? 'has-error' : ''} ${Icon ? 'has-icon' : ''}`}>
                {Icon && <Icon className="input-icon" size={20} />}
                <input className="input-field" {...props} />
            </div>
            {error && <span className="input-error-msg">{error}</span>}
        </div>
    );
};

export default Input;
