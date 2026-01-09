import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { FaPaperPlane, FaSpinner, FaUser, FaSearch, FaArrowLeft, FaComment } from 'react-icons/fa';
import './Messages.css';

const Messages = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialPartnerId = queryParams.get('user');

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('access_token');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch conversations
    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await axios.get('/api/social/messages/conversations/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(response.data);

            // If redirected from a profile, find or start that conversation
            if (initialPartnerId) {
                const partnerIdNum = parseInt(initialPartnerId);
                const existing = response.data.find(c => c.user.id === partnerIdNum);
                if (existing) {
                    handleSelectPartner(existing.user);
                } else {
                    // Fetch user info to start new conversation
                    fetchUserInfo(partnerIdNum);
                }
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoadingConversations(false);
        }
    };

    const fetchUserInfo = async (userId) => {
        try {
            const response = await axios.get(`/api/social/profiles/${userId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedPartner(response.data);
            fetchMessages(userId);
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const fetchMessages = async (userId) => {
        setLoadingMessages(true);
        try {
            const response = await axios.get(`/api/social/messages/conversation/?user_id=${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data.results.reverse() || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSelectPartner = (partner) => {
        setSelectedPartner(partner);
        fetchMessages(partner.id);
        // Clear query param
        navigate('/messages', { replace: true });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPartner) return;

        setSending(true);
        try {
            const response = await axios.post('/api/social/messages/', {
                recipient_id: selectedPartner.id,
                text: newMessage.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages(prev => [...prev, response.data]);
            setNewMessage('');

            // Update conversations list (move selected to top or update preview)
            fetchConversations();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="messages-container">
            {/* Sidebar: Conversations List */}
            <div className={`conversations-sidebar ${selectedPartner ? 'hidden-mobile' : ''}`}>
                <div className="sidebar-header">
                    <h2>Messages</h2>
                    <div className="search-box">
                        <FaSearch />
                        <input type="text" placeholder="Search chats..." />
                    </div>
                </div>

                <div className="conversations-list">
                    {loadingConversations ? (
                        <div className="sidebar-loading"><FaSpinner className="spinner" /></div>
                    ) : conversations.length === 0 ? (
                        <div className="empty-sidebar">No conversations yet.</div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.user.id}
                                className={`conversation-item ${selectedPartner?.id === conv.user.id ? 'active' : ''}`}
                                onClick={() => handleSelectPartner(conv.user)}
                            >
                                <div className="partner-avatar">
                                    {conv.user.profile_picture ? (
                                        <img src={conv.user.profile_picture} alt={conv.user.username} />
                                    ) : (
                                        <div className="avatar-placeholder-xs">
                                            {conv.user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {conv.unread_count > 0 && <span className="unread-badge">{conv.unread_count}</span>}
                                </div>
                                <div className="conversation-info">
                                    <div className="info-top">
                                        <span className="partner-name">@{conv.user.username}</span>
                                        <span className="msg-time">
                                            {conv.last_message ? new Date(conv.last_message.created_at).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className="last-msg">{conv.last_message?.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`chat-area ${!selectedPartner ? 'hidden-mobile' : ''}`}>
                {selectedPartner ? (
                    <>
                        <header className="chat-header">
                            <button className="back-btn-mobile" onClick={() => setSelectedPartner(null)}>
                                <FaArrowLeft />
                            </button>
                            <div className="chat-partner-info" onClick={() => navigate(`/profile/${selectedPartner.username}`)}>
                                <div className="partner-avatar-small">
                                    {selectedPartner.profile_picture ? (
                                        <img src={selectedPartner.profile_picture} alt={selectedPartner.username} />
                                    ) : (
                                        <div className="avatar-placeholder-xs">
                                            {selectedPartner.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3>@{selectedPartner.username}</h3>
                                    <span className="online-status">Active now</span>
                                </div>
                            </div>
                        </header>

                        <div className="chat-messages">
                            {loadingMessages ? (
                                <div className="chat-loading"><FaSpinner className="spinner" /></div>
                            ) : messages.length === 0 ? (
                                <div className="empty-chat">
                                    <FaUser size={40} />
                                    <p>Start your conversation with @{selectedPartner.username}</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`message-bubble ${msg.sender.id === currentUser.id ? 'sent' : 'received'}`}
                                    >
                                        <div className="msg-content">
                                            <p>{msg.text}</p>
                                            <span className="msg-timestamp">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={sending}
                            />
                            <button type="submit" disabled={sending || !newMessage.trim()}>
                                {sending ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <FaComment size={60} />
                        <h3>Select a conversation to start chatting</h3>
                        <p>Stay connected with your fitness partners</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
