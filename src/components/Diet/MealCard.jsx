import React from 'react';
import './MealCard.css';

const MealCard = ({ meal, onClick }) => {
    // Calculate percentages for macro visual bars (simplified logic)
    const total = meal.protein + meal.carbs + meal.fat;
    const pPct = (meal.protein / total) * 100;
    const cPct = (meal.carbs / total) * 100;
    const fPct = (meal.fat / total) * 100;

    return (
        <div className="meal-card" onClick={() => onClick(meal)}>
            <div className="meal-image-container">
                <img src={meal.image} alt={meal.name} className="meal-image" />
                <span className="meal-type-badge">{meal.type}</span>
            </div>

            <div className="meal-info">
                <h3 className="meal-name">{meal.name}</h3>

                <div className="meal-tags">
                    {meal.tags.map(tag => (
                        <span key={tag} className="mini-tag">{tag}</span>
                    ))}
                </div>

                <div className="meal-macros">
                    <div className="macro-legend">
                        <div className="macro-item item-cal">🔥 <span>{meal.calories}</span></div>
                        <div className="macro-item item-pro" style={{ color: '#00ff99' }}>P: <span>{meal.protein}g</span></div>
                        <div className="macro-item item-carb" style={{ color: '#ff9900' }}>C: <span>{meal.carbs}g</span></div>
                        <div className="macro-item item-fat" style={{ color: '#ff4444' }}>F: <span>{meal.fat}g</span></div>
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
