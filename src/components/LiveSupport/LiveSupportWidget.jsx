import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaPaperPlane, FaHeadset } from 'react-icons/fa';
import API from '../axiosConfig'; // Ensure this points to correct axios instance
import './LiveSupport.css';
import { v4 as uuidv4 } from 'uuid'; // Need to install uuid if not present, or simple random string

const LiveSupportWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [visitorId, setVisitorId] = useState('');

    // Polling setup
    const pollInterval = useRef(null);
    const messagesEndRef = useRef(null);

    // Initialize Visitor ID
    useEffect(() => {
        let storedId = localStorage.getItem('fitty_visitor_id');
        if (!storedId) {
            storedId = 'vis_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('fitty_visitor_id', storedId);
        }
        setVisitorId(storedId);
    }, []);

    // Poll for messages when open
    useEffect(() => {
        if (isOpen && visitorId) {
            fetchMessages();
            pollInterval.current = setInterval(fetchMessages, 3000);
        } else {
            if (pollInterval.current) clearInterval(pollInterval.current);
        }
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [isOpen, visitorId]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const fetchMessages = async () => {
        try {
            const res = await API.get(`/api/support/live/visitor/?visitor_id=${visitorId}`);
            if (res.data.messages) {
                // Determine if we need to update state to avoid unnecessary renders
                setMessages(res.data.messages);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text) return;

        // Optimistic update
        const newMsg = { sender: 'visitor', content: text, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');

        try {
            await API.post('/api/support/live/visitor/', {
                visitor_id: visitorId,
                message: text,
                visitor_name: 'Guest User' // Could get from AuthContext if logged in
            });
            // Fetch immediately to sync
            fetchMessages();
        } catch (err) {
            console.error("Failed to send", err);
        }
    };

    return (
        <div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="live-chat-window"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    >
                        <div className="chat-header">
                            <div className="agent-info">
                                <div className="agent-avatar"><FaHeadset /></div>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>Live Support</div>
                                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Chat with Team FitMitra</div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' }}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="chat-messages">
                            {messages.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
                                    <FaComments size={30} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                    <p>Hi! How can we help you today?</p>
                                </div>
                            )}
                            {messages.map((msg, i) => (
                                <div key={i} className={`chat-msg ${msg.sender}`}>
                                    {msg.content}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="input-area" onSubmit={handleSend}>
                            <input
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                            />
                            <button type="submit"><FaPaperPlane /></button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="fitty-trigger"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="fitty-face">
                    <div className="fitty-eyes">
                        <div className="fitty-eye"></div>
                        <div className="fitty-eye"></div>
                    </div>
                    <div className="fitty-mouth"></div>
                </div>
            </motion.div>
        </div>
    );
};

export default LiveSupportWidget;
