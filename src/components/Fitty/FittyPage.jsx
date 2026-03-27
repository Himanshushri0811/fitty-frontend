import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Send, Mic, Square, Sparkles, Plus, CircleUser,
    Trash2, Loader2, Menu, X, ArrowLeft
} from 'lucide-react';

import './Fitty.css';
import { chatbotService } from '../../services/chatbotService';
import useVoiceChat from '../../hooks/useVoiceChat';
import FittyVoiceAssistant from './FittyVoiceAssistant';
import { useTheme } from '../../context/ThemeContext';

const FittyPage = () => {
    const { isDarkMode } = useTheme();
    const [sessionId, setSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [inputMode, setInputMode] = useState('CHAT');
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const {
        transcript,
        listening,
        startListening,
        stopListening,
        resetTranscript,
        browserSupportsSpeechRecognition: isSupported
    } = useVoiceChat();

    useEffect(() => {
        loadHistory();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        if (transcript) {
            setInputValue(transcript);
            if (!listening && transcript.trim().length > 0) {
                setInputMode('VOICE');
            }
        }
    }, [transcript, listening]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [inputValue]);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const data = await chatbotService.getHistory();
            if (data.history) setMessages(data.history);
            if (data.session_id) setSessionId(data.session_id);
            loadSessionList();
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSessionList = async () => {
        const list = await chatbotService.getSessionsList();
        setSessions(list || []);
    };

    const handleLoadSession = async (id) => {
        if (id === sessionId) return;
        setIsLoading(true);
        setSessionId(id);
        setMessages([]);
        try {
            const data = await chatbotService.getHistory(id);
            setMessages(data.history || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSession = async (id) => {
        if (!window.confirm("Delete this conversation?")) return;
        try {
            await chatbotService.deleteSession(id).catch(() => { });
            setSessions(prev => prev.filter(s => s.id !== id));
            if (sessionId === id) handleNewChat();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleNewChat = () => {
        setSessionId(null);
        setMessages([]);
        loadSessionList();
        if (window.innerWidth <= 768) setSidebarOpen(false);
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (isLoading) return;

        const text = inputValue.trim();
        if (!text) return;

        const currentMode = inputMode;
        const tempMsg = {
            role: 'user',
            content: text,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempMsg]);
        setInputValue('');
        resetTranscript();
        setInputMode('CHAT');

        if (textareaRef.current) {
            textareaRef.current.style.height = '24px';
            if (window.innerWidth <= 768) textareaRef.current.blur();
        }

        setIsLoading(true);
        setErrorMsg(null);

        const activeSessionId = sessionId || `session_${Date.now()}`;
        if (!sessionId) setSessionId(activeSessionId);

        try {
            const data = await chatbotService.sendAgentMessage(text, currentMode, activeSessionId);
            const botMsg = {
                role: 'model',
                content: data.response,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            setErrorMsg("Failed to reach Fitty. Please try again.");
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
        <div className={`fitty-page-container ${!isDarkMode ? 'light-theme' : ''}`}>
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <div className={`fitty-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="fitty-logo">
                    <div className="fitty-logo-icon">
                        <Sparkles size={16} />
                    </div>
                    <span>Fitty AI</span>
                    <button className="fitty-action-btn mobile-only" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <button className="new-chat-btn" onClick={handleNewChat}>
                    <Plus size={18} /> New Chat
                </button>

                <div className="session-list">
                    {sessions.map(s => (
                        <div
                            key={s.id}
                            className={`session-item ${sessionId === s.id ? 'active' : ''}`}
                            onClick={() => handleLoadSession(s.id)}
                        >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                            <button
                                className="fitty-action-btn delete-icon"
                                style={{ width: '24px', height: '24px' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSession(s.id);
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="fitty-main">
                <header className="fitty-chat-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button className="fitty-action-btn mobile-only" onClick={() => setSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <button className="fitty-action-btn" onClick={() => window.location.href = '/dashboard'} title="Back to Dashboard">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="status-indicator">
                            <span className="status-dot"></span>
                            {isLoading ? 'Thinking...' : 'Online'}
                        </div>
                    </div>
                </header>

                <div className="fitty-messages-area">
                    {messages.length === 0 && !isLoading && (
                        <motion.div className="fitty-empty-state" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="fitty-logo-icon" style={{ margin: '0 auto 24px auto', width: '56px', height: '56px', fontSize: '1.5rem' }}>
                                <Sparkles size={28} />
                            </div>
                            <h2>How can I assist you today?</h2>
                            <p>Ask about workout routines, nutrition planning, or analysis.</p>
                        </motion.div>
                    )}

                    {messages.map((msg, index) => {
                        const isUser = msg.role === 'user';
                        return (
                            <motion.div
                                key={index}
                                className={`message-wrapper ${isUser ? 'user' : 'bot'}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            >
                                {!isUser && (
                                    <div className="fitty-avatar">
                                        <Sparkles size={16} />
                                    </div>
                                )}

                                <div className="message-bubble">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>

                                {isUser && (
                                    <div className="fitty-avatar user-avatar">
                                        <CircleUser size={18} />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}

                    {isLoading && (
                        <div className="message-wrapper bot">
                            <div className="fitty-avatar" style={{ background: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                                <Sparkles size={16} />
                            </div>
                            <div className="message-bubble" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
                                <Loader2 size={16} className="spin-animation" style={{ color: 'var(--text-secondary)' }} />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Processing</span>
                            </div>
                        </div>
                    )}

                    {errorMsg && (
                        <div style={{ color: 'var(--danger)', textAlign: 'center', fontSize: '0.875rem', marginTop: '16px' }}>
                            {errorMsg}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="fitty-input-container">
                    <div className="fitty-input-box">
                        <button
                            type="button"
                            className="mini-siri-trigger"
                            onClick={() => setIsAssistantOpen(true)}
                            title="Open Voice Coach"
                        >
                            <div className="mini-siri-core"></div>
                            <div className="mini-siri-ring ring-1"></div>
                            <div className="mini-siri-ring ring-2"></div>
                        </button>

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
                                className={`fitty-action-btn ${listening ? 'mic-active' : ''}`}
                                onClick={() => {
                                    if (listening) {
                                        stopListening();
                                    } else {
                                        setInputMode('VOICE');
                                        startListening();
                                    }
                                }}
                                title="Use Voice"
                            >
                                {listening ? <Square size={16} fill="currentColor" /> : <Mic size={18} />}
                            </button>
                        )}

                        <button
                            className="fitty-action-btn send-btn"
                            onClick={handleSend}
                            disabled={isLoading || !inputValue.trim()}
                        >
                            {isLoading ? <Loader2 size={16} className="spin-animation" /> : <Send size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            <FittyVoiceAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
        </div>
    );
};

export default FittyPage;
