import React from 'react';
import MealCard from './MealCard';
import './WeeklyDiet.css';

const WeeklyDiet = ({ meals, onMealClick }) => {
    if (!meals || meals.length === 0) {
        return (
            <div className="weekly-diet-container">
                <div className="meals-grid">
                    <div className="no-meals">
                        <h3>Rest & Cheat Day 🍔</h3>
                        <p>No strict meal plan for today. Eat mindfully!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="weekly-diet-container">
            <div className="meals-grid">
                {meals.map((meal) => (
                    <MealCard
                        key={meal.id}
                        meal={meal}
                        onClick={onMealClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default WeeklyDiet;
