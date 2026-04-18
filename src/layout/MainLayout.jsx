import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { useLanguage } from '../context/LanguageContext';
import './MainLayout.css';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { dir } = useLanguage();

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
            <Chatbot isSidebarOpen={isSidebarOpen} />
        </div>
    );
};

export default MainLayout;
