import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
    FaPaperPlane,
    FaMicrophone,
    FaTimes,
    FaVolumeUp,
    FaVolumeMute,
    FaRobot,
    FaLock,
    FaDownload,
    FaCalendarAlt,
    FaDumbbell,
    FaAppleAlt,
    FaChartLine,
    FaStar,
    FaBolt,
    FaRegSmile,
    FaQuestionCircle,
    FaRocket
} from 'react-icons/fa';
import './Chatbot.css';
import './ChatbotMarkdown.css';

// Custom Hooks & Services
import useVoiceChat from '../../../hooks/useVoiceChat';
import { chatbotService } from '../../../services/chatbotService';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userMessage, setUserMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfile, setUserProfile] = useState({ name: 'User', goal: 'general fitness' });

    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const {
        transcript,
        listening,
        resetTranscript,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        isMuted,
        toggleMute,
        isSpeaking
    } = useVoiceChat(true); // Default muted: true

    // Initial Auth Check and Profile Fetch
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setIsLoggedIn(true);
            fetchProfile();

            // Auto-open logic for engagement
            setTimeout(() => {
                // Only auto-open if it hasn't been closed manually in this session
                // (For simplicity, just open after delay once)
                if (!sessionStorage.getItem('fitty_closed')) {
                    setIsOpen(true);
                }
            }, 5000);
        }
    }, []);

    // Update input when voice transcript changes
    useEffect(() => {
        if (transcript) setUserMessage(transcript);
    }, [transcript]);

    // Scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages, loading]);

    // Auto Greeting on Open
    useEffect(() => {
        if (isOpen && chatMessages.length === 0 && isLoggedIn) {
            sendAutoGreeting();
        }
    }, [isOpen, isLoggedIn]);

    const fetchProfile = async () => {
        const profile = await chatbotService.getUserProfile();
        if (profile) {
            setUserProfile({
                name: profile.username || 'User',
                goal: profile.goal || 'general fitness'
            });
        }
    };

    const sendAutoGreeting = () => {
        const hour = new Date().getHours();
        const greetings = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

        const greetingMsg = {
            text: `👋 ${greetings} ${userProfile.name}! I'm Fitty, your personal FitMitra assistant.\n\nI see you're currently exploring the **${formatPageName(location.pathname)}** section. How can I assist you today?`,
            sender: 'bot',
            type: 'greeting',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatMessages([greetingMsg]);

        if (!isMuted) {
            speak(`Hello ${userProfile.name}! I'm Fitty. I see you're on the ${formatPageName(location.pathname)} page. How can I help you?`);
        }
    };

    const formatPageName = (path) => {
        if (path === '/') return 'Home';
        if (path.includes('dashboard')) return 'Dashboard';
        if (path.includes('workout')) return 'Workout Center';
        if (path.includes('diet')) return 'Nutrition Hub';
        if (path.includes('posture')) return 'Posture Correction';
        if (path.includes('gym')) return 'Gym Management';
        return 'FitMitra App';
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!userMessage.trim()) return;

        // 1. Add User Message
        const msgText = userMessage.trim();
        const newMsg = {
            text: msgText,
            sender: 'user',
            type: 'text',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatMessages(prev => [...prev, newMsg]);
        setUserMessage('');
        resetTranscript();

        // 2. Call API
        setLoading(true);
        try {
            const response = await chatbotService.sendMessage(msgText, { page: location.pathname });

            const botMsg = {
                text: response.reply,
                sender: 'bot',
                type: detectMessageType(response.reply),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setChatMessages(prev => [...prev, botMsg]);

            // 3. Voice Feedback
            if (!isMuted) {
                // Speak summarized version (first 2 sentences)
                const spokenText = botMsg.text.split(/[.!?]/).slice(0, 2).join('.') + '.';
                speak(spokenText);
            }

        } catch (error) {
            setChatMessages(prev => [...prev, {
                text: "⚠️ I'm having trouble connecting right now. Please try again.",
                sender: 'bot',
                type: 'error',
                timestamp: new Date().toLocaleTimeString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const detectMessageType = (text) => {
        const upper = text.toUpperCase();
        if (upper.includes('WORKOUT') || upper.includes('PLAN')) return 'workout_plan';
        if (upper.includes('DIET') || upper.includes('NUTRITION')) return 'food_info';
        return 'text';
    };

    // Helper: Download Logic (PDF)
    const downloadPlan = () => {
        const lastMsg = chatMessages[chatMessages.length - 1];
        if (!lastMsg) return;

        import('jspdf').then(jsPDFModule => {
            const jsPDF = jsPDFModule.default;
            const doc = new jsPDF();

            // Header
            doc.setFillColor(0, 255, 153); // FitMitra Green
            doc.rect(0, 0, 210, 20, 'F');
            doc.setTextColor(20, 20, 22);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("FitMitra AI Plan", 105, 13, { align: "center" });

            // Content
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");

            const splitText = doc.splitTextToSize(lastMsg.text.replace(/\*\*/g, ''), 180);
            doc.text(splitText, 15, 30);

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount} - Generated by FitMitra`, 105, 290, { align: "center" });
            }

            doc.save('FitMitra_Plan.pdf');
        });
    };

    // --- Render Helpers ---
    const renderMessage = (msg, i) => {
        const isBot = msg.sender === 'bot';

        if (msg.type === 'greeting') {
            return (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="professional-message greeting-message">
                    <div className="greeting-icon"><FaRobot /></div>
                    <h3>Hi {userProfile.name}!</h3>
                    <div className="markdown-content"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                    <div className="quick-actions-grid">
                        {quickActions.map((action, idx) => (
                            <button key={idx} className="quick-action-btn" onClick={() => {
                                setUserMessage(action.query);
                                // small delay to allow state update before send? 
                                // Actually better to just call send directly with arg, but reusing handleSendMessage requires state.
                                // We'll set state then manually trigger a "simulated event" or refactor handleSendMessage.
                                // For now, simpler:
                                chatbotService.sendMessage(action.query, { page: location.pathname }).then(res => {
                                    // Add user msg manually
                                    setChatMessages(prev => [...prev,
                                    { text: action.query, sender: 'user', type: 'text', timestamp: new Date().toLocaleTimeString() },
                                    { text: res.reply, sender: 'bot', type: detectMessageType(res.reply), timestamp: new Date().toLocaleTimeString() }
                                    ]);
                                    if (!isMuted) speak(res.reply.split('.')[0]);
                                });
                            }}>
                                <span className="action-icon">{action.icon}</span>
                                <span className="action-label">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            );
        }

        if (msg.type === 'workout_plan') {
            return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="professional-message workout-plan">
                    <div className="plan-header">
                        <div className="plan-title"><FaDumbbell /> Workout Plan</div>
                    </div>
                    <div className="markdown-content"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                    <button className="primary-btn" onClick={downloadPlan}><FaDownload /> Download</button>
                </motion.div>
            );
        }

        return (
            <motion.div
                key={i}
                className={`msg ${isBot ? 'msg-bot' : 'msg-user'}`}
                initial={{ opacity: 0, x: isBot ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <div className="markdown-content"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                <div className="msg-time">{msg.timestamp}</div>
            </motion.div>
        );
    };

    const quickActions = [
        { icon: <FaCalendarAlt />, label: "Workout Plan", query: "Can you create a weekly workout plan for my goal?" },
        { icon: <FaAppleAlt />, label: "Diet Advice", query: "Give me some healthy diet tips based on my goal." },
        { icon: <FaQuestionCircle />, label: "How to use?", query: "How do I use this app effectively?" },
        { icon: <FaRocket />, label: "Premium Features", query: "What are the benefits of upgrading to premium?" },
    ];

    return (
        <div className="fitty-container">
            {/* Trigger Button */}
            <motion.div
                className="fitty-trigger"
                onClick={() => {
                    if (isOpen) {
                        stopSpeaking();
                        setIsOpen(false);
                        sessionStorage.setItem('fitty_closed', 'true');
                    } else {
                        if (!isLoggedIn) { navigate('/auth?tab=login'); return; }
                        setIsOpen(true);
                    }
                }}
                whileHover={{ scale: 1.1 }}
            >
                <div className="fitty-face">
                    <div className="fitty-eyes">
                        <div className="fitty-eye"></div>
                        <div className="fitty-eye"></div>
                    </div>
                    <div className="fitty-mouth"></div>
                </div>
                {!isOpen && isLoggedIn && <div className="fitty-badge"><FaStar /></div>}
                {!isLoggedIn && <div className="fitty-badge"><FaLock /></div>}
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fitty-window"
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    >
                        {/* Header */}
                        <div className="fitty-header">
                            <div className="header-left">
                                <FaRobot size={24} color="#4ade80" />
                                <div>
                                    <h3>Fitty AI</h3>
                                    <p className="header-subtitle">
                                        {isSpeaking ? <span className="live-indicator">🔊 Speaking...</span> : 'Your Assistant'}
                                    </p>
                                </div>
                            </div>
                            <div className="header-actions">
                                <button className={`icon-btn ${isMuted ? 'muted' : ''}`} onClick={toggleMute}>
                                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                                </button>
                                <button className="icon-btn" onClick={() => {
                                    stopSpeaking();
                                    setIsOpen(false);
                                }}><FaTimes /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="fitty-messages">
                            {chatMessages.map((msg, i) => renderMessage(msg, i))}
                            {loading && (
                                <div className="typing-indicator">
                                    <div className="typing-dots">
                                        <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="fitty-input-area">
                            <form className="fitty-form" onSubmit={handleSendMessage}>
                                <button
                                    type="button"
                                    className={`mic-btn ${listening ? 'listening' : ''}`}
                                    onClick={listening ? stopListening : startListening}
                                >
                                    <FaMicrophone />
                                </button>
                                <input
                                    className="fitty-input"
                                    value={userMessage}
                                    onChange={e => setUserMessage(e.target.value)}
                                    placeholder="Ask me anything..."
                                />
                                <button type="submit" className="send-btn" disabled={loading}>
                                    <FaPaperPlane />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chatbot;
