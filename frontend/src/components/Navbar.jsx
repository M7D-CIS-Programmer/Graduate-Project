import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Bell,
    Menu,
    Languages,
    Search,
    Sun,
    Moon
} from 'lucide-react';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const { t, language, toggleLanguage, dir } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useNotifications();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = React.useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();

        // Determine search destination based on user role or current page
        const role = user?.role?.toLowerCase();
        const isEmployer = role === 'employer' || role === 'company' || location.pathname === '/employer-home';
        const basePath = isEmployer ? '/candidates' : '/jobs';

        if (searchQuery.trim()) {
            navigate(`${basePath}?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate(basePath);
        }
    };

    return (
        <nav className="navbar glass">
            <div className="navbar-left">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <Link to="/" className="logo-container" data-tooltip={t('home')}>
                    <div className="logo-icon">
                        <img src={logo} alt="SmartJob" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                </Link>
            </div>

            <div className="search-container">
                <form className="search-wrapper" onSubmit={handleSearch}>
                    <button type="submit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                        <Search size={18} className="search-icon" />
                    </button>
                    <input
                        type="text"
                        className="search-input"
                        placeholder={t('search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {!user && (
                    location.pathname === '/employer-home' ? (
                        <Link to="/" style={{ color: 'var(--text-color)', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {t('forJobSeekers')}
                        </Link>
                    ) : (
                        <Link to="/employer-home" style={{ color: 'var(--text-color)', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {t('forEmployers')}
                        </Link>
                    )
                )}

                <button className="nav-icon-btn" onClick={toggleTheme} style={{ padding: '8px', display: 'flex' }} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button className="lang-toggle" onClick={toggleLanguage}>
                    <Languages size={20} />
                    <span>{language === 'en' ? 'AR' : 'EN'}</span>
                </button>

                {user && (
                    <>
                        <Link to="/notifications" className="nav-icon-btn notification-btn" title={t('notifications')}>
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </Link>
                    </>
                )}

                {user ? (
                    <div className="nav-user-actions" style={{ marginLeft: '0.5rem' }}>
                        <Link to="/profile" className="user-profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="user-avatar" style={{ overflow: 'hidden' }}>
                                {user.photo ? (
                                    <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user.name.charAt(0)
                                )}
                            </div>
                            <div className="user-info">
                                <span className="user-name">{user.name}</span>
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className="nav-auth-btns">
                        <Link to="/login" className="btn-login">{t('signIn')}</Link>
                        <Link to="/register" className="btn-primary">{t('register')}</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
