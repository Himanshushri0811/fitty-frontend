import React, { useState, useEffect } from 'react';
import { searchFoods } from '../../services/dietService';
import './FoodSearchModal.css';

const FoodSearchModal = ({ onClose, onSelect, onSmartReplace }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 2) {
                setLoading(true);
                try {
                    const data = await searchFoods(query);
                    setResults(data);
                } catch (err) {
                    console.error("Search failed", err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="search-modal-overlay">
            <div className="search-modal-content">
                <div className="search-header">
                    <h3>Find Replacement Food</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>

                <div className="smart-options-grid">
                    <button className="smart-opt-btn opt-protein" onClick={() => onSmartReplace('high_protein')}>
                        <span className="opt-icon">💪</span> High Protein
                    </button>
                    <button className="smart-opt-btn opt-budget" onClick={() => onSmartReplace('budget')}>
                        <span className="opt-icon">💰</span> Budget Saver
                    </button>
                    <button className="smart-opt-btn opt-fast" onClick={() => onSmartReplace('fast')}>
                        <span className="opt-icon">⏱</span> Quick Fix
                    </button>
                    <button className="smart-opt-btn opt-similar" onClick={() => onSmartReplace('similar')}>
                        <span className="opt-icon">🔄</span> Similar Cals
                    </button>
                </div>

                <div className="divider"><span>OR SEARCH MANUALLY</span></div>

                <input
                    type="text"
                    placeholder="Search foods (e.g., Paneer, Oats)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="food-search-input"
                    autoFocus
                />

                <div className="search-results">
                    {loading && <p>Searching...</p>}

                    {!loading && results.map((food) => (
                        <div key={food.id} className="food-result-item" onClick={() => onSelect(food)}>
                            <div className="food-info">
                                <h4>{food.name}</h4>
                                <span className="food-meta">
                                    {food.calories} cal | {food.serving_unit} | {food.type}
                                </span>
                            </div>
                            <button className="select-btn">Select</button>
                        </div>
                    ))}

                    {!loading && query.length > 2 && results.length === 0 && (
                        <p className="no-results">No foods found. Try seeding database?</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodSearchModal;
