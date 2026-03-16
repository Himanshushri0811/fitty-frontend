import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaTimes, FaRobot } from 'react-icons/fa';
import { chatbotService } from '../../services/chatbotService';
import fittyVoice from '../../utils/fittyVoice';
import './FittyBuddy.css';

const FittyBuddy = ({ isOpen, onClose }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const recognitionRef = useRef(null);
    const synthesisRef = useRef(window.speechSynthesis);

    useEffect(() => {
        if (isOpen) {
            // Give a friendly Hinglish greeting on open
            const greetings = [
                "Namaste Champ! Main Fitty hoon. Aaj kya workout plan hai?",
                "Hello Buddy! FitMitra AI is ready. Kaise madad karun aapki?",
                "Hey! Fitty here. Let's get moving! Kya sawal hai aapka today?"
            ];
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
            setResponse(randomGreeting);
            speak(randomGreeting, () => {
                startListening();
            });
        } else {
            stopListening();
            fittyVoice.stop();
        }
    }, [isOpen]);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            setTranscript('');
            setResponse('');
        };

        recognitionRef.current.onresult = (event) => {
            const current = event.resultIndex;
            const transcriptText = event.results[current][0].transcript;
            setTranscript(transcriptText);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
            if (transcript) {
                handleSendMessage(transcript);
            }
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech Rec Error:", event.error);
            setIsListening(false);
        };

        recognitionRef.current.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const handleSendMessage = async (text) => {
        setIsProcessing(true);
        try {
            const result = await chatbotService.sendAgentMessage(text);
            const resText = result.response || result.output;
            setResponse(resText);
            speak(resText, () => {
                // Short delay to avoid feedback from own voice
                setTimeout(() => startListening(), 500);
            });
        } catch (error) {
            console.error("Buddy Error:", error);
            setResponse("Sorry champ, I hit a snag. Try again?");
        } finally {
            setIsProcessing(false);
        }
    };

    const speak = (text, onEnd) => {
        fittyVoice.speak(text, onEnd);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="buddy-speech-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <button className="close-buddy-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <motion.div 
                    className="fitty-buddy-sphere"
                    animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                />

                <h2 className="buddy-status-text">
                    {isListening ? "Listening..." : isProcessing ? "Fitty is thinking..." : "Your Gym Buddy"}
                </h2>

                <div className="buddy-transcript">
                    {transcript || "Speak now..."}
                </div>

                {isListening && (
                    <div className="siri-wave-container">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="siri-wave" />
                        ))}
                    </div>
                )}

                {response && (
                    <motion.div 
                        className="buddy-response"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        {response}
                    </motion.div>
                )}

                {!isListening && !isProcessing && (
                    <motion.button 
                        className="fitty-nav-trigger"
                        style={{ width: '80px', height: '80px', marginTop: '40px' }}
                        onClick={startListening}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FaMicrophone size={30} />
                    </motion.button>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default FittyBuddy;
