import React from 'react';
import './GroceryList.css';

const GroceryList = ({ plan }) => {
    // Aggregate ingredients from all meals in the day
    const ingredients = Array.from(new Set(
        plan.meals.flatMap(meal => meal.ingredients || [])
    ));

    if (ingredients.length === 0) return null;

    return (
        <div className="grocery-container">
            <div className="grocery-header">
                <h3>🛒 Daily Grocery List</h3>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{ingredients.length} Items</span>
            </div>
            <div className="grocery-items">
                {ingredients.map((item, index) => (
                    <div key={index} className="grocery-item">
                        <span className="item-check"></span>
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroceryList;
