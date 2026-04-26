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
    Mail,
    ScanText,
    MessageSquare
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

    // Base items for everyone
    const baseItems = [
        isEmployerHome
            ? { name: t('findCandidates'), icon: <Users size={20} />, path: '/candidates' }
            : { name: t('findJobs'), icon: <Briefcase size={20} />, path: '/jobs' },
        { name: t('companies'), icon: <Building2 size={20} />, path: '/companies' },
    ];

    // Role-specific items
    const getRoleItems = () => {
        if (!user || !user.role) return [];

        const role = user.role.toLowerCase();

        if (role === 'job seeker') {
            return [
                { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard/seeker' },
                { name: t('myApplications'), icon: <Briefcase size={20} />, path: '/dashboard/seeker/applications' },
                { name: t('savedJobs'), icon: <Bookmark size={20} />, path: '/saved-jobs' },
                { name: t('resumeBuilder'), icon: <FileEdit size={20} />, path: '/resume-builder' },
                { name: t('cvAnalyzer'),  icon: <ScanText size={20} />,       path: '/cv-analyzer' },
                { name: t('interview'),   icon: <MessageSquare size={20} />, path: '/interview'   },
            ];
        }

        if (role === 'employer' || role === 'company') {
            return [
                { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard/employer' },
                { name: t('myJobs'), icon: <Briefcase size={20} />, path: '/dashboard/employer/jobs' },
                { name: t('postAJob'), icon: <PlusCircle size={20} />, path: '/jobs/post' },
                { name: t('candidates'), icon: <Users size={20} />, path: '/dashboard/employer/applicants' },
            ];
        }

        if (role === 'admin') {
            return [
                { name: t('adminDashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard/admin' },
                { name: t('manageUsers'), icon: <Users size={20} />, path: '/dashboard/admin/users' },
                { name: t('manageJobs'), icon: <Briefcase size={20} />, path: '/dashboard/admin/jobs' },
                { name: t('manageCompanies'), icon: <Building2 size={20} />, path: '/dashboard/admin/companies' },
                { name: t('platformSettings'), icon: <Settings size={20} />, path: '/dashboard/admin/settings' },
            ];
        }

        return [];
    };

    const userRole = user?.role?.toLowerCase() || '';

    const navItems = [
        ...getRoleItems(),
        ...(['employer', 'company', 'admin'].includes(userRole) ? [] : baseItems),
        ...(user ? [
            { name: t('notifications'), icon: <Bell size={20} />, path: '/notifications' },
            { name: t('profile'), icon: <UserIcon size={20} />, path: '/profile' }
        ] : [
            { name: t('aboutUs'), icon: <FileText size={20} />, path: '/about' },
            { name: t('contactUs'), icon: <Mail size={20} />, path: '/contact' }
        ]),
        { name: t('settings'), icon: <Settings size={20} />, path: '/settings' }
    ];

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
