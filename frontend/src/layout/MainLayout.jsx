import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { useLanguage } from '../context/LanguageContext';
import './MainLayout.css';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { dir } = useLanguage();
    const location = useLocation();

    const isChatbotPage = location.pathname === '/chatbot';

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`layout-wrapper ${dir}`} dir={dir}>
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

            <div className="layout-container">
                <Sidebar isOpen={isSidebarOpen} />

                <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
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
