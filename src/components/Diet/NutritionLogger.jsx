import React, { useState } from 'react';
import axios from 'axios';
import './NutritionLogger.css';

const NutritionLogger = () => {
    const [logText, setLogText] = useState("");
    const [result, setResult] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const handleCalculate = async () => {
        if (!logText.trim()) return;

        setIsCalculating(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.post(
                'http://localhost:8000/api/diet/calculate-macros/',
                { text: logText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResult(res.data);
        } catch (error) {
            console.error(error);
            alert("Failed to calculate.");
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <div className="nutrition-logger-container animate-fade-in">
            <h3>📝 Quick Nutrition Logger</h3>
            <p className="subtitle">Type what you ate (e.g., "2 roti and 1 bowl dal") and let AI check your intake.</p>

            <div className="input-group">
                <textarea
                    value={logText}
                    onChange={(e) => setLogText(e.target.value)}
                    placeholder="Describe your meal here..."
                    rows={3}
                />
                <button
                    className="calc-btn"
                    onClick={handleCalculate}
                    disabled={isCalculating || !logText}
                >
                    {isCalculating ? "Calculating..." : "Calculate Macros ✨"}
                </button>
            </div>

            {result && (
                <div className="result-card animate-slide-up">
                    <div className="result-header">
                        <h4>Analysis Result</h4>
                        <span className="total-cals">🔥 {result.total_calories} kcal</span>
                    </div>

                    <div className="macros-grid">
                        <div className="macro-item protein">
                            <span className="label">Protein</span>
                            <span className="value">{result.total_protein}g</span>
                            <div className="bar"><div style={{ width: `${Math.min(result.total_protein, 100)}%` }}></div></div>
                        </div>
                        <div className="macro-item carbs">
                            <span className="label">Carbs</span>
                            <span className="value">{result.total_carbs}g</span>
                            <div className="bar"><div style={{ width: `${Math.min(result.total_carbs, 100)}%` }}></div></div>
                        </div>
                        <div className="macro-item fat">
                            <span className="label">Fat</span>
                            <span className="value">{result.total_fats}g</span>
                            <div className="bar"><div style={{ width: `${Math.min(result.total_fats, 100)}%` }}></div></div>
                        </div>
                    </div>

                    {result.items && (
                        <div className="detected-items">
                            <small>Detected: {result.items.join(", ")}</small>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NutritionLogger;
