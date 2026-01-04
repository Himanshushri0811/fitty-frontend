import React, { useEffect } from 'react';
import fittyVoice from '../utils/fittyVoice';

const Speech = ({ text }) => {
    useEffect(() => {
        if (text) {
            fittyVoice.speak(text);
        }
    }, [text]);

    return null;
};

export default Speech;
