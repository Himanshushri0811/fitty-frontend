import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    FaPaperPlane, FaMicrophone, FaStop, FaRobot, FaPlus, FaCircle, FaUser, FaTrash, FaSpinner,
    FaBars, FaTimes, FaSun, FaMoon, FaArrowLeft
} from 'react-icons/fa';

import './Fitty.css';
import { chatbotService } from '../../services/chatbotService';
import useVoiceChat from '../../hooks/useVoiceChat';

import { useTheme } from '../../context/ThemeContext'; // Import Theme Context

const FittyPage = () => {
    const { isDarkMode } = useTheme(); // Use global theme
    const [sessionId, setSessionId] = useState(null);
    const [sessions, setSessions] = useState([]); // Sidebar sessions state
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false); // Typing animation state
    const [errorMsg, setErrorMsg] = useState(null);

    // UI States
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // const [theme, setTheme] = useState('dark'); // Removed local theme

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const chatContainerRef = useRef(null);
    const shouldAutoScrollRef = useRef(true);

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

    // Smart Scroll Controller
    const scrollToBottom = React.useCallback(() => {
        if (shouldAutoScrollRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const handleTypewriterComplete = React.useCallback(() => {
        setIsTyping(false);
    }, []);

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
            shouldAutoScrollRef.current = isNearBottom;
        }
    };

    // Scroll to bottom on new message if allowed
    useEffect(() => {
        // When new message arrives, if we were at bottom, stay at bottom.
        // If we sent it, we force it in handleSend.
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);

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
            // Load latest/current session
            const data = await chatbotService.getHistory();
            if (data.history) {
                // Map backend roles to frontend structure if needed
                setMessages(data.history);
            }
            if (data.session_id) {
                setSessionId(data.session_id);
            }
            // Load session list for sidebar
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
        setMessages([]); // Clear current msgs while loading
        try {
            const data = await chatbotService.getHistory(id); // Fetch specific session
            setMessages(data.history || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSession = async (id) => {
        if (!window.confirm("Are you sure you want to delete this chat?")) return;

        try {
            // Assume service has delete method or we implement it
            // For now, filtering locally as fallback if API missing
            await chatbotService.deleteSession(id).catch(() => { });

            setSessions(prev => prev.filter(s => s.id !== id));
            if (sessionId === id) {
                handleNewChat();
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleNewChat = () => {
        setSessionId(null);
        setMessages([]);
        setIsTyping(false); // Reset typing state
        loadSessionList();
        if (window.innerWidth <= 768) setSidebarOpen(false); // Close sidebar on mobile
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();

        if (isLoading || isTyping) return; // Block validation if busy

        const text = inputValue.trim();
        if (!text) return;

        // Force scroll to bottom when user sends
        shouldAutoScrollRef.current = true;

        // Optimistic UI Update
        const tempMsg = {
            role: 'user',
            content: text,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);
        setInputValue('');
        resetTranscript();

        // Reset textarea height and blur (hide keyboard on mobile)
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px';

            // Only blur on mobile devices to keep keyboard flow on desktop
            if (window.innerWidth <= 768) {
                textareaRef.current.blur();
            }
        }

        setIsLoading(true);
        setErrorMsg(null);

        try {
            const data = await chatbotService.sendMessage(text, sessionId);

            // Allow backend to set session ID if it was new
            if (data.session_id && !sessionId) {
                setSessionId(data.session_id);
                loadSessionList(); // Refresh sidebar to show new chat title
            }

            // Add Bot Response with Animation Flag
            const botMsg = {
                role: 'model',
                content: data.reply,
                timestamp: new Date().toISOString(),
                animate: true // Flag to trigger typing effect
            };
            setIsTyping(true); // Start blocking for animation
            setMessages(prev => [...prev, botMsg]);

        } catch (err) {
            console.error(err);
            setErrorMsg("Failed to reach Fitty. Please try again.");
            // Remove optimistic message? Or just show error.
            setIsTyping(false);
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
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar (Simple Version) */}
            <div className={`fitty-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="fitty-logo" style={{ justifyContent: 'space-between' }}>
                    <span><FaRobot /> Fitty AI</span>
                    <button
                        className="fitty-action-btn mobile-only"
                        onClick={() => setSidebarOpen(false)}
                        style={{ fontSize: '1rem' }}
                    >
                        <FaTimes />
                    </button>
                </div>
                <button className="new-chat-btn" onClick={handleNewChat}>
                    <FaPlus /> New Chat
                </button>

                <div className="session-list" style={{ marginTop: '20px', overflowY: 'auto', flex: 1 }}>
                    {sessions.map(s => (
                        <div
                            key={s.id}
                            onClick={() => handleLoadSession(s.id)}
                            style={{
                                padding: '10px',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                marginBottom: '5px',
                                background: sessionId === s.id ? 'rgba(0, 255, 157, 0.1)' : 'transparent',
                                color: sessionId === s.id ? 'var(--fitty-accent)' : '#8b949e',
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                transition: 'all 0.2s',
                                border: sessionId === s.id ? '1px solid rgba(0, 255, 157, 0.2)' : '1px solid transparent',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                            onMouseEnter={(e) => {
                                if (sessionId !== s.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                if (sessionId !== s.id) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <span>{s.title}</span>
                            {/* Delete Button */}
                            <FaTrash
                                size={12}
                                className="delete-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSession(s.id);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="fitty-main">
                {/* Header */}
                <header className="fitty-chat-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Mobile Hamburger */}
                        <button
                            className="fitty-action-btn mobile-only"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <FaBars />
                        </button>

                        <button
                            className="fitty-action-btn"
                            onClick={() => window.location.href = '/dashboard'}
                            title="Back to Dashboard"
                        >
                            <FaArrowLeft />
                        </button>

                        <div className="status-indicator">
                            <span className="status-dot"></span>
                            {isLoading ? 'Fitty is typing...' : 'Fitty is Online'}
                        </div>
                    </div>

                </header>

                {/* Messages */}
                <div
                    className="fitty-messages-area"
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                >
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
                                    {/* Use Typewriter if it's a new bot message, otherwise static Markdown */}
                                    {!isUser && msg.animate ? (
                                        <TypewriterMarkdown
                                            content={msg.content}
                                            onScroll={scrollToBottom}
                                            onComplete={handleTypewriterComplete}
                                        />
                                    ) : (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    )}

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

                    {/* Scroll Anchor */}
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
                            disabled={isLoading || isTyping || !inputValue.trim()}
                        >
                            {isLoading || isTyping ? (
                                <FaSpinner className="spin-animation" />
                            ) : (
                                <FaPaperPlane />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Component: Typewriter Effect for Markdown ---
const TypewriterMarkdown = ({ content, onScroll, onComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const indexRef = useRef(0);

    useEffect(() => {
        indexRef.current = 0;
        setDisplayedText("");

        const intervalId = setInterval(() => {
            if (indexRef.current < content.length) {
                // Add next character
                setDisplayedText((prev) => prev + content.charAt(indexRef.current));
                indexRef.current += 1;

                // Scroll frequently to keep it smooth
                if (indexRef.current % 3 === 0 && onScroll) {
                    onScroll();
                }
            } else {
                clearInterval(intervalId);
                if (onScroll) onScroll();
                if (onComplete) onComplete();
            }
        }, 10); // Fast character typing (10ms)

        return () => clearInterval(intervalId);
    }, [content, onScroll, onComplete]);

    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayedText}
        </ReactMarkdown>
    );
};

export default FittyPage;
