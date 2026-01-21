import React from 'react';
import { motion } from 'framer-motion';
import './DailyDietSummary.css';

const DailyDietSummary = ({ meals, targets }) => {
    // Calculate totals from displayed meals
    const totalCalories = meals.reduce((acc, meal) => acc + (meal.calories || 0), 0);
    const totalProtein = meals.reduce((acc, meal) => acc + (meal.protein || 0), 0);

    const calProgress = Math.min((totalCalories / targets.calories) * 100, 100);
    const proProgress = Math.min((totalProtein / targets.protein) * 100, 100);

    return (
        <div className="daily-summary-card">
            <h3 className="summary-title">Daily Nutrition Summary</h3>

            <div className="summary-grid">
                {/* Calories */}
                <div className="summary-item">
                    <div className="summary-header">
                        <span>Calories</span>
                        <span className="summary-val">{totalCalories} / {targets.calories}</span>
                    </div>
                    <div className="progress-track">
                        <motion.div
                            className="progress-fill fill-cal"
                            initial={{ width: 0 }}
                            animate={{ width: `${calProgress}%` }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                </div>

                {/* Protein */}
                <div className="summary-item">
                    <div className="summary-header">
                        <span>Protein</span>
                        <span className="summary-val">{Math.round(totalProtein)}g / {targets.protein}g</span>
                    </div>
                    <div className="progress-track">
                        <motion.div
                            className="progress-fill fill-pro"
                            initial={{ width: 0 }}
                            animate={{ width: `${proProgress}%` }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyDietSummary;
