import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Send, ArrowLeft, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { api, getImageUrl } from '../../api/api';
import {
    useConversations,
    useMessages,
    useSendMessage,
    useMarkMessagesRead,
} from '../../hooks/useMessages';
import { formatFriendlyDate } from '../../utils/dateUtils';
import './Messages.css';

const Avatar = ({ src, name, size = 40 }) => {
    const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
    return src ? (
        <img
            src={getImageUrl(src)}
            alt={name}
            className="msg-avatar"
            style={{ width: size, height: size }}
        />
    ) : (
        <div className="msg-avatar msg-avatar-fallback" style={{ width: size, height: size }}>
            {initials}
        </div>
    );
};

const ConversationItem = ({ conv, currentUserId, isActive, onClick }) => {
    const isEmployer   = conv.employerId === currentUserId;
    const otherName    = isEmployer ? conv.candidateName  : conv.employerName;
    const otherPicture = isEmployer ? conv.candidatePicture : conv.employerPicture;

    return (
        <button
            className={`conv-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <Avatar src={otherPicture} name={otherName} size={44} />
            <div className="conv-item-info">
                <div className="conv-item-header">
                    <span className="conv-item-name">{otherName}</span>
                    {conv.lastMessageAt && (
                        <span className="conv-item-time">
                            {formatFriendlyDate(conv.lastMessageAt)}
                        </span>
                    )}
                </div>
                <div className="conv-item-footer">
                    <span className="conv-item-preview">
                        {conv.lastMessage
                            ? (conv.lastMessage.length > 50
                                ? conv.lastMessage.slice(0, 50) + '…'
                                : conv.lastMessage)
                            : conv.jobTitle}
                    </span>
                    {conv.unreadCount > 0 && (
                        <span className="conv-unread-badge">{conv.unreadCount}</span>
                    )}
                </div>
                <span className="conv-item-job">{conv.jobTitle}</span>
            </div>
        </button>
    );
};

const MessageBubble = ({ msg, currentUserId }) => {
    const isMine = msg.senderId === currentUserId;
    return (
        <div className={`msg-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
            {!isMine && <Avatar src={msg.senderPicture} name={msg.senderName} size={32} />}
            <div className={`msg-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                <p className="msg-text">{msg.content}</p>
                <span className="msg-time">{formatFriendlyDate(msg.sentAt)}</span>
            </div>
        </div>
    );
};

const Thread = ({ conv, currentUserId }) => {
    const { t } = useLanguage();
    const [text, setText] = useState('');
    const bottomRef = useRef(null);
    const { showToast } = useToast();

    const { data: messages = [], isLoading } = useMessages(conv.applicationJobId, currentUserId);
    const sendMessage = useSendMessage();
    const markRead    = useMarkMessagesRead();

    const isEmployer   = conv.employerId === currentUserId;
    const otherName    = isEmployer ? conv.candidateName  : conv.employerName;
    const otherPicture = isEmployer ? conv.candidatePicture : conv.employerPicture;

    useEffect(() => {
        if (messages.length > 0) {
            markRead.mutate({ applicationId: conv.applicationJobId, userId: currentUserId });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conv.applicationJobId, messages.length]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        try {
            await sendMessage.mutateAsync({
                applicationId: conv.applicationJobId,
                senderId: currentUserId,
                content: trimmed,
            });
            setText('');
        } catch {
            showToast(t('msgFailedSend'), 'error');
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="thread-panel">
            <div className="thread-header">
                <Avatar src={otherPicture} name={otherName} size={40} />
                <div>
                    <p className="thread-header-name">{otherName}</p>
                    <p className="thread-header-job">{conv.jobTitle}</p>
                </div>
            </div>

            <div className="thread-messages">
                {isLoading ? (
                    <div className="thread-empty">{t('msgLoadingMessages')}</div>
                ) : messages.length === 0 ? (
                    <div className="thread-empty">
                        <MessageSquare size={40} style={{ opacity: 0.3 }} />
                        <p>{t('msgNoMessages')}</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <MessageBubble key={msg.id} msg={msg} currentUserId={currentUserId} />
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            <div className="thread-input-row">
                <textarea
                    className="thread-textarea"
                    placeholder={t('msgTypePlaceholder')}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKey}
                    rows={1}
                />
                <button
                    className="thread-send-btn"
                    onClick={handleSend}
                    disabled={!text.trim() || sendMessage.isPending}
                    title={t('msgSend')}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

const Messages = () => {
    const { user } = useAuth();
    const { dir, t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlAppId = searchParams.get('applicationId') ? Number(searchParams.get('applicationId')) : null;

    const [activeAppId, setActiveAppId]   = useState(urlAppId);
    // Holds a thread-info result for an app that isn't in the conversations list yet
    const [pendingConv, setPendingConv]   = useState(null);
    const [pendingLoading, setPendingLoading] = useState(false);
    const [mobileShowThread, setMobileShowThread] = useState(!!urlAppId);

    const { data: conversations = [], isLoading } = useConversations(user?.id);

    // The active conversation: either from the conversations list or from a direct thread-info fetch
    const activeConv =
        conversations.find(c => c.applicationJobId === activeAppId) ??
        (pendingConv?.applicationJobId === activeAppId ? pendingConv : null);

    // When activeAppId is set (from URL or click) but not in conversations yet,
    // fetch its thread-info so an empty thread can be opened immediately.
    useEffect(() => {
        if (!activeAppId || !user?.id) return;

        const alreadyInList = conversations.some(c => c.applicationJobId === activeAppId);
        if (alreadyInList) {
            setPendingConv(null);
            return;
        }

        // Don't re-fetch if we already have the right pending conv
        if (pendingConv?.applicationJobId === activeAppId) return;

        setPendingLoading(true);
        api.getThreadInfo(activeAppId, user.id)
            .then(info => setPendingConv(info))
            .catch(() => setPendingConv(null))
            .finally(() => setPendingLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeAppId, conversations.length, user?.id]);

    const openConv = (conv) => {
        setActiveAppId(conv.applicationJobId);
        setSearchParams({ applicationId: conv.applicationJobId });
        setMobileShowThread(true);
        // Clear pending so it re-evaluates from conversations list
        if (pendingConv?.applicationJobId !== conv.applicationJobId) setPendingConv(null);
    };

    const backToList = () => setMobileShowThread(false);

    if (!user) return null;

    return (
        <div className="messages-page" dir={dir}>
            <div className={`conv-list-panel ${mobileShowThread ? 'hidden-mobile' : ''}`}>
                <div className="conv-list-header">
                    <MessageSquare size={20} />
                    <h2>{t('msgMessages')}</h2>
                </div>

                {isLoading ? (
                    <div className="conv-list-empty">{t('msgLoading')}</div>
                ) : conversations.length === 0 && !pendingConv ? (
                    <div className="conv-list-empty">
                        <UserIcon size={36} style={{ opacity: 0.3 }} />
                        <p>{t('msgNoConversations')}</p>
                        <span>
                            {user.role?.toLowerCase() === 'employer' || user.role?.toLowerCase() === 'company'
                                ? t('msgEmployerNoConv')
                                : t('msgSeekerNoConv')}
                        </span>
                    </div>
                ) : (
                    <>
                        {/* Show pending (no-message) thread in the list if it isn't there yet */}
                        {pendingConv && !conversations.some(c => c.applicationJobId === pendingConv.applicationJobId) && (
                            <ConversationItem
                                key={`pending-${pendingConv.applicationJobId}`}
                                conv={pendingConv}
                                currentUserId={user.id}
                                isActive={pendingConv.applicationJobId === activeAppId}
                                onClick={() => openConv(pendingConv)}
                            />
                        )}
                        {conversations.map(conv => (
                            <ConversationItem
                                key={conv.applicationJobId}
                                conv={conv}
                                currentUserId={user.id}
                                isActive={conv.applicationJobId === activeAppId}
                                onClick={() => openConv(conv)}
                            />
                        ))}
                    </>
                )}
            </div>

            <div className={`thread-container ${mobileShowThread ? 'show-mobile' : ''}`}>
                {mobileShowThread && (
                    <button className="back-btn" onClick={backToList}>
                        <ArrowLeft size={18} /> {t('msgBack')}
                    </button>
                )}
                {pendingLoading ? (
                    <div className="thread-placeholder">
                        <div className="thread-empty">{t('msgLoadingConversation')}</div>
                    </div>
                ) : activeConv ? (
                    <Thread conv={activeConv} currentUserId={user.id} />
                ) : (
                    <div className="thread-placeholder">
                        <MessageSquare size={56} style={{ opacity: 0.2 }} />
                        <p>{t('msgSelectConversation')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
