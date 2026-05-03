import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const SuspendedPage = () => {
    const { logout } = useAuth();
    const { language } = useLanguage();
    const ar = language === 'ar';

    // Pass a pre-filled subject so the contact form opens ready for the user
    const contactUrl = '/contact?subject=' + encodeURIComponent(
        ar ? 'طلب رفع تعليق الحساب' : 'Account Suspension Appeal'
    );

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main)',
            padding: '2rem',
            direction: ar ? 'rtl' : 'ltr',
        }}>
            <div style={{
                maxWidth: 520,
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 24,
                padding: '3rem 2.5rem',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(239,68,68,0.08)',
            }}>
                {/* Icon */}
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                }}>
                    <ShieldOff size={36} color="#ef4444" />
                </div>

                {/* Title */}
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.75rem' }}>
                    {ar ? 'تم تعليق حسابك' : 'Account Suspended'}
                </h1>

                {/* Message */}
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                    {ar
                        ? 'لقد قام المسؤول بتعليق حسابك مؤقتاً. لن تتمكن من الوصول إلى الموقع حتى يتم رفع التعليق.'
                        : 'Your account has been temporarily suspended by the administrator. You cannot access the platform until the suspension is lifted.'}
                </p>

                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
                    {ar
                        ? 'إذا كنت تعتقد أن هذا القرار خاطئ، يرجى التواصل مع فريق الدعم من خلال النموذج أدناه.'
                        : 'If you believe this is a mistake, please contact our support team using the form below.'}
                </p>

                {/* Contact support — internal route */}
                <Link
                    to={contactUrl}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.25)',
                        padding: '0.6rem 1.5rem', borderRadius: 12,
                        fontSize: '0.9rem', fontWeight: 600,
                        textDecoration: 'none', marginBottom: '1rem',
                    }}
                >
                    <MessageSquare size={16} />
                    {ar ? 'تواصل مع الدعم' : 'Contact Support'}
                </Link>

                {/* Sign out */}
                <div>
                    <button
                        onClick={logout}
                        style={{
                            background: 'transparent', border: 'none',
                            color: 'var(--text-muted)', cursor: 'pointer',
                            fontSize: '0.875rem', textDecoration: 'underline', padding: 0,
                        }}
                    >
                        {ar ? 'تسجيل الخروج' : 'Sign out'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuspendedPage;
