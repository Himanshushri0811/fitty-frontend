import React, { useEffect } from 'react';

const Speech = ({ text }) => {
    useEffect(() => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';  // हिंदी में बोलने के लिए
        synth.speak(utterance);
    }, [text]);

    return null;  // कोई UI नहीं दिखेगा
};

export default Speech;
