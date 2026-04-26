import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Paperclip, File as FileIcon, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/api';
import './Chatbot.css';

const Chatbot = ({ isSidebarOpen }) => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [chatHistory, setChatHistory] = useState([
        { id: 1, type: 'bot', text: t('chatbotWelcome') }
    ]);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);
    const lastSentRef = useRef(0);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() && !selectedFile) return;

        // Rate-limit: 2 s between sends
        const now = Date.now();
        if (now - lastSentRef.current < 2000) return;
        lastSentRef.current = now;

        const sentText = message.trim();
        const userMsg = {
            id: now,
            type: 'user',
            text: sentText,
            file: selectedFile
        };

        setChatHistory(prev => [...prev, userMsg]);
        setMessage('');
        setSelectedFile(null);
        setIsTyping(true);

        // Skip API call if only a file was attached with no message text
        if (!sentText) {
            setIsTyping(false);
            return;
        }

        try {
            const data = await api.sendSupportMessage(sentText);
            setChatHistory(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                text: data.reply
            }]);
        } catch (err) {
            const msg = err.message || '';
            // Detect a connection / 404 error (backend not running)
            const isOffline = msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('404') || msg.includes('Not Found');
            setChatHistory(prev => [...prev, {
                id: Date.now() + 2,
                type: 'bot',
                text: isOffline
                    ? '⚠️ Cannot reach the server. Please make sure the backend is running, then try again.'
                    : (msg || "Sorry, I'm having trouble. Please try again.")
            }]);
        } finally {
            setIsTyping(false);
        }
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
                        <div className="chatbot-header-actions">
                            <button className="expand-btn" onClick={() => navigate('/chatbot')} title={t('fullPageChat')}>
                                <Maximize2 size={18} />
                            </button>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
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
                        {isTyping && (
                            <div className="message-wrapper bot">
                                <div className="message-icon"><Bot size={14} /></div>
                                <div className="typing-indicator">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}
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
                        <button type="submit" disabled={(!message.trim() && !selectedFile) || isTyping}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
