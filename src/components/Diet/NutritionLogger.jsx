import React, { useState } from 'react';
import API from '../axiosConfig';
import { logFood } from '../../services/dietService';
import './NutritionLogger.css';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

const getDefaultMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 16) return 'Lunch';
    if (hour >= 16 && hour < 19) return 'Snack';
    return 'Dinner';
};

const NutritionLogger = ({ onLogSuccess }) => {
    const [logText, setLogText] = useState("");
    const [mealType, setMealType] = useState(getDefaultMealType());
    const [itemsDetail, setItemsDetail] = useState([]);
    const [overallSource, setOverallSource] = useState('db');
    const [totals, setTotals] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const calculateTotalsFromDetails = (items) => {
        let cal = 0;
        let pro = 0;
        let carb = 0;
        let fat = 0;

        items.forEach(item => {
            cal += Math.round(Number(item.calories) || 0);
            pro += Number(item.protein) || 0;
            carb += Number(item.carbs) || 0;
            fat += Number(item.fats) || 0;
        });

        return {
            total_calories: cal,
            total_protein: Math.round(pro * 10) / 10,
            total_carbs: Math.round(carb * 10) / 10,
            total_fats: Math.round(fat * 10) / 10,
        };
    };

    const handleCalculate = async () => {
        if (!logText.trim()) return;
        setErrorMessage("");
        setSuccessMessage("");
        setIsCalculating(true);

        try {
            const res = await API.post('/api/diet/calculate-macros/', { text: logText.trim() });
            const data = res.data;

            // Prepare editable items with base per-unit references for linear scaling
            const processedItems = (data.items_detail || []).map((item, idx) => {
                const qty = Number(item.quantity) || 1.0;
                const safeQty = qty > 0 ? qty : 1.0;
                return {
                    id: `item-${idx}-${Date.now()}`,
                    name: item.name,
                    quantity: safeQty,
                    unit: item.unit || 'unit',
                    baseCalories: (Number(item.calories) || 0) / safeQty,
                    baseProtein: (Number(item.protein) || 0) / safeQty,
                    baseCarbs: (Number(item.carbs) || 0) / safeQty,
                    baseFats: (Number(item.fats) || 0) / safeQty,
                    calories: Math.round(Number(item.calories) || 0),
                    protein: Math.round((Number(item.protein) || 0) * 10) / 10,
                    carbs: Math.round((Number(item.carbs) || 0) * 10) / 10,
                    fats: Math.round((Number(item.fats) || 0) * 10) / 10,
                    source: item.source || 'db',
                };
            });

            setItemsDetail(processedItems);
            setOverallSource(data.source || 'db');
            setTotals(calculateTotalsFromDetails(processedItems));
        } catch (error) {
            console.error(error);
            if (error.response?.status === 429) {
                setErrorMessage("Too many requests, try later.");
            } else {
                setErrorMessage(error.response?.data?.error || "Failed to calculate macros. Please try again.");
            }
        } finally {
            setIsCalculating(false);
        }
    };

    const handleQuantityChange = (index, delta) => {
        setItemsDetail(prev => {
            const updated = [...prev];
            const current = updated[index];
            const newQty = Math.max(0.5, Math.round((current.quantity + delta) * 10) / 10);
            
            updated[index] = {
                ...current,
                quantity: newQty,
                calories: Math.round(current.baseCalories * newQty),
                protein: Math.round((current.baseProtein * newQty) * 10) / 10,
                carbs: Math.round((current.baseCarbs * newQty) * 10) / 10,
                fats: Math.round((current.baseFats * newQty) * 10) / 10,
            };

            setTotals(calculateTotalsFromDetails(updated));
            return updated;
        });
    };

    const handleRemoveRow = (index) => {
        setItemsDetail(prev => {
            const updated = prev.filter((_, i) => i !== index);
            setTotals(calculateTotalsFromDetails(updated));
            return updated;
        });
    };

    const handleSave = async () => {
        if (!totals || itemsDetail.length === 0) return;
        setErrorMessage("");
        setSuccessMessage("");
        setIsSaving(true);

        const localDate = new Date().toLocaleDateString('en-CA');
        const clientId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const payload = {
            date: localDate,
            meal_type: mealType,
            client_id: clientId,
            items: itemsDetail.map(i => i.name),
            items_detail: itemsDetail.map(i => ({
                name: i.name,
                quantity: i.quantity,
                unit: i.unit,
                calories: i.calories,
                protein: i.protein,
                carbs: i.carbs,
                fats: i.fats,
                source: i.source,
            })),
            totals: totals,
            source: overallSource,
        };

        try {
            await logFood(payload);
            setSuccessMessage("Meal logged successfully!");
            setItemsDetail([]);
            setTotals(null);
            setLogText("");
            if (onLogSuccess) onLogSuccess();
        } catch (error) {
            console.error("Save error:", error);
            const errStr = (error.response?.data?.error || error.message || "").toLowerCase();
            if (errStr.includes("already logged")) {
                // If the server says "Already logged", treat it as success
                setSuccessMessage("Meal already logged!");
                setItemsDetail([]);
                setTotals(null);
                setLogText("");
                if (onLogSuccess) onLogSuccess();
            } else if (error.response?.status === 429) {
                setErrorMessage("Too many requests, try later.");
            } else {
                setErrorMessage(error.response?.data?.error || "Failed to save log to diary.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="nutrition-logger-container animate-fade-in">
            <div className="logger-title-row">
                <h3>📝 Quick Nutrition Logger</h3>
            </div>
            <p className="subtitle">Type what you ate (e.g., "2 roti and 1 bowl dal") and let AI check your intake.</p>

            {/* Meal Type Chips */}
            <div className="meal-type-chips-row">
                <span className="chips-label">Meal Slot:</span>
                <div className="meal-chips-group">
                    {MEAL_TYPES.map(type => (
                        <button
                            key={type}
                            type="button"
                            className={`meal-chip ${mealType === type ? 'active' : ''}`}
                            onClick={() => setMealType(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Textarea with 300 char limit */}
            <div className="input-group">
                <textarea
                    value={logText}
                    onChange={(e) => setLogText(e.target.value.slice(0, 300))}
                    maxLength={300}
                    placeholder="Describe your meal here (e.g., 2 eggs, 1 glass milk, 2 slices brown bread)..."
                    rows={3}
                />
                <div className="char-count-row">
                    <span className={`char-counter ${logText.length >= 280 ? 'near-limit' : ''}`}>
                        {logText.length} / 300
                    </span>
                </div>

                {errorMessage && (
                    <div className="logger-error-banner" role="alert">
                        ⚠️ {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="logger-success-banner">
                        ✅ {successMessage}
                    </div>
                )}

                <div className="btn-row">
                    <button
                        type="button"
                        className="calc-btn"
                        onClick={handleCalculate}
                        disabled={isCalculating || !logText.trim()}
                    >
                        {isCalculating ? "Calculating..." : "Calculate Macros ✨"}
                    </button>
                </div>
            </div>

            {/* Editable Items & Results */}
            {totals && itemsDetail.length > 0 && (
                <div className="result-card animate-slide-up">
                    <div className="result-header">
                        <h4>Analysis Result ({mealType})</h4>
                        <span className="total-cals">🔥 {totals.total_calories} kcal</span>
                    </div>

                    {/* Live Macro Summary */}
                    <div className="macros-grid">
                        <div className="macro-item protein">
                            <span className="label">Protein</span>
                            <span className="value">{totals.total_protein}g</span>
                        </div>
                        <div className="macro-item carbs">
                            <span className="label">Carbs</span>
                            <span className="value">{totals.total_carbs}g</span>
                        </div>
                        <div className="macro-item fat">
                            <span className="label">Fat</span>
                            <span className="value">{totals.total_fats}g</span>
                        </div>
                    </div>

                    {/* Editable Rows */}
                    <div className="editable-items-table">
                        <h5 className="items-table-title">Detected Items (Adjust Portion)</h5>
                        {itemsDetail.map((item, idx) => (
                            <div key={item.id} className="editable-row">
                                <div className="row-main-info">
                                    <span className="item-name">{item.name}</span>
                                    <span className={`source-badge badge-${item.source === 'db' ? 'verified' : 'estimate'}`}>
                                        {item.source === 'db' ? 'Verified' : 'AI estimate'}
                                    </span>
                                </div>

                                <div className="row-stepper-wrap">
                                    <button
                                        type="button"
                                        className="step-btn"
                                        aria-label={`Decrease quantity of ${item.name}`}
                                        onClick={() => handleQuantityChange(idx, -0.5)}
                                        disabled={item.quantity <= 0.5}
                                    >
                                        -
                                    </button>
                                    <span className="step-qty">{item.quantity} {item.unit}</span>
                                    <button
                                        type="button"
                                        className="step-btn"
                                        aria-label={`Increase quantity of ${item.name}`}
                                        onClick={() => handleQuantityChange(idx, 0.5)}
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="row-macros-col">
                                    <span className="row-cals">{item.calories} kcal</span>
                                    <small className="row-protein">{item.protein}g P</small>
                                </div>

                                <button
                                    type="button"
                                    className="row-del-btn"
                                    aria-label={`Remove ${item.name}`}
                                    onClick={() => handleRemoveRow(idx)}
                                    title="Remove item"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="save-log-btn"
                        onClick={handleSave}
                        disabled={isSaving || itemsDetail.length === 0}
                    >
                        {isSaving ? "Saving to Diary..." : "✅ Add to Daily Diary"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NutritionLogger;
