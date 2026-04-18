import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Paperclip, File as FileIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Chatbot.css';

const Chatbot = ({ isSidebarOpen }) => {
    const { t, dir } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [chatHistory, setChatHistory] = useState([
        { id: 1, type: 'bot', text: t('chatbotWelcome') }
    ]);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() && !selectedFile) return;

        const userMsg = {
            id: Date.now(),
            type: 'user',
            text: message,
            file: selectedFile
        };

        setChatHistory(prev => [...prev, userMsg]);
        setMessage('');
        setSelectedFile(null);

        // Mock bot response
        setTimeout(() => {
            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: "I'm a demo assistant! I can help you find jobs, build your resume, or answer platform questions."
            };
            setChatHistory(prev => [...prev, botMsg]);
        }, 1000);
    };

    return (
        <div className={`chatbot-wrapper ${dir} ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {!isOpen && (
                <button
                    className="chatbot-toggle shadow-lg"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open Chat"
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window glass shadow-2xl">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3>{t('chatbotName')}</h3>
                                <div className="status-online">
                                    <span className="status-dot"></span>
                                    Online
                                </div>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chatbot-messages" ref={scrollRef}>
                        {chatHistory.map((msg) => (
                            <div key={msg.id} className={`message-wrapper ${msg.type}`}>
                                <div className="message-icon">
                                    {msg.type === 'bot' ? <Bot size={14} /> : <User size={14} />}
                                </div>
                                <div className="message-text">
                                    {msg.file && (
                                        <div className="message-attachment">
                                            <FileIcon size={16} />
                                            <span>{msg.file.name}</span>
                                        </div>
                                    )}
                                    {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedFile && (
                        <div className="file-preview-banner">
                            <FileIcon size={14} />
                            <span className="file-name">{selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)</span>
                            <button className="remove-file-btn" onClick={() => setSelectedFile(null)}>
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <form className="chatbot-input" onSubmit={handleSubmit}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                        <button
                            type="button"
                            className="attachment-btn"
                            title={t('uploadFile')}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip size={18} />
                        </button>
                        <input
                            type="text"
                            placeholder={t('chatbotPlaceholder')}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit" disabled={!message.trim() && !selectedFile}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
