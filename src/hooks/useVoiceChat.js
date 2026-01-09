import { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import fittyVoice from '../utils/fittyVoice';

const useVoiceChat = (initialMuteState = false) => {
    const [isMuted, setIsMuted] = useState(initialMuteState);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // Handle transcript updates from parent if needed, 
    // but usually parent consumes 'transcript' directly.

    const startListening = useCallback(() => {
        if (browserSupportsSpeechRecognition) {
            SpeechRecognition.startListening({
                continuous: false,
                language: 'en-IN'
            });
        } else {
            console.warn("Browser does not support speech recognition.");
        }
    }, [browserSupportsSpeechRecognition]);

    const stopListening = useCallback(() => {
        SpeechRecognition.stopListening();
    }, []);

    const speak = useCallback((text) => {
        if (isMuted) return;

        // Clean text for speech
        const cleanText = text
            .replace(/\*\*/g, '')
            .replace(/[•\-]/g, '. ')
            .replace(/\n/g, '. ')
            .replace(/[🏋️‍♂️🥗💪🔥🍗]/g, '');

        fittyVoice.speak(cleanText);
        setIsSpeaking(true);

        // Rough estimate for duration to turn off "speaking" indicator
        const duration = (cleanText.length / 10) * 1000;
        // Ideally we'd use 'end' event but wrapper might not expose it easily.
        // Set a max timeout safety
        setTimeout(() => setIsSpeaking(false), Math.min(duration, 8000));
    }, [isMuted]);

    const stopSpeaking = useCallback(() => {
        fittyVoice.stop();
        setIsSpeaking(false);
    }, []);

    const toggleMute = useCallback(() => {
        if (!isMuted) {
            stopSpeaking();
        }
        setIsMuted(prev => !prev);
    }, [isMuted, stopSpeaking]);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopSpeaking();
            stopListening();
        };
    }, [stopSpeaking, stopListening]);

    return {
        transcript,
        listening,
        resetTranscript,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        isMuted,
        toggleMute,
        isSpeaking,
        browserSupportsSpeechRecognition
    };
};

export default useVoiceChat;
