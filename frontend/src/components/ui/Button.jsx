import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', size = 'md', className = '', loading = false, disabled, ...props }) => {
    return (
        <button
            className={`btn btn-${variant} btn-${size} ${className} ${loading ? 'loading' : ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <span className="spinner-inline"></span>
                    {children}
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
