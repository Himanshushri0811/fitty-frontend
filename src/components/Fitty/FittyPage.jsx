import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    FaPaperPlane, FaMicrophone, FaStop, FaRobot, FaPlus, FaCircle, FaUser
} from 'react-icons/fa';

import './Fitty.css';
import { chatbotService } from '../../services/chatbotService';
import useVoiceChat from '../../hooks/useVoiceChat';

const FittyPage = () => {
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Voice Hook
    const {
        transcript,
        listening,
        startListening,
        stopListening,
        resetTranscript,
        browserSupportsSpeechRecognition: isSupported
    } = useVoiceChat();

    // Load History on Mount
    useEffect(() => {
        loadHistory();
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Update input from Voice Transcript
    useEffect(() => {
        if (transcript) {
            setInputValue(transcript);
        }
    }, [transcript]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [inputValue]);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const data = await chatbotService.getHistory();
            if (data.history) {
                // Map backend roles to frontend structure if needed
                setMessages(data.history);
            }
            if (data.session_id) {
                setSessionId(data.session_id);
            }
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();

        const text = inputValue.trim();
        if (!text) return;

        // Optimistic UI Update
        const tempMsg = {
            role: 'user',
            content: text,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);
        setInputValue('');
        resetTranscript();

        // Reset textarea height
        if (textareaRef.current) textareaRef.current.style.height = '24px';

        setIsLoading(true);
        setErrorMsg(null);

        try {
            const data = await chatbotService.sendMessage(text, sessionId);

            // Allow backend to set session ID if it was new
            if (data.session_id && !sessionId) {
                setSessionId(data.session_id);
            }

            // Add Bot Response
            const botMsg = {
                role: 'model',
                content: data.reply,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (err) {
            console.error(err);
            setErrorMsg("Failed to reach Fitty. Please try again.");
            // Remove optimistic message? Or just show error.
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fitty-page-container">
            {/* Sidebar (Simple Version) */}
            <div className="fitty-sidebar">
                <div className="fitty-logo">
                    <FaRobot /> Fitty AI
                </div>
                <button className="new-chat-btn" onClick={() => { setMessages([]); setSessionId(null); }}>
                    <FaPlus /> New Chat
                </button>
            </div>

            {/* Main Area */}
            <div className="fitty-main">
                {/* Header */}
                <header className="fitty-chat-header">
                    <div className="status-indicator">
                        <span className="status-dot"></span>
                        {isLoading ? 'Fitty is typing...' : 'Fitty is Online'}
                    </div>
                </header>

                {/* Messages */}
                <div className="fitty-messages-area">
                    {messages.length === 0 && !isLoading && (
                        <div style={{ textAlign: 'center', color: '#8b949e', marginTop: '4rem' }}>
                            <h2>Hello! I'm Fitty.</h2>
                            <p>I can help you with workouts, diet plans, and gym management stats.</p>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        const isUser = msg.role === 'user';
                        return (
                            <motion.div
                                key={index}
                                className={`message-wrapper ${isUser ? 'user' : 'bot'}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {!isUser && (
                                    <div className="fitty-avatar">F</div>
                                )}

                                <div className="message-bubble">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                    <div className="message-timestamp">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {isUser && (
                                    <div className="fitty-avatar" style={{ background: '#555' }}><FaUser size={14} /></div>
                                )}
                            </motion.div>
                        );
                    })}

                    {isLoading && (
                        <div className="message-wrapper bot">
                            <div className="fitty-avatar">F</div>
                            <div className="message-bubble" style={{ minWidth: '50px', display: 'flex', alignItems: 'center' }}>
                                <motion.span
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    ...
                                </motion.span>
                            </div>
                        </div>
                    )}

                    {errorMsg && (
                        <div style={{ color: '#ff4d4d', textAlign: 'center', fontSize: '0.9rem' }}>{errorMsg}</div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="fitty-input-container">
                    <div className="fitty-input-box">
                        <textarea
                            ref={textareaRef}
                            className="fitty-textarea"
                            placeholder="Ask Fitty anything..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        {isSupported && (
                            <button
                                className={`fitty-action-btn ${listening ? 'active-mic' : ''}`}
                                onClick={listening ? stopListening : startListening}
                                title="Voice Input"
                            >
                                {listening ? <FaStop /> : <FaMicrophone />}
                            </button>
                        )}

                        <button
                            className="fitty-action-btn send-btn"
                            onClick={handleSend}
                            disabled={isLoading || !inputValue.trim()}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FittyPage;
