import React from 'react';
import './MealModal.css';

const MealModal = ({ meal, onClose, onReplaceClick }) => {
    if (!meal) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="meal-modal-container" onClick={(e) => e.stopPropagation()}>

                {/* Header Image */}
                <div className="modal-header-img-wrapper">
                    <img src={meal.image} alt={meal.name} className="modal-header-img" />
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                    <button className="modal-replace-btn" onClick={onReplaceClick}>🔄 Replace</button>
                </div>

                <div className="modal-content">
                    {/* Title & Prep Time */}
                    <div className="modal-title-row">
                        <h2>{meal.name}</h2>
                        <div className="prep-time">
                            <span>⏱</span> {meal.prepTime || "15 min"}
                        </div>
                    </div>

                    {/* Macro Grid */}
                    <div className="nutrient-grid">
                        <div className="nutrient-item">
                            <span className="n-value" style={{ color: '#fff' }}>{meal.calories}</span>
                            <span className="n-label">Kcal</span>
                        </div>
                        <div className="nutrient-item">
                            <span className="n-value" style={{ color: '#00ff99' }}>{meal.protein}g</span>
                            <span className="n-label">Protein</span>
                        </div>
                        <div className="nutrient-item">
                            <span className="n-value" style={{ color: '#ff9900' }}>{meal.carbs}g</span>
                            <span className="n-label">Carbs</span>
                        </div>
                        <div className="nutrient-item">
                            <span className="n-value" style={{ color: '#ff4444' }}>{meal.fat}g</span>
                            <span className="n-label">Fats</span>
                        </div>
                    </div>

                    {/* Smart Insights */}
                    {(meal.description || (meal.benefits && meal.benefits.length > 0)) && (
                        <div className="smart-insights-section">
                            <h3>🧠 Smart Insights</h3>
                            {meal.description && (
                                <p className="smart-desc">{meal.description}</p>
                            )}
                            {meal.benefits && (
                                <div className="benefits-tags">
                                    {meal.benefits.map((b, i) => (
                                        <span key={i} className="benefit-pill">✨ {b}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ingredients */}
                    <div className="ingredients-section">
                        <h3>Ingredients</h3>
                        <ul className="ingredients-list">
                            {meal.ingredients && meal.ingredients.map((ing, idx) => (
                                <li key={idx}>
                                    <span className="check-icon">✓</span>
                                    {ing}
                                </li>
                            ))}
                            {!meal.ingredients && <li>No ingredients listed.</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealModal;
