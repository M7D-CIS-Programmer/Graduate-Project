import React, { useState, useRef, useEffect } from 'react';
import {
    MessageSquare, Briefcase, FileText, Play, Send,
    Loader2, Star, TrendingUp, AlertTriangle, RotateCcw,
    CheckCircle, ChevronDown, ChevronUp, Bot, User
} from 'lucide-react';
import { api } from '../../api/api';
import { useLanguage } from '../../context/LanguageContext';
import './Interview.css';

// ── helpers ────────────────────────────────────────────────────────────────────

const toInt = (v) => Math.round(Number(v) || 0);

const scoreColor = (v) => {
    const n = toInt(v);
    if (n >= 70) return 'score-green';
    if (n >= 45) return 'score-orange';
    return 'score-red';
};

const scoreLabel = (v) => {
    const n = toInt(v);
    if (n >= 70) return 'Strong';
    if (n >= 45) return 'Moderate';
    return 'Needs Work';
};

// ── sub-components ─────────────────────────────────────────────────────────────

const QuestionBubble = ({ text, number, total }) => (
    <div className="iv-bubble-row iv-bubble-row--ai">
        <div className="iv-avatar iv-avatar--ai"><Bot size={18} /></div>
        <div className="iv-bubble iv-bubble--ai">
            <span className="iv-bubble-meta">Question {number}/{total}</span>
            <p>{text}</p>
        </div>
    </div>
);

const AnswerBubble = ({ text }) => (
    <div className="iv-bubble-row iv-bubble-row--user">
        <div className="iv-bubble iv-bubble--user">
            <p>{text}</p>
        </div>
        <div className="iv-avatar iv-avatar--user"><User size={18} /></div>
    </div>
);

const FeedbackBubble = ({ feedback, score }) => (
    <div className="iv-feedback-card">
        <div className="iv-feedback-header">
            <CheckCircle size={15} className="iv-icon-green" />
            <span>Feedback</span>
            <span className={`iv-score-pill ${scoreColor(score * 10)}`}>
                {toInt(score)}/10
            </span>
        </div>
        <p className="iv-feedback-text">{feedback}</p>
    </div>
);

// ── main component ─────────────────────────────────────────────────────────────

