import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const SpeechRecognitionAPI =
    (typeof window !== 'undefined') &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

const synthSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

export function useVoiceInterview() {
    const { language, t } = useLanguage();
    const [isSupported]       = useState(Boolean(SpeechRecognitionAPI));
    const [isRecording,   setIsRecording]   = useState(false);
    const [transcript,    setTranscript]    = useState('');
    const [interimTranscript, setInterim]   = useState('');
    const [isSpeaking,    setIsSpeaking]    = useState(false);
    const [voiceError,    setVoiceError]    = useState('');

    const recognitionRef = useRef(null);

    useEffect(() => {
        return () => recognitionRef.current?.abort();
    }, []);

    // ── STT controls ────────────────────────────────────────────────────────
    const startRecording = useCallback(() => {
        if (!SpeechRecognitionAPI || isRecording) return;

        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }

        const rec = new SpeechRecognitionAPI();
        rec.continuous      = true;
        rec.interimResults  = true;
        rec.lang            = language === 'ar' ? 'ar-SA' : 'en-US';
        rec.maxAlternatives = 1;

        rec.onresult = (e) => {
            let finalText   = '';
            let interimText = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const t = e.results[i][0].transcript;
                if (e.results[i].isFinal) finalText   += t;
                else                      interimText  += t;
            }
            if (finalText) setTranscript(prev => (prev + ' ' + finalText).trim());
            setInterim(interimText);
        };

        rec.onerror = (e) => {
            if (e.error === 'aborted') return;
            setIsRecording(false);
            setInterim('');
            const MAP = {
                'no-speech':   t('interviewErrorNoSpeech'),
                'not-allowed': t('interviewErrorMicDenied'),
                'network':     t('actionFailed'),
            };
            const msg = MAP[e.error] ?? `${t('actionFailed')} (${e.error})`;
            if (msg) setVoiceError(msg);
        };

        rec.onend = () => {
            setIsRecording(false);
            setInterim('');
        };

        recognitionRef.current = rec;

        setVoiceError('');
        setInterim('');
        try {
            rec.start();
            setIsRecording(true);
        } catch {
            setVoiceError(t('actionFailed'));
        }
    }, [isRecording, language, t]);

    const stopRecording = useCallback(() => {
        if (!isRecording) return;
        recognitionRef.current?.stop();
    }, [isRecording]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterim('');
        setVoiceError('');
    }, []);

    // ── TTS controls ────────────────────────────────────────────────────────
    const speak = useCallback((text, opts = {}) => {
        if (!synthSupported || !text) return;
        window.speechSynthesis.cancel();
        const utt   = new SpeechSynthesisUtterance(text);
        utt.rate    = opts.rate  ?? 1;
        utt.pitch   = opts.pitch ?? 1;
        utt.lang    = opts.lang  ?? (language === 'ar' ? 'ar-SA' : 'en-US');
        utt.onstart = () => setIsSpeaking(true);
        utt.onend   = () => setIsSpeaking(false);
        utt.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utt);
    }, [language]);

    const stopSpeaking = useCallback(() => {
        if (!synthSupported) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    return {
        isSupported,
        isRecording,
        transcript,
        interimTranscript,
        isSpeaking,
        voiceError,
        startRecording,
        stopRecording,
        resetTranscript,
        speak,
        stopSpeaking,
    };
}
