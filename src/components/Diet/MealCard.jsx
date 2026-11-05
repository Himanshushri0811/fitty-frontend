import React from 'react';
import './MealCard.css';

const MealCard = ({ meal, onClick, isEaten, onToggleEaten }) => {
    if (!meal) return null;

    const fallbackImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80";

    // Macro sums
    const protein = Math.round(Number(meal.protein) || 0);
    const carbs = Math.round(Number(meal.carbs) || 0);
    const fat = Math.round(Number(meal.fat || meal.fats) || 0);
    const calories = Math.round(Number(meal.calories) || 0);

    const total = (protein + carbs + fat) || 1;
    const pPct = Math.min((protein / total) * 100, 100);
    const cPct = Math.min((carbs / total) * 100, 100);
    const fPct = Math.min((fat / total) * 100, 100);

    const items = meal.items || [];
    const displayImage = meal.image || (items[0] && items[0].image) || fallbackImage;
    const slotPeriod = meal.period || meal.type?.toLowerCase();

    const handleCheckboxClick = (e) => {
        e.stopPropagation();
        if (onToggleEaten) {
            onToggleEaten(slotPeriod, !isEaten);
        }
    };

    return (
        <div
            className={`meal-card ${isEaten ? 'meal-card-eaten' : ''}`}
            onClick={() => onClick && onClick(meal)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick && onClick(meal);
                }
            }}
        >
            <div className="meal-image-container">
                <img src={displayImage} alt={meal.name || 'Meal'} className="meal-image" loading="lazy" />
                <span className="meal-type-badge">{meal.type || meal.name}</span>

                {/* Eaten Checkbox / Button */}
                {onToggleEaten && (
                    <button
                        type="button"
                        className={`meal-eaten-btn ${isEaten ? 'eaten-done' : ''}`}
                        onClick={handleCheckboxClick}
                        aria-label={isEaten ? "Mark meal as not eaten" : "Mark meal as eaten"}
                        title={isEaten ? "Completed! Tap to undo" : "Tap to mark as eaten"}
                    >
                        {isEaten ? "✓ Eaten" : "○ Mark Eaten"}
                    </button>
                )}
            </div>

            <div className="meal-info">
                <div className="meal-header-row">
                    <h3 className="meal-name">{meal.name}</h3>
                    <span className="meal-slot-cals">🔥 {calories} kcal</span>
                </div>

                {/* Item List: quantity x name (serving_unit) */}
                {items.length > 0 && (
                    <div className="meal-items-breakdown">
                        {items.map((it, idx) => (
                            <div key={idx} className="breakdown-item">
                                <span className="item-label">
                                    {it.quantity}x {it.name} {it.unit ? `(${it.unit})` : ''}
                                </span>
                                <span className="item-cals-val">
                                    {it.calories ? `${Math.round(it.calories)} kcal` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="meal-tags">
                    {meal.budget && (
                        <span className={`mini-tag budget-${meal.budget.toLowerCase()}`}>
                            {meal.budget === 'Low' ? '💰 Saver' : meal.budget === 'High' ? '💎 Premium' : '⚖️ Balanced'}
                        </span>
                    )}

                    {(meal.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} className="mini-tag">{tag}</span>
                    ))}

                    {meal.description && (
                        <div className="smart-tip-badge" title={meal.description}>
                            💡 Info
                        </div>
                    )}
                </div>

                <div className="meal-macros">
                    <div className="macro-legend">
                        <div className="macro-item item-cal">🔥 <span>{calories}</span></div>
                        <div className="macro-item item-pro" style={{ color: '#10b981' }}>P: <span>{protein}g</span></div>
                        <div className="macro-item item-carb" style={{ color: '#f59e0b' }}>C: <span>{carbs}g</span></div>
                        <div className="macro-item item-fat" style={{ color: '#ef4444' }}>F: <span>{fat}g</span></div>
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
