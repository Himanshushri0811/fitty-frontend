import React, { useState, useEffect, useCallback } from 'react';
import axios from '../axiosConfig';
import './SocialFeed.css';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const SocialFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Fetch feed posts
    const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const token = localStorage.getItem('access_token');
            const response = await axios.get(`/api/social/feed/?page=${pageNum}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const newPosts = response.data.results || [];

            if (append) {
                setPosts(prev => [...prev, ...newPosts]);
            } else {
                setPosts(newPosts);
            }

            setHasMore(!!response.data.next);
            setError(null);
        } catch (err) {
            console.error('Error fetching feed:', err);
            setError('Failed to load feed. Please try again.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts(1, false);
    }, [fetchPosts]);

    // Infinite scroll handler
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop
                >= document.documentElement.offsetHeight - 500
                && hasMore && !loadingMore
            ) {
                setPage(prev => prev + 1);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loadingMore]);

    // Load more when page changes
    useEffect(() => {
        if (page > 1) {
            fetchPosts(page, true);
        }
    }, [page, fetchPosts]);

    // Handle new post created
    const handlePostCreated = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    // Handle post deleted
    const handlePostDeleted = (postId) => {
        setPosts(prev => prev.filter(post => post.id !== postId));
    };

    // Handle post liked/unliked
    const handlePostUpdated = (updatedPost) => {
        setPosts(prev => prev.map(post =>
            post.id === updatedPost.id ? updatedPost : post
        ));
    };

    if (loading && page === 1) {
        return (
            <div className="social-feed-container">
                <div className="feed-loading">
                    <FaSpinner className="spinner" />
                    <p>Loading your feed...</p>
                </div>
            </div>
        );
    }

    if (error && posts.length === 0) {
        return (
            <div className="social-feed-container">
                <div className="feed-error">
                    <FaExclamationTriangle />
                    <p>{error}</p>
                    <button onClick={() => fetchPosts(1, false)} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="social-feed-container">
            <div className="feed-header">
                <h1>Your Feed</h1>
                <p>Stay connected with the Fitty community</p>
            </div>

            {/* Create Post Section */}
            <CreatePost onPostCreated={handlePostCreated} />

            {/* Posts Feed */}
            <div className="posts-feed">
                {posts.length === 0 ? (
                    <div className="empty-feed">
                        <h3>No posts yet</h3>
                        <p>Follow other users to see their posts in your feed!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDelete={handlePostDeleted}
                            onUpdate={handlePostUpdated}
                        />
                    ))
                )}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
                <div className="loading-more">
                    <FaSpinner className="spinner" />
                    <p>Loading more posts...</p>
                </div>
            )}

            {/* End of Feed */}
            {!hasMore && posts.length > 0 && (
                <div className="end-of-feed">
                    <p>You're all caught up! 🎉</p>
                </div>
            )}
        </div>
    );
};

export default SocialFeed;
