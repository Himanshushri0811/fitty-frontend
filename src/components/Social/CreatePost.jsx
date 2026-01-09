import React, { useState, useRef } from 'react';
import axios from '../axiosConfig';
import { FaImage, FaTimes, FaSpinner } from 'react-icons/fa';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
    const [caption, setCaption] = useState('');
    const [postType, setPostType] = useState('text');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const token = localStorage.getItem('access_token');

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image size must be less than 5MB');
                return;
            }

            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    // Remove image
    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle post creation
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!caption.trim()) {
            setError('Please write something...');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('caption', caption.trim());
            formData.append('post_type', postType);

            if (image) {
                formData.append('image', image);
            }

            const response = await axios.post(
                '/api/social/posts/',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Reset form
            setCaption('');
            setPostType('text');
            removeImage();

            // Notify parent
            if (onPostCreated) {
                onPostCreated(response.data);
            }
        } catch (err) {
            console.error('Error creating post:', err);
            setError(err.response?.data?.detail || 'Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-post-card">
            <form onSubmit={handleSubmit} className="create-post-form">
                <div className="post-type-selector">
                    <button
                        type="button"
                        className={`type-btn ${postType === 'text' ? 'active' : ''}`}
                        onClick={() => setPostType('text')}
                    >
                        📝 Text
                    </button>
                    <button
                        type="button"
                        className={`type-btn ${postType === 'image' ? 'active' : ''}`}
                        onClick={() => setPostType('image')}
                    >
                        🖼️ Image
                    </button>
                    <button
                        type="button"
                        className={`type-btn ${postType === 'workout' ? 'active' : ''}`}
                        onClick={() => setPostType('workout')}
                    >
                        💪 Workout
                    </button>
                    <button
                        type="button"
                        className={`type-btn ${postType === 'achievement' ? 'active' : ''}`}
                        onClick={() => setPostType('achievement')}
                    >
                        🏆 Achievement
                    </button>
                    <button
                        type="button"
                        className={`type-btn ${postType === 'tip' ? 'active' : ''}`}
                        onClick={() => setPostType('tip')}
                    >
                        💡 Tip
                    </button>
                </div>

                <textarea
                    className="post-input"
                    placeholder="Share your fitness journey..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    maxLength={2200}
                    disabled={loading}
                />

                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button
                            type="button"
                            className="remove-image-btn"
                            onClick={removeImage}
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="post-error">
                        {error}
                    </div>
                )}

                <div className="post-actions-bar">
                    <div className="post-tools">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <button
                            type="button"
                            className="tool-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading}
                        >
                            <FaImage /> Add Image
                        </button>
                        <span className="char-count">
                            {caption.length} / 2200
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="submit-post-btn"
                        disabled={loading || !caption.trim()}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="spinner" /> Posting...
                            </>
                        ) : (
                            'Post'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
