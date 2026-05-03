import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, X, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { formatFriendlyDate } from '../utils/dateUtils';
import { api } from '../api/api';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import './Chatbot.css';

// ── Normalise the role string to what the backend expects ─────────────────────
const normalizeRole = (raw) => {
    if (!raw) return '';
    const r = raw.toLowerCase().trim();
    if (r === 'employer' || r === 'company') return 'company';
    if (r.includes('seeker') || r === 'job seeker') return 'jobseeker';
    return '';
};

// ── Role badge component ──────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
    if (!role) return null;
    const isCompany = role === 'company';
    return (
        <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 999,
            background: isCompany ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
            color: isCompany ? '#10b981' : '#6366f1',
            border: `1px solid ${isCompany ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`,
            marginLeft: '0.5rem',
        }}>
            {isCompany ? '🏢 Company' : '👤 Job Seeker'}
        </span>
    );
};

// ── Suggestions per role ──────────────────────────────────────────────────────
const getSuggestions = (role, t) => {
    if (role === 'company') return [
        'How do I post a job?',
        'How to view my applicants?',
        'How does the AI hiring report work?',
    ];
    if (role === 'jobseeker') return [
        t('howToApply') || 'How to apply for a job?',
        'How does the CV analyzer work?',
        'How to practice for interviews?',
    ];
    return [
        t('howToApply') || 'How to apply?',
        t('buildResume') || 'Build Resume',
        'What is InsightCV?',
    ];
};

// ── Main Component ────────────────────────────────────────────────────────────

const Chatbot = () => {
    const { t, dir, language } = useLanguage();
    const { theme } = useTheme();
    const { user } = useAuth();

    const role = normalizeRole(user?.role);
    const lastSentRef = useRef(0);

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chat_history');
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                text: t('chatbotWelcome') || 'Hello! I\'m the InsightCV assistant. How can I help you today?',
                sender: 'bot',
                timestamp: new Date().toISOString()
            }
        ];
    });

    const [input, setInput]             = useState('');
    const [isTyping, setIsTyping]       = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef       = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        localStorage.setItem('chat_history', JSON.stringify(messages));
    }, [messages]);

    const handleSend = async (e, overrideText) => {
        if (e) e.preventDefault();
        const text = (overrideText ?? input).trim();
        if (!text) return;

        const now = Date.now();
        if (now - lastSentRef.current < 2000) return;
        lastSentRef.current = now;

        const userMsg = { id: now, text, sender: 'user', timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const data = await api.sendSupportMessage(text, user?.id ?? null, role || null, language);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: data.reply,
                sender: 'bot',
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            const msg = error.message || '';
            const isOffline = msg.includes('Failed to fetch') || msg.includes('NetworkError');
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                text: isOffline
                    ? '⚠️ Cannot reach the server. Please check the backend is running.'
                    : (msg || "Sorry, I'm having trouble connecting. Please try again."),
                sender: 'bot',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleConfirmClear = () => {
        setMessages([{
            id: Date.now(),
            text: t('chatbotWelcome') || 'Hello! I\'m the InsightCV assistant. How can I help you today?',
            sender: 'bot',
            timestamp: new Date().toISOString()
        }]);
        setShowClearConfirm(false);
    };

    const suggestions = getSuggestions(role, t);
    const showSuggestions = messages.length < 3;

    return (
        <div className={`chatbot-page ${dir} ${theme}-theme`}>
            {/* Header */}
            <header className="chat-header glass">
                <div className="header-info">
                    <div className="bot-avatar">
                        <Bot size={24} />
                        <span className="online-indicator"></span>
                    </div>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center' }}>
                            InsightCV Bot
                            <RoleBadge role={role} />
                        </h2>
                        <span className="status-text">
                            {isTyping ? t('typing') || 'Typing…' : t('online') || 'Online'}
                        </span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="header-btn" title={t('clearChat')} onClick={() => setShowClearConfirm(true)}>
                        <Trash2 size={20} />
                    </button>
                    <button className="header-btn" title={t('close')} onClick={() => window.history.back()}>
                        <X size={20} />
                    </button>
                </div>
            </header>

            {/* Messages */}
            <main className="messages-area">
                <div className="messages-container">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                            <div className="message-avatar">
                                {msg.sender === 'bot' ? <Bot size={18} /> : <User size={18} />}
                            </div>
                            <div className="message-bubble-container">
                                <div className="message-bubble">
                                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                                </div>
                                <span className="message-time">
                                    {formatFriendlyDate(msg.timestamp, language)}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="message-wrapper bot">
                            <div className="message-avatar"><Bot size={18} /></div>
                            <div className="message-bubble-container">
                                <div className="typing-indicator">
                                    <span /><span /><span />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {showSuggestions && (
                    <div className="suggestions-container">
                        {suggestions.map((q, i) => (
                            <button
                                key={i}
                                className="suggestion-btn glass"
                                onClick={() => handleSend(null, q)}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}
            </main>

            {/* Input */}
            <footer className="chat-footer glass">
                <form className="chat-input-wrapper" onSubmit={handleSend}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={t('chatPlaceholder') || 'Type your question…'}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
                        <Send size={20} />
                    </button>
                </form>
            </footer>

            {/* Clear Chat Modal */}
            <Modal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                title={t('clearChatHistory') || 'Clear Chat History'}
                type="danger"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                            {t('cancel') || 'Cancel'}
                        </Button>
                        <Button variant="danger" onClick={handleConfirmClear}>
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
                        {t('confirmClearChatDesc') || 'This will permanently delete all messages.'}
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default Chatbot;
