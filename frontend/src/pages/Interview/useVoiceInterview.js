import { useState, useEffect, useRef, useCallback } from 'react';

const SpeechRecognitionAPI =
    (typeof window !== 'undefined') &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

const synthSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * Abstracts the Web Speech API (recognition + synthesis).
 * Falls back gracefully when the browser lacks support.
 *
 * Returns:
 *   isSupported      – true if SpeechRecognition is available
 *   isRecording      – mic is active
 *   transcript       – accumulated final text from current session
 *   interimTranscript – live partial text while speaking
 *   isSpeaking       – TTS is currently playing
 *   voiceError       – last error message (or '')
 *   startRecording() – begin STT
 *   stopRecording()  – end STT (finalises transcript)
 *   resetTranscript()– clear transcript + error
 *   speak(text, opts)– TTS; opts: { rate, pitch, lang }
 *   stopSpeaking()   – cancel TTS
 */
export function useVoiceInterview() {
    const [isSupported]       = useState(Boolean(SpeechRecognitionAPI));
    const [isRecording,   setIsRecording]   = useState(false);
    const [transcript,    setTranscript]    = useState('');
    const [interimTranscript, setInterim]   = useState('');
    const [isSpeaking,    setIsSpeaking]    = useState(false);
    const [voiceError,    setVoiceError]    = useState('');

    const recognitionRef = useRef(null);

    // ── Initialise SpeechRecognition once ──────────────────────────────────
    useEffect(() => {
        if (!SpeechRecognitionAPI) return;

        const rec = new SpeechRecognitionAPI();
        rec.continuous      = false;   // single utterance per press
        rec.interimResults  = true;
        rec.lang            = 'en-US';
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
            setIsRecording(false);
            setInterim('');
            const MAP = {
                'no-speech':   'No speech detected. Please try again.',
                'not-allowed': 'Microphone access denied. Enable it in browser settings.',
                'network':     'Network error during recognition. Check your connection.',
                'aborted':     '',   // user-initiated, not an error
            };
            const msg = MAP[e.error] ?? `Speech recognition error: ${e.error}`;
            if (msg) setVoiceError(msg);
        };

        rec.onend = () => {
            setIsRecording(false);
            setInterim('');
        };

        recognitionRef.current = rec;
        return () => rec.abort();
    }, []);   // stable — runs once

    // ── STT controls ────────────────────────────────────────────────────────
    const startRecording = useCallback(() => {
        if (!SpeechRecognitionAPI || isRecording) return;
        setVoiceError('');
        setInterim('');
        try {
            recognitionRef.current.start();
            setIsRecording(true);
        } catch {
            setVoiceError('Could not start recording. Please try again.');
        }
    }, [isRecording]);

    const stopRecording = useCallback(() => {
        if (!isRecording) return;
        recognitionRef.current?.stop();
        // isRecording → false is handled by the onend callback
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
        utt.lang    = opts.lang  ?? 'en-US';
        utt.onstart = () => setIsSpeaking(true);
        utt.onend   = () => setIsSpeaking(false);
        utt.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utt);
    }, []);

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
