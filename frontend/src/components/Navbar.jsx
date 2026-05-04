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
    Moon,
    User,
    Building,
    FileText,
    Settings,
    Loader2,
    MessageSquare,
    Mail
} from 'lucide-react';
import { api } from '../api/api';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const { t, language, toggleLanguage, dir } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount, notifications, markAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = React.useState(false);
    const notificationRef = React.useRef(null);
    const location = useLocation();
    const [searchQuery, setSearchQuery] = React.useState('');
    const navigate = useNavigate();

    const [results, setResults] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showResults, setShowResults] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const searchRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        if (!searchQuery.trim()) {
            setResults(null);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            setShowResults(true);
            setActiveIndex(-1);
            try {
                const data = await api.search(searchQuery, user?.role, user?.id, language);
                setResults(data);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, user, language]);

    const allResults = React.useMemo(() => {
        if (!results) return [];
        return [
            ...(results.pages || []),
            ...(results.jobs || []),
            ...(results.candidates || []),
            ...(results.companies || []),
            ...(results.contactMessages || [])
        ];
    }, [results]);

    const handleKeyDown = (e) => {
        if (!showResults || !allResults.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % allResults.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + allResults.length) % allResults.length);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            navigate(allResults[activeIndex].link);
            setShowResults(false);
            setSearchQuery('');
        } else if (e.key === 'Escape') {
            setShowResults(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setShowResults(false);
        const role = user?.role?.toLowerCase();
        const isEmployer = role === 'employer' || role === 'company' || location.pathname === '/employer-home';
        const basePath = isEmployer ? '/candidates' : '/jobs';

        if (searchQuery.trim()) {
            navigate(`${basePath}?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate(basePath);
        }
    };

    const highlightText = (text, query) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === query.toLowerCase() ? <mark key={i}>{part}</mark> : part
        );
    };

    const renderResultSection = (title, items, icon, sectionOffset = 0) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="search-section">
                <div className="section-header">
                    {icon}
                    <span>{title}</span>
                </div>
                {items.map((item, idx) => {
                    const globalIdx = sectionOffset + idx;
                    return (
                        <Link 
                            key={idx} 
                            to={item.link} 
                            className={`search-item ${activeIndex === globalIdx ? 'active' : ''}`}
                            onClick={() => {
                                setShowResults(false);
                                setSearchQuery('');
                            }}
                        >
                            <div className="item-info">
                                <div className="item-title">{highlightText(item.title, searchQuery)}</div>
                                <div className="item-desc">{item.description}</div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        );
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

            <div className="search-container" ref={searchRef}>
                <form className="search-wrapper" onSubmit={handleSearch}>
                    <button type="submit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                        <Search size={18} className="search-icon" />
                    </button>
                    <input
                        type="text"
                        className="search-input"
                        placeholder={t('searchPlaceholder') || t('search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.trim() && setShowResults(true)}
                        onKeyDown={handleKeyDown}
                    />
                    {isLoading && <Loader2 size={16} className="search-loader animate-spin" />}
                </form>

                {showResults && results && (
                    <div className="search-dropdown glass shadow-xl">
                        {renderResultSection(t('pages'), results.pages, <FileText size={14} />, 0)}
                        
                        {renderResultSection(t('jobs'), results.jobs, <Briefcase size={14} />, 
                            (results.pages?.length || 0))}
                        
                        {renderResultSection(user?.role?.toLowerCase() === 'admin' ? t('users') : t('candidates'), results.candidates, <User size={14} />, 
                            (results.pages?.length || 0) + (results.jobs?.length || 0))}
                        
                        {renderResultSection(t('companies'), results.companies, <Building size={14} />, 
                            (results.pages?.length || 0) + (results.jobs?.length || 0) + (results.candidates?.length || 0))}

                        {renderResultSection(t('contactMessages'), results.contactMessages, <Mail size={14} />, 
                            (results.pages?.length || 0) + (results.jobs?.length || 0) + (results.candidates?.length || 0) + (results.companies?.length || 0))}
                        
                        {!allResults.length && (
                            <div className="no-results">
                                <Search size={24} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                <p>{t('noResults')}</p>
                            </div>
                        )}
                    </div>
                )}
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
                        <Link to="/messages" className="msg-nav-link" title={t('msgMessages')}>
                            <MessageSquare size={20} />
                            <span>{t('msgMessages')}</span>
                        </Link>
                        <div className="nav-dropdown-container" ref={notificationRef}>
                            <button 
                                className={`nav-icon-btn notification-btn ${showNotifications ? 'active' : ''}`} 
                                onClick={() => setShowNotifications(!showNotifications)}
                                title={t('notifications')}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="nav-dropdown notification-dropdown glass shadow-xl">
                                    <div className="dropdown-header">
                                        <h3>{t('notifications')}</h3>
                                        {unreadCount > 0 && (
                                            <span className="unread-dot-label">{unreadCount} new</span>
                                        )}
                                    </div>
                                    <div className="dropdown-list">
                                        {notifications.length > 0 ? (
                                            notifications.slice(0, 5).map((notif) => (
                                                <div 
                                                    key={notif.id} 
                                                    className={`dropdown-item ${!notif.isRead ? 'unread' : ''}`}
                                                    onClick={() => {
                                                        if (!notif.isRead) markAsRead(notif.id);
                                                        if (notif.link) navigate(notif.link);
                                                        setShowNotifications(false);
                                                    }}
                                                >
                                                    <div className="item-content">
                                                        <p className="item-message">{notif.message}</p>
                                                        <div className="item-footer-row">
                                                            <span className="item-time">
                                                                {new Date(notif.createdAt).toLocaleDateString()}
                                                            </span>
                                                            {notif.type?.toLowerCase() === 'message' && (
                                                                <button 
                                                                    className="btn-chat-nav"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (!notif.isRead) markAsRead(notif.id);
                                                                        navigate(`/chat/${notif.relatedId}`);
                                                                        setShowNotifications(false);
                                                                    }}
                                                                >
                                                                    {t('goToChat')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {!notif.isRead && <span className="unread-dot"></span>}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="empty-dropdown">
                                                {t('noNotifications')}
                                            </div>
                                        )}
                                    </div>
                                    <Link 
                                        to="/notifications" 
                                        className="dropdown-footer"
                                        onClick={() => setShowNotifications(false)}
                                    >
                                        {t('viewAll')}
                                    </Link>
                                </div>
                            )}
                        </div>
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
