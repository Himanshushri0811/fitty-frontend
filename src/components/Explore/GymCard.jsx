import React, { useState } from 'react';
import { FaImages, FaTimes, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaDirections } from 'react-icons/fa';

const GymCard = ({ gym }) => {
    const [showGallery, setShowGallery] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    // Placeholder image if thumbnail is missing
    const imageUrl = gym.thumbnail || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000';

    // Combine thumbnail with gallery images
    const allImages = gym.images && gym.images.length > 0
        ? [imageUrl, ...gym.images.map(img => img.image)]
        : [imageUrl];

    const nextImage = (e) => {
        e.stopPropagation();
        setActiveIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const openDirections = (e) => {
        e.stopPropagation();
        if (gym.latitude && gym.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${gym.latitude},${gym.longitude}`, '_blank');
        } else {
            alert("No coordinates available for this gym.");
        }
    };

    return (
        <div className="gym-card">
            <div className="gym-image" onClick={() => setShowGallery(true)}>
                <img src={imageUrl} alt={gym.name} />
                <div className="gym-badge">
                    ⭐ {gym.rating}
                </div>
                {gym.images && gym.images.length > 0 && (
                    <div className="gallery-indicator">
                        <FaImages /> {gym.images.length + 1}
                    </div>
                )}
            </div>

            <div className="gym-content">
                <div className="gym-title">
                    {gym.name}
                    <span className="gym-dist">{gym.distance > 0 ? `${gym.distance.toFixed(1)} km away` : gym.city}</span>
                </div>

                <div className="gym-address">
                    <FaMapMarkerAlt style={{ color: '#22d3ee', marginTop: '3px' }} /> {gym.address}
                </div>

                <div className="gym-features">
                    {Array.isArray(gym.facilities) && gym.facilities.slice(0, 3).map((f, i) => (
                        <span key={i} className="feature-tag">{f}</span>
                    ))}
                    {gym.facilities.length > 3 && <span className="feature-tag">+{gym.facilities.length - 3}</span>}
                </div>

                <div className="gym-footer">
                    <div>
                        <div className="gym-price">
                            ₹{Math.round(gym.price_range_min)} <span>/mo</span>
                        </div>
                    </div>
                </div>

                <div className="gym-actions">
                    <button className="action-btn btn-secondary" onClick={() => setShowGallery(true)}>
                        <FaImages /> View Photos
                    </button>
                    <button className="action-btn btn-primary" onClick={openDirections}>
                        <FaDirections /> Directions
                    </button>
                </div>
            </div>

            {/* Simple Gallery Modal */}
            {showGallery && (
                <div className="image-modal-overlay" onClick={() => setShowGallery(false)}>
                    <div className="image-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setShowGallery(false)}><FaTimes /></button>

                        <div className="modal-image-container">
                            <img src={allImages[activeIndex]} alt={`Gym ${activeIndex}`} />

                            {allImages.length > 1 && (
                                <>
                                    <button className="nav-btn prev" onClick={prevImage}><FaChevronLeft /></button>
                                    <button className="nav-btn next" onClick={nextImage}><FaChevronRight /></button>
                                    <div className="image-counter">
                                        {activeIndex + 1} / {allImages.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GymCard;
