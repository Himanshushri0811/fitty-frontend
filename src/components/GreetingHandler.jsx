import React, { useEffect } from 'react';
import fittyVoice from '../utils/fittyVoice';

/**
 * GreetingHandler - Listens for login success and speaks a warm welcome.
 */
const GreetingHandler = () => {
    useEffect(() => {
        // Check if a greeting is needed after login
        const needsGreeting = localStorage.getItem('fitty_greeting_needed');

        if (needsGreeting === 'true') {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const name = user ? (user.first_name || user.username) : "Friend";

            // The Welcome Message (Friendly & Personal)
            const welcomeText = `Hello ${name}! Main Fitty hu, aapka personal fitness friend. Main aapki har cheez mein help kar sakta hoon. Bataiye, aaj hum kya shuru karein?`;

            // Short delay to ensure voices are loaded and UI has stabilized
            const timer = setTimeout(() => {
                fittyVoice.speak(welcomeText);
                localStorage.removeItem('fitty_greeting_needed');
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, []);

    return null; // This component doesn't render anything
};

export default GreetingHandler;
