/**
 * Fitty Voice Utility - Centralized speech synthesis for consistent & friendly voice.
 */

const fittyVoice = {
    speak: (text, onEnd = null) => {
        if (!window.speechSynthesis) {
            if (onEnd) onEnd();
            return;
        }

        console.log("🔊 FittyVoice: Speaking ->", text);

        // Cancel previous speech
        window.speechSynthesis.cancel();

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);

        // Get voices
        let voices = window.speechSynthesis.getVoices();
        
        const setVoice = () => {
            let preferredVoice = voices.find(v => (v.lang.includes('hi-IN') || v.lang.includes('en-IN')) && v.name.includes('Google'));
            if (!preferredVoice) {
                preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('Female') || v.lang.includes('en-US'));
            }
            if (preferredVoice) utterance.voice = preferredVoice;
        };

        if (voices.length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                voices = window.speechSynthesis.getVoices();
                setVoice();
                window.speechSynthesis.onvoiceschanged = null;
            };
        } else {
            setVoice();
        }

        utterance.pitch = 1.1;
        utterance.rate = 1.0;
        utterance.volume = 1.0;

        // Safety Trigger: ensure onEnd is called even if speech engine stalls
        let safetyTriggered = false;
        const triggerEnd = () => {
            if (!safetyTriggered) {
                safetyTriggered = true;
                if (onEnd) onEnd();
            }
        };

        utterance.onend = triggerEnd;
        utterance.onerror = (e) => {
            console.error("🔊 FittyVoice Error:", e);
            triggerEnd();
        };

        // Fallback for long speech or broken browsers
        // Estimated time: ~1 second per 15 characters, minimum 10 seconds
        const estimatedTime = Math.max(10000, (text.length / 15) * 1000 + 5000);
        console.log(`⏱️ FittyVoice: Safety timeout set to ${Math.round(estimatedTime/1000)}s`);
        
        setTimeout(() => triggerEnd(), estimatedTime); 

        window.speechSynthesis.speak(utterance);
    },

    stop: () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }
};

export default fittyVoice;
