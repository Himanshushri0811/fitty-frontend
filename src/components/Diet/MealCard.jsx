import React from 'react';
import './MealCard.css';

const MealCard = ({ meal, onClick }) => {
    if (!meal) return null;

    // Calculate percentages for macro visual bars (simplified logic)
    const protein = meal.protein || 0;
    const carbs = meal.carbs || 0;
    const fat = meal.fat || 0;
    const total = (protein + carbs + fat) || 1; // Avoid division by zero

    const pPct = (protein / total) * 100;
    const cPct = (carbs / total) * 100;
    const fPct = (fat / total) * 100;

    const fallbackImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80";

    return (
        <div className="meal-card" onClick={() => onClick(meal)}>
            <div className="meal-image-container">
                <img src={meal.image || fallbackImage} alt={meal.name} className="meal-image" />
                <span className="meal-type-badge">{meal.type}</span>
            </div>

            <div className="meal-info">
                <h3 className="meal-name">{meal.name}</h3>

                <div className="meal-tags">
                    {/* Budget Badge */}
                    {meal.budget && (
                        <span className={`mini-tag budget-${meal.budget.toLowerCase()}`}>
                            {meal.budget === 'Low' ? '💰 Saver' : meal.budget === 'High' ? '💎 Premium' : '⚖️ Balanced'}
                        </span>
                    )}

                    {/* Good For Badge */}
                    {(meal.tags || []).map(tag => (
                        <span key={tag} className="mini-tag">{tag}</span>
                    ))}

                    {meal.description && (
                        <div className="smart-tip-badge" title={meal.description}>
                            💡 Why?
                        </div>
                    )}
                </div>

                <div className="meal-macros">
                    <div className="macro-legend">
                        <div className="macro-item item-cal">🔥 <span>{meal.calories || 0}</span></div>
                        <div className="macro-item item-pro" style={{ color: '#00ff99' }}>P: <span>{protein}g</span></div>
                        <div className="macro-item item-carb" style={{ color: '#ff9900' }}>C: <span>{carbs}g</span></div>
                        <div className="macro-item item-fat" style={{ color: '#ff4444' }}>F: <span>{fat}g</span></div>
                    </div>

                    <div className="macro-bars">
                        <div className="bar-protein" style={{ width: `${pPct}%` }}></div>
                        <div className="bar-carbs" style={{ width: `${cPct}%` }}></div>
                        <div className="bar-fat" style={{ width: `${fPct}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealCard;