const Interview = () => {
    const { t, dir } = useLanguage();
    const chatEndRef = useRef(null);

    // ── state ──────────────────────────────────────────────────────────────────
    const [phase, setPhase]           = useState('setup');    // setup | interview | results
    const [jobTitle, setJobTitle]     = useState('');
    const [jobDesc, setJobDesc]       = useState('');
    const [sessionId, setSessionId]   = useState('');
    const [messages, setMessages]     = useState([]);          // chat history
    const [currentAnswer, setAnswer]  = useState('');
    const [qNum, setQNum]             = useState(0);
    const [qTotal, setQTotal]         = useState(5);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState('');
    const [results, setResults]       = useState(null);
    const [historyOpen, setHistOpen]  = useState(false);

    // auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // ── setup → start ──────────────────────────────────────────────────────────

    const handleStart = async () => {
        if (!jobTitle.trim())               { setError(t('interviewErrorNoTitle')); return; }
        if (jobDesc.trim().length < 20)     { setError(t('interviewErrorNoDesc'));  return; }

        setError('');
        setLoading(true);
        try {
            const res = await api.startInterview(jobTitle.trim(), jobDesc.trim());
            setSessionId(res.sessionId);
            setQNum(res.questionNumber);
            setQTotal(res.totalQuestions);
            setMessages([{ id: 1, type: 'question', content: res.question, qNum: res.questionNumber }]);
            setPhase('interview');
        } catch (err) {
            setError(err.message || t('interviewErrorGeneral'));
        } finally {
            setLoading(false);
        }
    };

    // ── submit answer ──────────────────────────────────────────────────────────

    const handleAnswer = async () => {
        const ans = currentAnswer.trim();
        if (!ans)        { setError(t('interviewErrorNoAnswer'));    return; }
        if (ans.length < 5) { setError(t('interviewErrorShortAnswer')); return; }

        setError('');
        setLoading(true);

        // Optimistically add user bubble
        const userMsg = { id: Date.now(), type: 'answer', content: ans };
        setMessages(prev => [...prev, userMsg]);
        setAnswer('');

        try {
            const res = await api.answerInterview(sessionId, ans);

            const newMsgs = [];

            // Feedback bubble
            if (res.feedback) {
                newMsgs.push({
                    id: Date.now() + 1,
                    type: 'feedback',
                    content: res.feedback,
                    score: res.answerScore ?? 0
                });
            }

            if (res.isComplete) {
                setResults(res);
                setPhase('results');
            } else {
                // Next question bubble
                newMsgs.push({
                    id: Date.now() + 2,
                    type: 'question',
                    content: res.question,
                    qNum: res.questionNumber
                });
                setQNum(res.questionNumber);
            }

            setMessages(prev => [...prev, ...newMsgs]);
        } catch (err) {
            setError(err.message || t('interviewErrorGeneral'));
            // Remove optimistic user bubble on failure
            setMessages(prev => prev.filter(m => m.id !== userMsg.id));
            setAnswer(ans);
        } finally {
            setLoading(false);
        }
    };

    // ── reset ──────────────────────────────────────────────────────────────────

    const handleReset = () => {
        setPhase('setup');
        setMessages([]);
        setSessionId('');
        setQNum(0);
        setResults(null);
        setError('');
        setAnswer('');
        setHistOpen(false);
    };

    // ── render: setup phase ────────────────────────────────────────────────────

    if (phase === 'setup') return (
        <div className="iv-page" dir={dir}>
            <div className="iv-header">
                <div className="iv-header-icon"><MessageSquare size={26} /></div>
                <div>
                    <h1 className="iv-title">{t('interview')}</h1>
                    <p className="iv-subtitle">{t('interviewSubtitle')}</p>
                </div>
            </div>

            <div className="iv-card iv-setup-card">
                <div className="iv-field">
                    <label className="iv-label">
                        <Briefcase size={14} />
                        {t('interviewJobTitle')} <span className="iv-req">*</span>
                    </label>
                    <input
                        className="iv-input"
                        type="text"
                        placeholder={t('interviewJobTitlePlaceholder')}
                        value={jobTitle}
                        onChange={e => { setJobTitle(e.target.value); setError(''); }}
                        disabled={loading}
                        maxLength={100}
                    />
                </div>

                <div className="iv-field">
                    <label className="iv-label">
                        <FileText size={14} />
                        {t('interviewJobDesc')} <span className="iv-req">*</span>
                    </label>
                    <textarea
                        className="iv-textarea"
                        placeholder={t('interviewJobDescPlaceholder')}
                        value={jobDesc}
                        onChange={e => { setJobDesc(e.target.value); setError(''); }}
                        disabled={loading}
                        rows={6}
                    />
                </div>

                {error && (
                    <div className="iv-error">
                        <AlertTriangle size={15} /><span>{error}</span>
                    </div>
                )}

                <div className="iv-actions">
                    <button
                        className="iv-btn iv-btn-primary"
                        onClick={handleStart}
                        disabled={loading || !jobTitle.trim() || jobDesc.trim().length < 20}
                    >
                        {loading
                            ? <><Loader2 size={18} className="iv-spin" /><span>{t('interviewLoading')}</span></>
                            : <><Play size={18} /><span>{t('startInterview')}</span></>
                        }
                    </button>
                </div>
            </div>
        </div>
    );

    // ── render: results phase ──────────────────────────────────────────────────

    if (phase === 'results' && results) {
        const finalPct  = toInt(results.finalScore);
        const color     = scoreColor(finalPct);
        const label     = scoreLabel(finalPct);

        return (
            <div className="iv-page" dir={dir}>
                <div className="iv-header">
                    <div className="iv-header-icon"><MessageSquare size={26} /></div>
                    <div>
                        <h1 className="iv-title">{t('interviewComplete')}</h1>
                        <p className="iv-subtitle">{jobTitle}</p>
                    </div>
                </div>

                {/* Score card */}
                <div className="iv-card">
                    <div className="iv-score-section">
                        <div className={`iv-score-circle ${color}`}>
                            <span className="iv-score-num">{finalPct}</span>
                            <span className="iv-score-denom">/100</span>
                        </div>
                        <div className="iv-score-meta">
                            <span className={`iv-score-label ${color}`}>{label}</span>
                            <div className="iv-bar-track">
                                <div className={`iv-bar-fill ${color}`} style={{ width: `${finalPct}%` }} />
                            </div>
                            {results.finalSummary && (
                                <p className="iv-summary">{results.finalSummary}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Strengths + Improvements */}
                <div className="iv-results-grid">
                    {results.strengths?.length > 0 && (
                        <div className="iv-card">
                            <div className="iv-card-header">
                                <Star size={16} className="iv-icon-green" />
                                <h3>{t('interviewStrengths')}</h3>
                            </div>
                            <ul className="iv-list iv-list-green">
                                {results.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    )}
                    {results.improvements?.length > 0 && (
                        <div className="iv-card">
                            <div className="iv-card-header">
                                <TrendingUp size={16} className="iv-icon-blue" />
                                <h3>{t('interviewImprovements')}</h3>
                            </div>
                            <ul className="iv-list iv-list-blue">
                                {results.improvements.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    )}
                </div>

                {/* History accordion */}
                {results.history?.length > 0 && (
                    <div className="iv-card">
                        <button
                            className="iv-accordion-toggle"
                            onClick={() => setHistOpen(o => !o)}
                        >
                            <span>{t('interviewHistory')}</span>
                            {historyOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {historyOpen && (
                            <div className="iv-history">
                                {results.history.map((h, i) => (
                                    <div key={i} className="iv-history-item">
                                        <p className="iv-history-q">
                                            <strong>Q{i + 1}:</strong> {h.question}
                                        </p>
                                        <p className="iv-history-a">
                                            <strong>A:</strong> {h.answer}
                                        </p>
                                        <div className="iv-history-fb">
                                            <span className={`iv-score-pill ${scoreColor(h.score * 10)}`}>
                                                {toInt(h.score)}/10
                                            </span>
                                            <span>{h.feedback}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="iv-actions">
                    <button className="iv-btn iv-btn-primary" onClick={handleReset}>
                        <RotateCcw size={16} />
                        <span>{t('startNewInterview')}</span>
                    </button>
                </div>
            </div>
        );
    }

    // ── render: interview (chat) phase ─────────────────────────────────────────

    return (
        <div className="iv-page" dir={dir}>
            <div className="iv-header">
                <div className="iv-header-icon"><MessageSquare size={26} /></div>
                <div>
                    <h1 className="iv-title">{t('interviewInProgress')}</h1>
                    <p className="iv-subtitle">{jobTitle}</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="iv-progress-bar-wrap">
                <div className="iv-progress-label">
                    {t('interviewQuestion')} {qNum} {t('interviewOf')} {qTotal}
                </div>
                <div className="iv-progress-track">
                    <div
                        className="iv-progress-fill"
                        style={{ width: `${(qNum / qTotal) * 100}%` }}
                    />
                </div>
            </div>

            {/* Chat window */}
            <div className="iv-chat-window">
                {messages.map(msg => {
                    if (msg.type === 'question')
                        return <QuestionBubble key={msg.id} text={msg.content} number={msg.qNum} total={qTotal} />;
                    if (msg.type === 'answer')
                        return <AnswerBubble key={msg.id} text={msg.content} />;
                    if (msg.type === 'feedback')
                        return <FeedbackBubble key={msg.id} feedback={msg.content} score={msg.score} />;
                    return null;
                })}

                {loading && (
                    <div className="iv-bubble-row iv-bubble-row--ai">
                        <div className="iv-avatar iv-avatar--ai"><Bot size={18} /></div>
                        <div className="iv-typing">
                            <span /><span /><span />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Error */}
            {error && (
                <div className="iv-error">
                    <AlertTriangle size={15} /><span>{error}</span>
                </div>
            )}

            {/* Answer input */}
            <div className="iv-answer-box">
                <textarea
                    className="iv-answer-input"
                    placeholder={t('interviewAnswerPlaceholder')}
                    value={currentAnswer}
                    onChange={e => { setAnswer(e.target.value); setError(''); }}
                    disabled={loading}
                    rows={3}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && e.ctrlKey && !loading) handleAnswer();
                    }}
                />
                <button
                    className="iv-btn iv-btn-send"
                    onClick={handleAnswer}
                    disabled={loading || !currentAnswer.trim()}
                    title="Submit (Ctrl + Enter)"
                >
                    {loading
                        ? <Loader2 size={20} className="iv-spin" />
                        : <Send size={20} />
                    }
                </button>
            </div>
            <p className="iv-hint">Ctrl + Enter to submit</p>
        </div>
    );
};

export default Interview;
