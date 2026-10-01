import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { FaSpinner, FaUser, FaComment, FaArrowLeft } from 'react-icons/fa';
import './FollowList.css';

const FollowList = ({ type }) => { // type can be 'followers' or 'following'
    const { username } = useParams();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('access_token');

    useEffect(() => {
        fetchUsers();
    }, [username, type]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const endpoint = `/api/social/profiles/${username}/${type}/`;
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Extract user objects from follow relationships
            const userList = response.data.results.map(item =>
                type === 'followers' ? item.follower : item.following
            );
            setUsers(userList);
        } catch (err) {
            console.error(`Error fetching ${type}:`, err);
            setError(`Failed to load ${type}`);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (userUsername) => {
        navigate(`/profile/${userUsername}`);
    };

    const handleChat = (userId) => {
        navigate(`/messages?user=${userId}`);
    };

    if (loading) {
        return (
            <div className="follow-list-container">
                <div className="list-loading">
                    <FaSpinner className="spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="follow-list-container">
            <header className="list-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                </button>
                <h2>{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
            </header>

            {error ? (
                <div className="list-error">{error}</div>
            ) : users.length === 0 ? (
                <div className="empty-list">
                    <p>No {type} yet.</p>
                </div>
            ) : (
                <div className="user-list">
                    {users.map(user => (
                        <div key={user.id} className="user-item-card">
                            <div className="user-item-info" onClick={() => handleViewProfile(user.username)}>
                                <div className="user-item-avatar">
                                    {user.profile_picture ? (
                                        <img src={user.profile_picture} alt={user.username} />
                                    ) : (
                                        <div className="avatar-placeholder-small">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="user-item-details">
                                    <h4>@{user.username}</h4>
                                    <p>{user.full_name || 'Fitty User'}</p>
                                </div>
                            </div>
                            <div className="user-item-actions">
                                <button
                                    className="action-btn view-btn"
                                    onClick={() => handleViewProfile(user.username)}
                                    title="View Profile"
                                >
                                    <FaUser />
                                </button>
                                <button
                                    className="action-btn chat-btn"
                                    onClick={() => handleChat(user.id)}
                                    title="Send Message"
                                >
                                    <FaComment />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FollowList;
