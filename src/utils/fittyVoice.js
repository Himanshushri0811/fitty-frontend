/**
 * Fitty Voice Utility - Centralized speech synthesis for consistent & friendly voice.
 */

const fittyVoice = {
    speak: (text) => {
        if (!window.speechSynthesis) return;

        // Stop any current speaking
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Get all available voices
        const voices = window.speechSynthesis.getVoices();

        /**
         * Voice Selection Logic:
         * 1. Check for "English (India)" or "Hindi (India)" voices for a localized, friendly feel.
         * 2. Prefer "Google" voices as they often sound smoother in browsers.
         * 3. Fallback to default.
         */
        let preferredVoice = voices.find(v => (v.lang.includes('hi-IN') || v.lang.includes('en-IN')) && v.name.includes('Google'));

        if (!preferredVoice) {
            preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('Female'));
        }

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        // Friendly parameters
        utterance.pitch = 1.1; // Slightly higher pitch for "friendly friend" feel
        utterance.rate = 1.0;  // Natural rate
        utterance.volume = 1.0;

        window.speechSynthesis.speak(utterance);
    },

    stop: () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }
};

export default fittyVoice;
