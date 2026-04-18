import React from 'react';

const Spinner = () => (
    <div style={{ padding: '5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
            width: '40px', height: '40px',
            border: '4px solid var(--border-color, #e2e8f0)',
            borderTopColor: 'var(--primary-color, #6366f1)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

export default Spinner;
