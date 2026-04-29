import React, { useState, useEffect, useRef } from 'react';
import {
    Briefcase, FileText, Play, Loader2, Star, TrendingUp,
    AlertTriangle, RotateCcw, CheckCircle, ChevronDown, ChevronUp,
    Bot, Mic, MicOff, Volume2, VolumeX, ArrowLeft
} from 'lucide-react';
import { api } from '../../api/api';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceInterview } from './useVoiceInterview';
import './Interview.css';
import './VoiceInterview.css';

// ── Shared helpers (mirrors Interview.jsx — no shared module to avoid touching it) ──
const toInt      = (v) => Math.round(Number(v) || 0);
const scoreColor = (v) => { const n = toInt(v); if (n >= 70) return 'score-green'; if (n >= 45) return 'score-orange'; return 'score-red'; };
const scoreLabel = (v) => { const n = toInt(v); if (n >= 70) return 'Strong';      if (n >= 45) return 'Moderate';     return 'Needs Work'; };

// ── Sub-components ─────────────────────────────────────────────────────────────

const FeedbackToast = ({ feedback, score }) => (
    <div className="iv-feedback-card vi-feedback-toast">
        <div className="iv-feedback-header">
            <CheckCircle size={15} className="iv-icon-green" />
            <span>Feedback</span>
            <span className={`iv-score-pill ${scoreColor(score * 10)}`}>{toInt(score)}/10</span>
        </div>
        <p className="iv-feedback-text">{feedback}</p>
    </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * Voice Interview — reuses POST /api/interview/start and /api/interview/answer
 * exactly like the chat mode. Only the input layer differs (mic → text → API).
 *
 * Props:
 *   onBack  – callback to return to mode-selection screen
 */
const VoiceInterview = ({ onBack }) => {
    const { dir } = useLanguage();
    const voice   = useVoiceInterview();

    // ── Phase state ────────────────────────────────────────────────────────
    const [phase,    setPhase]    = useState('setup');   // setup | interview | results
    const [jobTitle, setJobTitle] = useState('');
    const [jobDesc,  setJobDesc]  = useState('');

    // ── Session state ──────────────────────────────────────────────────────
    const [sessionId,    setSessionId]    = useState('');
    const [question,     setQuestion]     = useState('');
    const [qNum,         setQNum]         = useState(0);
    const [qTotal,       setQTotal]       = useState(5);
    const [lastFeedback, setLastFeedback] = useState(null);  // { text, score }
    const [results,      setResults]      = useState(null);

    // ── UI state ───────────────────────────────────────────────────────────
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState('');
    const [historyOpen,  setHistOpen]     = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    const feedbackTimerRef = useRef(null);

    // ── Speak question whenever it changes (if AI voice is on) ────────────
    useEffect(() => {
        if (question && voiceEnabled && phase === 'interview') {
            voice.speak(question);
        }
    }, [question]); // eslint-disable-line react-hooks/exhaustive-deps
    // ^ voice.speak is stable (useCallback). We intentionally run only when
    //   question changes so toggling voiceEnabled mid-question doesn't re-read.

    // ── Auto-dismiss feedback after 8 s ────────────────────────────────────
    useEffect(() => {
        if (!lastFeedback) return;
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = setTimeout(() => setLastFeedback(null), 8000);
        return () => clearTimeout(feedbackTimerRef.current);
    }, [lastFeedback]);

    // ── Cleanup TTS on unmount ─────────────────────────────────────────────
    useEffect(() => () => voice.stopSpeaking(), []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Handlers ───────────────────────────────────────────────────────────

    const handleStart = async () => {
        if (!jobTitle.trim())           { setError('Please enter a job title.');                              return; }
        if (jobDesc.trim().length < 20) { setError('Job description must be at least 20 characters.');       return; }

        setError('');
        setLoading(true);
        try {
            const res = await api.startInterview(jobTitle.trim(), jobDesc.trim());
            setSessionId(res.sessionId);
            setQNum(res.questionNumber);
            setQTotal(res.totalQuestions);
            setQuestion(res.question);
            setPhase('interview');
        } catch (err) {
            setError(err.message || 'Failed to start interview. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        const answer = voice.transcript.trim();
        if (!answer)          { setError('Please record an answer first.');          return; }
        if (answer.length < 5){ setError('Answer is too short. Please say more.');   return; }

        setError('');
        setLoading(true);
        voice.stopSpeaking();
        voice.stopRecording();

        try {
            const res = await api.answerInterview(sessionId, answer);

            voice.resetTranscript();

            if (res.feedback) {
                setLastFeedback({ text: res.feedback, score: res.answerScore ?? 0 });
            }

            if (res.isComplete) {
                setResults(res);
                setPhase('results');
            } else {
                setQuestion(res.question);
                setQNum(res.questionNumber);
            }
        } catch (err) {
            setError(err.message || 'Failed to submit answer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMicToggle = () => {
        if (voice.isRecording) {
            voice.stopRecording();
        } else {
            voice.resetTranscript();
            setError('');
            voice.startRecording();
        }
    };

    const handleReset = () => {
        voice.stopSpeaking();
        voice.stopRecording();
        voice.resetTranscript();
        setPhase('setup');
        setSessionId('');
        setQuestion('');
        setQNum(0);
        setResults(null);
        setLastFeedback(null);
        setError('');
        setHistOpen(false);
    };

    // ── Live display transcript ────────────────────────────────────────────
    const displayText = voice.isRecording
        ? (voice.transcript + ' ' + voice.interimTranscript).trim()
        : voice.transcript;

    // ══════════════════════════════════════════════════════════════════════
    // RENDER: SETUP
    // ══════════════════════════════════════════════════════════════════════
    if (phase === 'setup') return (
        <div className="iv-page" dir={dir}>
            <div className="iv-header">
                <button className="vi-back-btn" onClick={onBack} title="Back to mode selection">
                    <ArrowLeft size={18} />
                </button>
                <div className="iv-header-icon vi-header-icon">
                    <Mic size={24} />
                </div>
                <div>
                    <h1 className="iv-title">Voice Interview</h1>
                    <p className="iv-subtitle">Speak your answers — AI evaluates your voice responses</p>
                </div>
            </div>

            {/* Browser support warning */}
            {!voice.isSupported && (
                <div className="iv-error">
                    <AlertTriangle size={15} />
                    <span>
                        Your browser does not support Speech Recognition.
                        Please use <strong>Chrome</strong> or <strong>Edge</strong> for voice mode.
                    </span>
                </div>
            )}

            <div className="iv-card iv-setup-card">
                <div className="iv-field">
                    <label className="iv-label">
                        <Briefcase size={14} />
                        Job Title <span className="iv-req">*</span>
                    </label>
                    <input
                        className="iv-input"
                        type="text"
                        placeholder="e.g. Frontend Developer"
                        value={jobTitle}
                        onChange={e => { setJobTitle(e.target.value); setError(''); }}
                        disabled={loading}
                        maxLength={100}
                    />
                </div>

                <div className="iv-field">
                    <label className="iv-label">
                        <FileText size={14} />
                        Job Description <span className="iv-req">*</span>
                    </label>
                    <textarea
                        className="iv-textarea"
                        placeholder="Describe the role, required skills, and responsibilities..."
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
                        disabled={loading || !jobTitle.trim() || jobDesc.trim().length < 20 || !voice.isSupported}
                    >
                        {loading
                            ? <><Loader2 size={18} className="iv-spin" /><span>Starting...</span></>
                            : <><Play size={18} /><span>Start Voice Interview</span></>
                        }
                    </button>
                </div>
            </div>
        </div>
    );

    // ══════════════════════════════════════════════════════════════════════
    // RENDER: RESULTS
    // ══════════════════════════════════════════════════════════════════════
    if (phase === 'results' && results) {
        const finalPct = toInt(results.finalScore);
        const color    = scoreColor(finalPct);
        const label    = scoreLabel(finalPct);

        return (
            <div className="iv-page" dir={dir}>
                <div className="iv-header">
                    <div className="iv-header-icon vi-header-icon"><Mic size={24} /></div>
                    <div>
                        <h1 className="iv-title">Interview Complete</h1>
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
                                <Star size={16} className="iv-icon-green" /><h3>Strengths</h3>
                            </div>
                            <ul className="iv-list iv-list-green">
                                {results.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    )}
                    {results.improvements?.length > 0 && (
                        <div className="iv-card">
                            <div className="iv-card-header">
                                <TrendingUp size={16} className="iv-icon-blue" /><h3>Improvements</h3>
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
                        <button className="iv-accordion-toggle" onClick={() => setHistOpen(o => !o)}>
                            <span>Interview History</span>
                            {historyOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {historyOpen && (
                            <div className="iv-history">
                                {results.history.map((h, i) => (
                                    <div key={i} className="iv-history-item">
                                        <p className="iv-history-q"><strong>Q{i + 1}:</strong> {h.question}</p>
                                        <p className="iv-history-a"><strong>A:</strong> {h.answer}</p>
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
                        <RotateCcw size={16} /><span>New Voice Interview</span>
                    </button>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════════════════
    // RENDER: INTERVIEW (voice phase)
    // ══════════════════════════════════════════════════════════════════════
    return (
        <div className="iv-page" dir={dir}>

            {/* Header */}
            <div className="iv-header">
                <div className="iv-header-icon vi-header-icon"><Mic size={24} /></div>
                <div>
                    <h1 className="iv-title">Voice Interview</h1>
                    <p className="iv-subtitle">{jobTitle}</p>
                </div>

                {/* AI Voice toggle */}
                <button
                    className={`vi-voice-toggle ${voiceEnabled ? 'vi-voice-toggle--on' : ''}`}
                    onClick={() => {
                        if (voiceEnabled) voice.stopSpeaking();
                        setVoiceEnabled(v => !v);
                    }}
                    title={voiceEnabled ? 'Disable AI voice' : 'Enable AI voice'}
                >
                    {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                    <span>{voiceEnabled ? 'AI Voice On' : 'AI Voice Off'}</span>
                </button>
            </div>

            {/* Progress bar */}
            <div className="iv-progress-bar-wrap">
                <div className="iv-progress-label">Question {qNum} of {qTotal}</div>
                <div className="iv-progress-track">
                    <div className="iv-progress-fill" style={{ width: `${(qNum / qTotal) * 100}%` }} />
                </div>
            </div>

            {/* Question card */}
            <div className="iv-card vi-question-card">
                <div className="vi-question-header">
                    <div className="iv-avatar iv-avatar--ai"><Bot size={18} /></div>
                    <span className="iv-bubble-meta">Question {qNum} / {qTotal}</span>

                    {/* Stop-speech button shown only while speaking */}
                    {voice.isSpeaking && (
                        <button className="vi-stop-speech-btn" onClick={voice.stopSpeaking} title="Stop reading aloud">
                            <VolumeX size={13} /> Stop
                        </button>
                    )}
                </div>

                {loading && !question
                    ? <div className="iv-typing"><span /><span /><span /></div>
                    : <p className="vi-question-text">{question}</p>
                }
            </div>

            {/* Feedback toast — auto-dismisses after 8 s */}
            {lastFeedback && (
                <FeedbackToast feedback={lastFeedback.text} score={lastFeedback.score} />
            )}

            {/* Errors (API or voice) */}
            {(error || voice.voiceError) && (
                <div className="iv-error">
                    <AlertTriangle size={15} />
                    <span>{error || voice.voiceError}</span>
                </div>
            )}

            {/* ── Voice recorder card ── */}
            <div className="vi-recorder-card">

                {/* Mic button */}
                <div className="vi-mic-section">
                    <button
                        className={`vi-mic-btn ${voice.isRecording ? 'vi-mic-btn--recording' : ''}`}
                        onClick={handleMicToggle}
                        disabled={loading}
                        title={voice.isRecording ? 'Stop recording' : 'Start recording'}
                        aria-label={voice.isRecording ? 'Stop recording' : 'Start recording'}
                    >
                        {voice.isRecording ? <MicOff size={30} /> : <Mic size={30} />}
                        {voice.isRecording && <span className="vi-pulse-ring" />}
                    </button>

                    <p className="vi-mic-status">
                        {loading
                            ? 'Processing answer...'
                            : voice.isRecording
                                ? 'Listening — press again to stop'
                                : voice.transcript
                                    ? 'Recording saved — review & submit'
                                    : 'Press mic to start speaking'
                        }
                    </p>
                </div>

                {/* Transcript box — only shown once there is content */}
                {(displayText || voice.isRecording) && (
                    <div className="vi-transcript-box">
                        <span className="vi-transcript-label">
                            {voice.isRecording ? 'Listening...' : 'Your answer'}
                        </span>
                        <p className="vi-transcript-text">
                            {displayText || <em className="vi-transcript-placeholder">Start speaking...</em>}
                        </p>

                        {/* Action row — only when not recording and there is text */}
                        {!voice.isRecording && voice.transcript && (
                            <div className="vi-transcript-actions">
                                <button
                                    className="vi-clear-btn"
                                    onClick={() => { voice.resetTranscript(); setError(''); }}
                                    disabled={loading}
                                >
                                    Clear
                                </button>
                                <button
                                    className="iv-btn iv-btn-primary vi-submit-btn"
                                    onClick={handleSubmitAnswer}
                                    disabled={loading || voice.transcript.trim().length < 5}
                                >
                                    {loading
                                        ? <><Loader2 size={16} className="iv-spin" /><span>Submitting...</span></>
                                        : <span>Submit Answer</span>
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceInterview;
