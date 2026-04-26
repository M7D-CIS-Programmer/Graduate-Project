import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Mic,
    User,
    Bot,
    X,
    MoreVertical,
    Paperclip,
    Smile,
    RotateCcw,
    Trash2,
    Search
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { formatFriendlyDate } from '../utils/dateUtils';
import { api } from '../api/api';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import './Chatbot.css';

const Chatbot = () => {
    const { t, dir, language } = useLanguage();
    const { theme } = useTheme();
    const { user } = useAuth();
    const lastSentRef = useRef(0); // simple rate-limit: 2 s between sends
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chat_history');
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                text: t('chatbotWelcome') || 'Hello! I am your InsightCV assistant. How can I help you today?',
                sender: 'bot',
                timestamp: new Date().toISOString()
            }
        ];
    });
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        localStorage.setItem('chat_history', JSON.stringify(messages));
    }, [messages]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        // Simple rate-limit: at least 2 s between sends
        const now = Date.now();
        if (now - lastSentRef.current < 2000) return;
        lastSentRef.current = now;

        const userMessage = {
            id: now,
            text: input.trim(),
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        const sentText = input.trim();
        setInput('');
        setIsTyping(true);

        try {
            const data = await api.sendSupportMessage(sentText, user?.id ?? null);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: data.reply,
                sender: 'bot',
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error('Support chat error:', error);
            const msg = error.message || '';
            const isOffline = msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('404') || msg.includes('Not Found');
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                text: isOffline
                    ? '⚠️ Cannot reach the server. Please make sure the backend is running, then try again.'
                    : (msg || "Sorry, I'm having trouble connecting right now. Please try again."),
                sender: 'bot',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const clearChat = () => {
        setShowClearConfirm(true);
    };

    const handleConfirmClear = () => {
        setMessages([{
            id: 1,
            text: t('chatbotWelcome') || 'Hello! I am your InsightCV assistant. How can I help you today?',
            sender: 'bot',
            timestamp: new Date().toISOString()
        }]);
        setShowClearConfirm(false);
    };

    const suggestedQuestions = [
        t('howToApply') || "How to apply?",
        t('buildResume') || "Build Resume",
        t('findCompanies') || "Find Companies"
    ];

    return (
        <div className={`chatbot-page ${dir} ${theme}-theme`}>
            {/* Chat Header */}
            <header className="chat-header glass">
                <div className="header-info">
                    <div className="bot-avatar">
                        <Bot size={24} />
                        <span className="online-indicator"></span>
                    </div>
                    <div>
                        <h2>InsightCV Bot</h2>
                        <span className="status-text">{isTyping ? t('typing') || 'Typing...' : t('online') || 'Online'}</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="header-btn" title={t('clearChat')} onClick={clearChat}>
                        <Trash2 size={20} />
                    </button>
                    <button className="header-btn" title={t('close')} onClick={() => window.history.back()}>
                        <X size={20} />
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <main className="messages-area">
                <div className="messages-container">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                            <div className="message-avatar">
                                {msg.sender === 'bot' ? <Bot size={18} /> : <User size={18} />}
                            </div>
                            <div className="message-bubble-container">
                                <div className="message-bubble">
                                    <p>{msg.text}</p>
                                </div>
                                <span className="message-time">
                                    {formatFriendlyDate(msg.timestamp, language)}
                                </span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message-wrapper bot">
                            <div className="message-avatar">
                                <Bot size={18} />
                            </div>
                            <div className="message-bubble-container">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {messages.length < 3 && (
                    <div className="suggestions-container">
                        {suggestedQuestions.map((q, i) => (
                            <button key={i} className="suggestion-btn glass" onClick={() => { setInput(q); handleSend(); }}>
                                {q}
                            </button>
                        ))}
                    </div>
                )}
            </main>

            {/* Input Area */}
            <footer className="chat-footer glass">
                <div className="input-actions">
                    <button className="footer-action-btn"><Smile size={20} /></button>
                    <button className="footer-action-btn"><Paperclip size={20} /></button>
                </div>
                <form className="chat-input-wrapper" onSubmit={handleSend}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={t('chatPlaceholder') || 'Type your message...'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
                        <Send size={20} />
                    </button>
                </form>
            </footer>

            {/* Clear Chat Confirmation Modal */}
            <Modal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                title={t('clearChatHistory') || 'Clear Chat History'}
                type="danger"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setShowClearConfirm(false)}
                        >
                            {t('cancel') || 'Cancel'}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleConfirmClear}
                        >
                            {t('clear') || 'Clear'}
                        </Button>
                    </>
                }
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <Trash2 size={48} color="#ef4444" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        {t('confirmClearChatTitle') || 'Are you sure?'}
                    </p>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {t('confirmClearChatDesc') || 'This will permanently delete all messages in this conversation. This action cannot be undone.'}
                    </p>
                </div>
            </Modal>

        </div>
    );
};

export default Chatbot;
