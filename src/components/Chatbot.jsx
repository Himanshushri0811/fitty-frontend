import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaBell,
  FaStar,
  FaLightbulb,
  FaCheckCircle,
  FaHeartbeat,
  FaUser,
  FaBolt,
  FaTrophy,
  FaRegSmile,
  FaFire,
  FaSeedling
} from 'react-icons/fa';
import API from './axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import fittyVoice from '../utils/fittyVoice';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Default muted
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userGoal, setUserGoal] = useState('general fitness');
  const [userName, setUserName] = useState('Fitness Buddy');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, loading]);

  // Initialize
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    if (token) {
      fetchUserProfile();
      // Auto open after 3 seconds if logged in
      setTimeout(() => {
        setIsOpen(true);
      }, 3000);
    }

    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Auto greeting
  useEffect(() => {
    if (isOpen && chatMessages.length === 0 && isLoggedIn) {
      setTimeout(() => {
        sendAutoGreeting();
      }, 500);
    }
  }, [isOpen, isLoggedIn]);

  // Voice transcript
  useEffect(() => {
    if (transcript) {
      setUserMessage(transcript);
    }
  }, [transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserProfile = async () => {
    try {
      const response = await API.get('/api/accounts/profile/');
      if (response.data) {
        setUserGoal(response.data.goal || 'general fitness');
        setUserName(response.data.username || 'Fitness Buddy');
      }
    } catch (error) {
      console.error('Error fetching profile in chatbot:', error);
    }
  };

  const sendAutoGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    const greetingMessage = {
      text: `👋 ${timeGreeting} ${userName}! I'm **Fitty**, your AI fitness trainer! 🏋️‍♂️\n\nI can help you with:\n✅ Workout plans\n✅ Nutrition guidance\n✅ Exercise techniques\n✅ Progress tracking\n\nAsk me anything like:\n• "Create a weekly workout plan"\n• "Best foods for ${userGoal}"\n• "How to do proper pushups"\n\nLet's crush your fitness goals together! 💪`,
      sender: 'bot',
      type: 'greeting',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([greetingMessage]);

    // Speak greeting if not muted
    if (!isMuted) {
      speakText(`Hello ${userName}! I'm Fitty, your fitness trainer. How can I help you today?`);
    }
  };

  // Stop all speech
  const stopAllSpeech = () => {
    fittyVoice.stop();
    setIsSpeaking(false);
  };

  // Handle mute/unmute
  const handleMuteToggle = () => {
    if (!isMuted) {
      stopAllSpeech();
    }
    setIsMuted(!isMuted);
  };

  // Handle close
  const handleClose = () => {
    fittyVoice.stop();
    setIsSpeaking(false);
    setIsOpen(false);
  };

  // Speak text
  const speakText = (text) => {
    if (!isMuted) {
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/[•\-]/g, '. ')
        .replace(/\n/g, '. ')
        .replace(/[🏋️‍♂️🥗💪🔥🍗]/g, '');

      fittyVoice.speak(cleanText);
      setIsSpeaking(true);

      // Since fittyVoice doesn't notify on end easily without callbacks, 
      // we'll just set a timeout based on text length for UI feedback
      const duration = (cleanText.length / 10) * 1000;
      setTimeout(() => setIsSpeaking(false), Math.min(duration, 5000));
    }
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const messageToSend = userMessage.trim();
    if (!messageToSend) return;
    if (!isLoggedIn) return;

    // Add user message
    const userMsg = {
      text: messageToSend,
      sender: 'user',
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserMessage('');
    resetTranscript();
    setLoading(true);

    try {
      const response = await API.post('/api/ai/chat/',
        {
          message: messageToSend,
          context: { page: location.pathname }
        }
      );

      const botMsg = {
        text: response.data.reply,
        sender: 'bot',
        type: detectMessageType(response.data.reply),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, botMsg]);

      // Speak first 2 lines if not muted
      if (!isMuted) {
        const lines = response.data.reply.split('\n').slice(0, 2).join('. ');
        speakText(lines);
      }
    } catch (error) {
      console.error('Chat error:', error);

      let errorMessage = "⚠️ Connection issue. Please try again.";

      // Check if backend returned an error message
      if (error.response?.data?.error) {
        errorMessage = `⚠️ ${error.response.data.error}`;
      } else if (error.response?.status === 500) {
        errorMessage = "⚠️ Server error. Please check if backend is running.";
      } else if (error.response?.status === 401) {
        errorMessage = "⚠️ Authentication failed. Please login again.";
      }

      setChatMessages(prev => [...prev, {
        text: errorMessage,
        sender: 'bot',
        type: 'error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Detect message type for special rendering
  const detectMessageType = (text) => {
    const upperText = text.toUpperCase();
    if (upperText.includes('DIET') || upperText.includes('MEAL') || upperText.includes('NUTRITION')) return 'food_info';
    if (upperText.includes('WORKOUT') || upperText.includes('EXERCISE') || upperText.includes('TRAINING')) return 'workout_plan';
    if (upperText.includes('GUIDE') || upperText.includes('TIPS') || upperText.includes('HOW TO')) return 'guide';
    if (upperText.includes('TECHNIQUE') || upperText.includes('FORM')) return 'technique';
    if (upperText.includes('READY FOR DOWNLOAD')) return 'workout_plan'; // Treat export-ready as a plan feature
    return 'text';
  };

  // Download plan as Text (Formatted)
  const downloadPlan = () => {
    const lastMessage = chatMessages[chatMessages.length - 1];
    if (lastMessage.type === 'workout_plan' || lastMessage.type === 'food_info' || lastMessage.type === 'guide') {
      const header = `FITTY PRO - YOUR AI FITNESS COACH\n` +
        `====================================\n` +
        `Date: ${new Date().toLocaleDateString()}\n` +
        `User: ${userName}\n` +
        `Goal: ${userGoal}\n\n`;

      const cleanContent = lastMessage.text.replace(/\*\*/g, '');
      const footer = `\n\n------------------------------------\n` +
        `Generated by Fitty AI Assistant\n` +
        `Fitty - Reach Your Peak`;

      const finalContent = header + cleanContent + footer;
      const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Fitty_Plan_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  // Quick actions
  const quickActions = [
    { icon: <FaCalendarAlt />, label: "Weekly Plan", query: "Create Monday to Saturday workout plan" },
    { icon: <FaAppleAlt />, label: "Diet Tips", query: "Best foods for weight loss" },
    { icon: <FaDumbbell />, label: "Exercises", query: "How to do proper pushups" },
    { icon: <FaChartLine />, label: "Progress", query: "How to track fitness progress" }
  ];

  // Render message
  const renderMessage = (msg, index) => {
    if (msg.sender === 'user') {
      return (
        <motion.div
          key={index}
          className="msg msg-user"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="msg-content">{msg.text}</div>
          <div className="msg-time">{msg.timestamp}</div>
        </motion.div>
      );
    }

    switch (msg.type) {
      case 'greeting':
        return renderGreeting(msg, index);
      case 'workout_plan':
        return renderWorkoutPlan(msg, index);
      case 'food_info':
        return renderFoodInfo(msg, index);
      case 'guide':
        return renderGuide(msg, index);
      case 'technique':
        return renderTechnique(msg, index);
      default:
        return renderTextMessage(msg, index);
    }
  };

  // Render greeting
  const renderGreeting = (msg, index) => (
    <motion.div
      key={index}
      className="professional-message greeting-message"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="greeting-header">
        <div className="greeting-icon">
          <FaRobot />
        </div>
        <div className="greeting-title">
          <h3>Hello {userName}! I'm <span className="highlight">Fitty</span> 👋</h3>
          <p>Your Personal AI Fitness Trainer</p>
        </div>
      </div>

      <div className="greeting-content">
        <div className="welcome-text">
          Ready to help you achieve your <span className="goal-highlight">{userGoal}</span> goals!
        </div>

        <div className="quick-actions-section">
          <div className="section-title">
            <FaBolt /> Quick Start
          </div>
          <div className="quick-actions-grid">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                className="quick-action-btn"
                onClick={() => {
                  setUserMessage(action.query);
                  setTimeout(() => handleSendMessage(), 100);
                }}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="start-prompt">
          <FaRegSmile /> Ask me anything like: "Workout plan" or "Diet tips"
        </div>
      </div>
    </motion.div>
  );

  // Render workout plan
  const renderWorkoutPlan = (msg, index) => (
    <motion.div
      key={index}
      className="professional-message workout-plan"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="plan-header">
        <div className="plan-title">
          <FaCalendarAlt /> Workout Plan
          <span className={`plan-badge ${userGoal.includes('loss') ? 'badge-weight-loss' : 'badge-muscle-gain'}`}>
            {userGoal}
          </span>
        </div>
      </div>

      <div className="plan-content">
        <div className="msg-content" style={{ whiteSpace: 'pre-line' }}>
          {msg.text}
        </div>

        <div className="plan-actions">
          <button className="action-btn primary-btn" onClick={downloadPlan}>
            <FaDownload /> Download Plan
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Render food info
  const renderFoodInfo = (msg, index) => (
    <motion.div
      key={index}
      className="professional-message food-info"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="plan-header">
        <div className="plan-title">
          <FaAppleAlt /> Nutrition Guide
          <span className="plan-badge badge-weight-loss">
            Healthy Eating
          </span>
        </div>
      </div>

      <div className="plan-content">
        <div className="msg-content" style={{ whiteSpace: 'pre-line' }}>
          {msg.text}
        </div>
      </div>
    </motion.div>
  );

  // Render guide
  const renderGuide = (msg, index) => (
    <motion.div
      key={index}
      className="professional-message guide-message"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="plan-header">
        <div className="plan-title">
          <FaChartLine /> Fitness Guide
          <span className="plan-badge badge-weight-loss">
            {userGoal}
          </span>
        </div>
      </div>

      <div className="plan-content">
        <div className="msg-content" style={{ whiteSpace: 'pre-line' }}>
          {msg.text}
        </div>
      </div>
    </motion.div>
  );

  // Render technique
  const renderTechnique = (msg, index) => (
    <motion.div
      key={index}
      className="professional-message technique-message"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="plan-header">
        <div className="plan-title">
          <FaDumbbell /> Exercise Technique
          <span className="plan-badge badge-muscle-gain">
            Form Guide
          </span>
        </div>
      </div>

      <div className="plan-content">
        <div className="msg-content" style={{ whiteSpace: 'pre-line' }}>
          {msg.text}
        </div>
      </div>
    </motion.div>
  );

  // Render text message
  const renderTextMessage = (msg, index) => (
    <motion.div
      key={index}
      className="msg msg-bot"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="msg-content" style={{ whiteSpace: 'pre-line' }}>
        {msg.text}
      </div>
      <div className="msg-time">
        {msg.timestamp}
        {isSpeaking && <span className="speaking-indicator"> 🔊 Speaking...</span>}
      </div>
    </motion.div>
  );

  // Voice input toggle
  const toggleMic = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({
        continuous: false,
        language: 'en-IN'
      });
    }
  };

  return (
    <div className="fitty-container">
      {/* Professional Trigger */}
      <motion.div
        className="fitty-trigger"
        onClick={() => {
          if (!isLoggedIn) {
            navigate('/auth?tab=login');
          } else {
            setIsOpen(!isOpen);
          }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="fitty-face">
          <div className="fitty-eyes">
            <div className="fitty-eye"></div>
            <div className="fitty-eye"></div>
          </div>
          <div className="fitty-mouth"></div>
        </div>
        {!isOpen && (
          <motion.div
            className="fitty-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {isLoggedIn ? <FaStar size={12} /> : <FaLock size={12} />}
          </motion.div>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fitty-window"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Header */}
            <div className="fitty-header">
              <div className="header-left">
                <div className="header-icon">
                  <FaRobot />
                </div>
                <div className="header-info">
                  <h3>Fitty Pro</h3>
                  <p className="header-subtitle">
                    AI Fitness Trainer • {userGoal}
                    {isSpeaking && <span className="live-indicator"> 🔊 Live</span>}
                  </p>
                </div>
              </div>
              <div className="header-actions">
                <button
                  className={`icon-btn ${isMuted ? 'muted' : ''}`}
                  onClick={handleMuteToggle}
                  title={isMuted ? "Unmute Voice" : "Mute Voice"}
                >
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <button className="icon-btn close-btn" onClick={handleClose} title="Close">
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="fitty-messages">
              {chatMessages.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💪</div>
                  <h4>Ready to Transform Your Fitness</h4>
                  <p>Ask me anything about workouts, nutrition, or fitness goals!</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => renderMessage(msg, index))
              )}

              {loading && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                  <span className="typing-text">Fitty is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fitty-input-area">
              {isLoggedIn ? (
                <>
                  <form className="fitty-form" onSubmit={handleSendMessage}>
                    <button
                      type="button"
                      className={`icon-btn mic-btn ${listening ? 'listening' : ''}`}
                      onClick={toggleMic}
                      title="Voice Input"
                    >
                      <FaMicrophone />
                    </button>
                    <input
                      type="text"
                      className="fitty-input"
                      placeholder={`Ask about ${userGoal}...`}
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                    />
                    <button type="submit" className="send-btn" disabled={loading}>
                      <FaPaperPlane />
                    </button>
                  </form>
                  <div className="input-hints">
                    <span className="hint">⚡ Powered by Gemini 1.5 Flash • Elite AI Coach</span>
                  </div>
                </>
              ) : (
                <div className="fitty-login-overlay">
                  <div className="login-icon">
                    <FaLock />
                  </div>
                  <h4>Login Required</h4>
                  <p>Log in to access personalized fitness guidance</p>
                  <button
                    className="login-btn"
                    onClick={() => navigate('/auth?tab=login')}
                  >
                    Login Now
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;