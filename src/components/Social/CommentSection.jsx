import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { FaSpinner, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './CommentSection.css';

const CommentSection = ({ postId, onCommentAdded }) => {
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState(null);

    const token = localStorage.getItem('access_token');

    // Fetch comments
    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(
                `/api/social/posts/${postId}/comments/`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setComments(response.data.results || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    // Submit comment
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!commentText.trim()) return;

        setSubmitting(true);

        try {
            const response = await axios.post(
                `/api/social/posts/${postId}/comment/`,
                {
                    text: commentText.trim(),
                    parent: replyTo
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Add new comment to list
            if (replyTo) {
                // If it's a reply, refresh comments to show nested structure
                fetchComments();
            } else {
                setComments(prev => [response.data, ...prev]);
            }

            setCommentText('');
            setReplyTo(null);

            if (onCommentAdded) {
                onCommentAdded();
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    // Format time ago
    const timeAgo = (dateString) => {
        const now = new Date();
        const commentDate = new Date(dateString);
        const seconds = Math.floor((now - commentDate) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

        return commentDate.toLocaleDateString();
    };

    // Navigate to profile
    const goToProfile = (username) => {
        navigate(`/profile/${username}`);
    };

    if (loading) {
        return (
            <div className="comments-section">
                <div className="comments-loading">
                    <FaSpinner className="spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="comments-section">
            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="comment-form">
                {replyTo && (
                    <div className="reply-indicator">
                        Replying to comment
                        <button
                            type="button"
                            onClick={() => setReplyTo(null)}
                            className="cancel-reply"
                        >
                            Cancel
                        </button>
                    </div>
                )}
                <div className="comment-input-wrapper">
                    <input
                        type="text"
                        className="comment-input"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        maxLength={1000}
                        disabled={submitting}
                    />
                    <button
                        type="submit"
                        className="comment-submit-btn"
                        disabled={submitting || !commentText.trim()}
                    >
                        {submitting ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="comments-list">
                {comments.length === 0 ? (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                            <div
                                className="comment-avatar"
                                onClick={() => goToProfile(comment.author.username)}
                            >
                                {comment.author.profile_picture ? (
                                    <img src={comment.author.profile_picture} alt={comment.author.username} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {comment.author.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="comment-content">
                                <div className="comment-header">
                                    <span
                                        className="comment-author"
                                        onClick={() => goToProfile(comment.author.username)}
                                    >
                                        @{comment.author.username}
                                    </span>
                                    <span className="comment-time">{timeAgo(comment.created_at)}</span>
                                </div>
                                <p className="comment-text">{comment.text}</p>

                                <div className="comment-actions">
                                    <button
                                        className="reply-btn"
                                        onClick={() => setReplyTo(comment.id)}
                                    >
                                        Reply
                                    </button>
                                </div>

                                {/* Nested Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="comment-replies">
                                        {comment.replies.map(reply => (
                                            <div key={reply.id} className="reply-item">
                                                <div
                                                    className="comment-avatar small"
                                                    onClick={() => goToProfile(reply.author.username)}
                                                >
                                                    {reply.author.profile_picture ? (
                                                        <img src={reply.author.profile_picture} alt={reply.author.username} />
                                                    ) : (
                                                        <div className="avatar-placeholder">
                                                            {reply.author.username.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="comment-content">
                                                    <div className="comment-header">
                                                        <span
                                                            className="comment-author"
                                                            onClick={() => goToProfile(reply.author.username)}
                                                        >
                                                            @{reply.author.username}
                                                        </span>
                                                        <span className="comment-time">{timeAgo(reply.created_at)}</span>
                                                    </div>
                                                    <p className="comment-text">{reply.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
