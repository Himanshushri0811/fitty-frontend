import React, { useState } from 'react';
import axios from '../axiosConfig';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisV, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './PostCard.css';
import CommentSection from './CommentSection';

const PostCard = ({ post, onDelete, onUpdate }) => {
    const navigate = useNavigate();
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [localPost, setLocalPost] = useState(post);

    const token = localStorage.getItem('access_token');

    // Handle like/unlike
    const handleLike = async () => {
        if (isLiking) return;

        setIsLiking(true);
        const endpoint = localPost.is_liked ? 'unlike' : 'like';

        try {
            await axios.post(
                `/api/social/posts/${localPost.id}/${endpoint}/`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Optimistic update
            const updatedPost = {
                ...localPost,
                is_liked: !localPost.is_liked,
                likes_count: localPost.is_liked
                    ? localPost.likes_count - 1
                    : localPost.likes_count + 1
            };

            setLocalPost(updatedPost);
            if (onUpdate) onUpdate(updatedPost);
        } catch (error) {
            console.error('Error liking post:', error);
        } finally {
            setIsLiking(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await axios.delete(`/api/social/posts/${localPost.id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (onDelete) onDelete(localPost.id);
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
        }
    };

    // Handle share
    const handleShare = () => {
        const url = `${window.location.origin}/post/${localPost.id}`;

        if (navigator.share) {
            const authorName = localPost.author?.username || 'unknown';
            navigator.share({
                title: `Post by @${authorName}`,
                text: localPost.caption,
                url: url
            }).catch(err => console.log('Error sharing:', err));
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    // Navigate to profile
    const goToProfile = () => {
        if (localPost.author?.username) {
            navigate(`/profile/${localPost.author.username}`);
        }
    };

    // Format time ago
    const timeAgo = (dateString) => {
        if (!dateString) return 'Just now';
        const now = new Date();
        const postDate = new Date(dateString);
        const seconds = Math.floor((now - postDate) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return postDate.toLocaleDateString();
    };

    const author = localPost.author || {};
    const username = author.username || 'unknown';
    const [localFollowing, setLocalFollowing] = useState(author.is_following || false);
    const [followingLoading, setFollowingLoading] = useState(false);

    const handleFollow = async (e) => {
        e.stopPropagation();
        if (followingLoading) return;

        setFollowingLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const endpoint = localFollowing ? '/api/social/unfollow/' : '/api/social/follow/';
            await axios.post(
                endpoint,
                { user_id: author.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLocalFollowing(!localFollowing);
        } catch (err) {
            console.error('Error updating follow:', err);
        } finally {
            setFollowingLoading(false);
        }
    };

    return (
        <div className="post-card">
            {/* Post Header */}
            <div className="post-header">
                <div className="post-author" onClick={goToProfile}>
                    <div className="author-avatar">
                        {author.profile_picture ? (
                            <img src={author.profile_picture} alt={username} />
                        ) : (
                            <div className="avatar-placeholder">
                                {username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="author-info">
                        <div className="author-name-row">
                            <h4>@{username}</h4>
                            {!localPost.can_delete && (
                                <button
                                    className={`post-follow-btn ${localFollowing ? 'following' : ''}`}
                                    onClick={handleFollow}
                                    disabled={followingLoading}
                                >
                                    {localFollowing ? 'Following' : '+ Follow'}
                                </button>
                            )}
                        </div>
                        <span className="post-time">{timeAgo(localPost.created_at)}</span>
                    </div>
                </div>

                {localPost.can_delete && (
                    <div className="post-menu">
                        <button
                            className="menu-btn"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <FaEllipsisV />
                        </button>
                        {showMenu && (
                            <div className="menu-dropdown">
                                <button onClick={handleDelete} className="delete-btn">
                                    <FaTrash /> Delete Post
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content */}
            <div className="post-content">
                <p className="post-caption">{localPost.caption}</p>

                {localPost.image_url && (
                    <div className="post-image">
                        <img src={localPost.image_url} alt="Post content" />
                    </div>
                )}

                {localPost.post_type && localPost.post_type !== 'text' && (
                    <div className="post-type-badge">
                        {localPost.post_type === 'workout' && '💪 Workout'}
                        {localPost.post_type === 'achievement' && '🏆 Achievement'}
                        {localPost.post_type === 'tip' && '💡 Fitness Tip'}
                    </div>
                )}
            </div>

            {/* Post Actions */}
            <div className="post-actions">
                <button
                    className={`action-btn ${localPost.is_liked ? 'liked' : ''}`}
                    onClick={handleLike}
                    disabled={isLiking}
                >
                    {localPost.is_liked ? <FaHeart /> : <FaRegHeart />}
                    <span>{localPost.likes_count}</span>
                </button>

                <button
                    className="action-btn"
                    onClick={() => setShowComments(!showComments)}
                >
                    <FaComment />
                    <span>{localPost.comments_count}</span>
                </button>

                <button
                    className="action-btn"
                    onClick={handleShare}
                >
                    <FaShare />
                    <span>Share</span>
                </button>
            </div>

            {/* Recent Comments Preview */}
            {localPost.recent_comments && localPost.recent_comments.length > 0 && !showComments && (
                <div className="comments-preview">
                    {localPost.recent_comments.map(comment => (
                        <div key={comment.id} className="comment-preview">
                            <strong>@{comment.author?.username || 'unknown'}</strong>
                            <span>{comment.text}</span>
                        </div>
                    ))}
                    {localPost.comments_count > 2 && (
                        <button
                            className="view-all-comments"
                            onClick={() => setShowComments(true)}
                        >
                            View all {localPost.comments_count} comments
                        </button>
                    )}
                </div>
            )}

            {/* Comments Section */}
            {showComments && (
                <CommentSection
                    postId={localPost.id}
                    onCommentAdded={() => {
                        const updated = {
                            ...localPost,
                            comments_count: localPost.comments_count + 1
                        };
                        setLocalPost(updated);
                        if (onUpdate) onUpdate(updated);
                    }}
                />
            )}
        </div>
    );
};

export default PostCard;
