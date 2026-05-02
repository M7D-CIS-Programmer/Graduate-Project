import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import Button from '../components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { t, dir } = useLanguage();
    const location = useLocation();

    const isChatbotPage = location.pathname === '/chatbot';
    const isHomePage = location.pathname === '/' || location.pathname === '/employer-home';

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`layout-wrapper ${dir}`} dir={dir}>
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

            <div className="layout-container">
                <Sidebar isOpen={isSidebarOpen} />

                <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    {!isHomePage && (
                        <div className="global-back-wrapper">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate(-1)}
                                className="global-back-btn"
                            >
                                <ChevronLeft size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
                                {t('back')}
                            </Button>
                        </div>
                    )}
                    <div className="content-area">
                        {children}
                    </div>
                    <Footer />
                </main>
            </div>
            {!isChatbotPage && <Chatbot isSidebarOpen={isSidebarOpen} />}
        </div>
    );
};

export default MainLayout;
