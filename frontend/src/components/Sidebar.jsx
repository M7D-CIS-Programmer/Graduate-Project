import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    Building2,
    Users,
    Settings,
    LogOut,
    PlusCircle,
    FileText,
    Bookmark,
    Bell,
    User as UserIcon,
    FileEdit,
    MessageSquare,
    Heart,
    Zap,
    FolderOpen,
    ShieldAlert,
    Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    const isEmployerHome = location.pathname === '/employer-home';

    const getNavItems = () => {
        const role = user?.role?.toLowerCase() || '';
        const items = [];

        if (role === 'job seeker') {
            items.push({ name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard/seeker' });
            items.push({ name: t('findJobs'), icon: <Briefcase size={20} />, path: '/jobs' });
            items.push({ name: t('companies'), icon: <Building2 size={20} />, path: '/companies' });
            items.push({ name: t('jobMatching'), icon: <Zap size={20} />, path: '/job-matching' });
            items.push({ name: t('resumeBuilder'), icon: <FileEdit size={20} />, path: '/resume-builder' });
            items.push({ name: t('interview'), icon: <MessageSquare size={20} />, path: '/interview' });
            items.push({ name: t('profile'), icon: <UserIcon size={20} />, path: '/profile' });
            items.push({ name: t('contactUs'), icon: <Mail size={20} />, path: '/contact' });
            items.push({ name: t('settings'), icon: <Settings size={20} />, path: '/settings' });
        } 
        else if (role === 'employer' || role === 'company') {
            items.push({ name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard/employer' });
            items.push({ name: t('findCandidates'), icon: <Users size={20} />, path: '/candidates' });
            items.push({ name: t('departmentsAndJobs'), icon: <Briefcase size={20} />, path: '/dashboard/employer/jobs' });
            items.push({ name: t('postAJob'), icon: <PlusCircle size={20} />, path: '/jobs/post' });
            items.push({ name: t('candidates'), icon: <Users size={20} />, path: '/dashboard/employer/applicants' });
            items.push({ name: t('jobMatching'), icon: <Zap size={20} />, path: '/job-matching' });
            items.push({ name: t('fraudDetection'), icon: <ShieldAlert size={20} />, path: '/cv-fraud-check' });
            items.push({ name: t('profile'), icon: <UserIcon size={20} />, path: '/profile' });
            items.push({ name: t('contactUs'), icon: <Mail size={20} />, path: '/contact' });
            items.push({ name: t('settings'), icon: <Settings size={20} />, path: '/settings' });
        } 
        else if (role === 'admin') {
            items.push({ name: t('adminDashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard/admin' });
            items.push({ name: t('platformSettings'), icon: <Settings size={20} />, path: '/dashboard/admin/settings' });
            items.push({ name: t('manageUsers'), icon: <Users size={20} />, path: '/dashboard/admin/users' });
            items.push({ name: t('manageCompanies'), icon: <Building2 size={20} />, path: '/dashboard/admin/companies' });
            items.push({ name: t('manageJobs'), icon: <Briefcase size={20} />, path: '/dashboard/admin/jobs' });
            items.push({ name: t('contactMessages') || 'Contact Messages', icon: <Mail size={20} />, path: '/dashboard/admin/contact-messages' });
            items.push({ name: t('settings'), icon: <Settings size={20} />, path: '/settings' });
        } 
        else {
            items.push({ name: t('findJobs'), icon: <Briefcase size={20} />, path: '/jobs' });
            items.push({ name: t('companies'), icon: <Building2 size={20} />, path: '/companies' });
            items.push({ name: t('aboutUs'), icon: <FileText size={20} />, path: '/about' });
            items.push({ name: t('contactUs'), icon: <Mail size={20} />, path: '/contact' });
        }

        return items;
    };

    const userRole = user?.role?.toLowerCase() || '';
    const navItems = getNavItems();

    return (
        <aside className={`sidebar glass ${isOpen ? 'open' : ''}`}>
            <div>
                <div className="sidebar-header">
                    <p className="sidebar-label">
                        {user
                            ? (['employer', 'company'].includes(userRole) ? t('company')
                                : userRole === 'admin' ? 'Admin'
                                    : t('jobSeeker'))
                            : t('menu')}
                    </p>
                </div>

                <nav className="sidebar-menu">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <div className="sidebar-link-content">
                                {item.icon}
                                <span>{item.name}</span>
                            </div>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="sidebar-footer">
                {user && (
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="logout-btn"
                    >
                        <LogOut size={20} />
                        <span style={{ fontWeight: '500' }}>{t('logout')}</span>
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
