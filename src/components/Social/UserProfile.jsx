import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import {
    FaSpinner, FaUserPlus, FaUserMinus, FaComment,
    FaCalendar, FaFire
} from 'react-icons/fa';
import './UserProfile.css';
import PostCard from './PostCard';

const UserProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [following, setFollowing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const token = localStorage.getItem('access_token');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(
                `/api/social/profile/${username}/`,
                { headers }
            );
            setProfile(response.data);
            setFollowing(response.data.is_following || false);
            setError(null);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [username, token]);

    const fetchUserPosts = useCallback(async () => {
        try {
            setPostsLoading(true);
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(
                `/api/social/profile/${username}/posts/`,
                { headers }
            );
            setPosts(response.data.results || response.data || []);
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setPostsLoading(false);
        }
    }, [username, token]);

    useEffect(() => {
        fetchProfile();
        fetchUserPosts();
    }, [fetchProfile, fetchUserPosts]);

    const handleFollow = async () => {
        if (!profile) return;

        setActionLoading(true);
        try {
            const endpoint = following ? '/api/social/unfollow/' : '/api/social/follow/';
            await axios.post(
                endpoint,
                { user_id: profile.id },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setFollowing(!following);

            // Update follower count
            setProfile(prev => ({
                ...prev,
                followers_count: following
                    ? prev.followers_count - 1
                    : prev.followers_count + 1
            }));
        } catch (error) {
            console.error('Error following/unfollowing:', error);
            alert('Failed to update follow status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleMessage = () => {
        navigate(`/messages?user=${profile.id}`);
    };

    if (loading) {
        return (
            <div className="user-profile-container">
                <div className="profile-loading">
                    <FaSpinner className="spinner" />
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="user-profile-container">
                <div className="profile-error">
                    <h3>Profile not found</h3>
                    <p>{error || 'This user does not exist'}</p>
                    <button onClick={() => navigate('/explore')} className="back-btn">
                        Back to Explore
                    </button>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser.username === username;

    return (
        <div className="user-profile-container">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-cover"></div>

                <div className="profile-main">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar">
                            {profile.profile_picture_url ? (
                                <img src={profile.profile_picture_url} alt={profile.username} />
                            ) : (
                                <div className="avatar-placeholder-large">
                                    {profile.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {!isOwnProfile && (
                            <div className="profile-actions">
                                <button
                                    className={`follow-btn ${following ? 'following' : ''}`}
                                    onClick={handleFollow}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <FaSpinner className="spinner" />
                                    ) : following ? (
                                        <>
                                            <FaUserMinus /> Unfollow
                                        </>
                                    ) : (
                                        <>
                                            <FaUserPlus /> Follow
                                        </>
                                    )}
                                </button>

                                {following && (
                                    <button
                                        className="message-btn"
                                        onClick={handleMessage}
                                    >
                                        <FaComment /> Message
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="profile-info">
                        <div className="name-row-social">
                            <h1 className="profile-name">{profile.full_name || profile.username}</h1>
                            {profile.follows_you && <span className="follows-badge">Follows You</span>}
                        </div>
                        <p className="profile-username">@{profile.username}</p>

                        {profile.bio && (
                            <p className="profile-bio">{profile.bio}</p>
                        )}

                        {profile.fitness_goal && (
                            <div className="fitness-goal">
                                <FaFire /> Goal: {profile.fitness_goal}
                            </div>
                        )}

                        <div className="profile-meta">
                            <div className="meta-item">
                                <FaCalendar />
                                <span>Joined {new Date(profile.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="profile-stats">
                            <div className="stat-item">
                                <span className="stat-value">{profile.posts_count}</span>
                                <span className="stat-label">Posts</span>
                            </div>
                            <div className="stat-item clickable" onClick={() => navigate(`/profile/${username}/followers`)}>
                                <span className="stat-value">{profile.followers_count}</span>
                                <span className="stat-label">Followers</span>
                            </div>
                            <div className="stat-item clickable" onClick={() => navigate(`/profile/${username}/following`)}>
                                <span className="stat-value">{profile.following_count}</span>
                                <span className="stat-label">Following</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Tabs */}
            <div className="profile-tabs">
                <button
                    className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    <FaFire /> Posts
                </button>
                <button
                    className={`tab-btn ${activeTab === 'workouts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('workouts')}
                >
                    💪 Workouts
                </button>
                <button
                    className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('achievements')}
                >
                    🏆 Achievements
                </button>
            </div>

            {/* Profile Content */}
            <div className="profile-content">
                {activeTab === 'posts' && (
                    <div className="posts-grid">
                        {postsLoading ? (
                            <div className="content-loading">
                                <FaSpinner className="spinner" />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="empty-state">
                                <p>No posts yet</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
                                    onUpdate={(updated) => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
                                />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'workouts' && (
                    <div className="workouts-section">
                        <p className="coming-soon">Workout plans coming soon...</p>
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div className="achievements-section">
                        <p className="coming-soon">Achievements coming soon...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
