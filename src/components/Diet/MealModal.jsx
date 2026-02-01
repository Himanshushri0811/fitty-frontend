import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MealModal.css';

const MealModal = ({ meal, onClose, onReplaceClick }) => {
    const [deepDive, setDeepDive] = useState(null);
    const [loading, setLoading] = useState(false);

    // Use configured axios or default
    const fetchDeepDive = async () => {
        if (!meal.food_id) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get(`http://localhost:8000/api/diet/foods/${meal.food_id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeepDive(res.data.deep_dive);
        } catch (err) {
            console.error("Failed to load deep dive", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (meal) {
            fetchDeepDive();
        }
    }, [meal]);

    if (!meal) return null;

    // Use deep dive image if available, else modal image, else placeholder
    const displayImage = (deepDive && deepDive.image_url) ? deepDive.image_url : meal.image;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="meal-modal-container" onClick={(e) => e.stopPropagation()}>

                {/* LEFT: CONTENT (SCROLLABLE) */}
                <div className="modal-left-content">
                    <div className="modal-header-row">
                        <div>
                            <span className="meal-type-badge">{meal.type}</span>
                            <h2>{meal.name}</h2>
                            <div className="prep-time-row">
                                <span>⏱ {meal.prepTime || "15 min"}</span>
                                <span>🔥 {meal.calories} Kcal</span>
                            </div>
                        </div>
                        {/* Mobile close button shows here only if mobile layout */}
                    </div>

                    <div className="nutrient-grid-compact">
                        <div className="macro-pill p-pill">Protein: {meal.protein}g</div>
                        <div className="macro-pill c-pill">Carbs: {meal.carbs}g</div>
                        <div className="macro-pill f-pill">Fats: {meal.fat}g</div>
                    </div>

                    <div className="deep-dive-section">
                        {loading ? (
                            <div className="dd-loading">
                                <span className="loader-dots">Researching Food History...</span>
                            </div>
                        ) : deepDive ? (
                            <>
                                <div className="dd-block">
                                    <h3>📜 Chef's Notes</h3>
                                    <p>{deepDive.long_description || meal.description}</p>
                                </div>

                                <div className="dd-block">
                                    <h3>💚 Benefits</h3>
                                    <div className="benefits-tags">
                                        {(deepDive.health_benefits_detailed || meal.benefits || []).map((b, i) => (
                                            <span key={i} className="benefit-pill">✨ {b}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="dd-block">
                                    <h3>⚠️ Advisory</h3>
                                    <p>{deepDive.who_should_avoid || "Generally safe for everyone."}</p>
                                </div>

                                <div className="dd-block">
                                    <h3>💡 Fun Fact</h3>
                                    <p className="fun-fact-text">{deepDive.fun_fact || "Did you know this is a superfood?"}</p>
                                </div>
                            </>
                        ) : (
                            <div className="dd-block">
                                <h3>Description</h3>
                                <p>{meal.description || "No details available."}</p>
                            </div>
                        )}
                    </div>

                    <div className="modal-actions-footer">
                        <button className="replace-btn-large" onClick={onReplaceClick}>
                            🔄 Replace Meal
                        </button>
                    </div>
                </div>

                {/* RIGHT: IMAGE (FIXED) */}
                <div className="modal-right-image" style={{ backgroundImage: `url(${displayImage})` }}>
                    <div className="image-overlay-gradient"></div>
                    <button className="close-btn-absolute" onClick={onClose}>&times;</button>
                    {deepDive && deepDive.best_time_to_eat && (
                        <div className="best-time-badge">
                            ⏰ Best Time: {deepDive.best_time_to_eat}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MealModal;
