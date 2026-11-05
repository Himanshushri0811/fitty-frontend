import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MealModal from './MealModal';
import FoodSearchModal from './FoodSearchModal';
import DietSmartBox from './SmartBox/DietSmartBox';
import NutritionLogger from './NutritionLogger';
import MealCard from './MealCard';
import {
    fetchDietPlan,
    updateDietProfile,
    replaceMeal,
    fetchDietProfile,
    fetchDailySummary,
    markMealEaten,
    regeneratePlan
} from '../../services/dietService';
import DailyDietSummary from './DailyDietSummary';
import './DietSection.css';

const GOALS = ["Weight Loss", "Muscle Gain", "Maintenance"];
const DIET_TYPES = ["Veg", "Non-Veg", "Vegan", "Egg"];
const BUDGET_OPTIONS = [
    { label: "₹100 - ₹500 (Saver)", value: "Low" },
    { label: "₹500 - ₹1000 (Standard)", value: "Medium" },
    { label: "Premium (₹1000+)", value: "High" }
];
const QUICK_ALLERGENS = ['Milk/Dairy', 'Nuts', 'Peanut', 'Egg', 'Gluten', 'Soy', 'Fish'];

const DietSection = () => {
    const navigate = useNavigate();
    const today = new Date().toLocaleDateString('en-CA');

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Profile State
    const [selectedGoal, setSelectedGoal] = useState("Weight Loss");
    const [dietType, setDietType] = useState("Veg");
    const [budgetLevel, setBudgetLevel] = useState("Medium");
    const [allergies, setAllergies] = useState([]);
    const [dislikes, setDislikes] = useState([]);
    const [customAllergy, setCustomAllergy] = useState("");
    const [customDislike, setCustomDislike] = useState("");

    // Plan & Summary Data
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [targets, setTargets] = useState({ calories: 2000, protein: 120, carbs: 220, fats: 60, water: 8 });
    const [dailySummary, setDailySummary] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Modals
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [selectedSlotForReplace, setSelectedSlotForReplace] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);


    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [planData, profileData, summaryData] = await Promise.all([
                fetchDietPlan().catch(e => {
                    if (e.response?.status === 401) setIsLoggedIn(false);
                    return null;
                }),
                fetchDietProfile().catch(e => {
                    if (e.response?.status === 401) setIsLoggedIn(false);
                    return null;
                }),
                fetchDailySummary(today).catch(e => {
                    if (e.response?.status === 401) setIsLoggedIn(false);
                    return null;
                })
            ]);

            if (planData) {
                if (planData.plan) {
                    setWeeklyPlan(planData.plan);
                    if (planData.targets) setTargets(planData.targets);
                } else {
                    setWeeklyPlan(planData);
                }
            }

            if (profileData) {
                if (profileData.goal) setSelectedGoal(profileData.goal);
                if (profileData.diet_type) setDietType(profileData.diet_type);
                if (profileData.budget_level) setBudgetLevel(profileData.budget_level);
                if (Array.isArray(profileData.allergies)) setAllergies(profileData.allergies);
                if (Array.isArray(profileData.dislikes)) setDislikes(profileData.dislikes);
            }

            if (summaryData) {
                setDailySummary(summaryData);
                if (summaryData.targets) {
                    setTargets(prev => ({ ...prev, ...summaryData.targets }));
                }
            }
        } catch (error) {
            console.error("DietSection load error:", error);
            if (error.response?.status === 401) setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    }, [today]);

    // Initial Load
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setIsLoggedIn(true);
            loadData();
        } else {
            setIsLoggedIn(false);
        }
    }, [loadData, refreshTrigger]);

    // Refresh Daily Summary independently (after logging food, water, or eating)
    const refreshSummaryOnly = async () => {
        try {
            const summaryData = await fetchDailySummary(today);
            setDailySummary(summaryData);
        } catch (err) {
            console.error("Refresh summary error:", err);
        }
    };

    // Save profile changes (allergies, dislikes, type, budget)
    const saveProfileUpdate = async (updatedFields) => {
        if (!isLoggedIn) return;
        setIsLoading(true);
        try {
            await updateDietProfile({
                goal: selectedGoal,
                diet_type: updatedFields.diet_type !== undefined ? updatedFields.diet_type : dietType,
                budget_level: updatedFields.budget_level !== undefined ? updatedFields.budget_level : budgetLevel,
                allergies: updatedFields.allergies !== undefined ? updatedFields.allergies : allergies,
                dislikes: updatedFields.dislikes !== undefined ? updatedFields.dislikes : dislikes,
            });
            // Profile updates on backend automatically regenerate plan
            await loadData();
        } catch (error) {
            console.error("Save profile error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter Handlers
    const handleDietTypeChange = (newType) => {
        setDietType(newType);
        saveProfileUpdate({ diet_type: newType });
    };

    const handleBudgetChange = (newBudget) => {
        setBudgetLevel(newBudget);
        saveProfileUpdate({ budget_level: newBudget });
    };

    const handleToggleAllergy = (item) => {
        const exists = allergies.some(a => a.toLowerCase() === item.toLowerCase());
        const updated = exists
            ? allergies.filter(a => a.toLowerCase() !== item.toLowerCase())
            : [...allergies, item];
        setAllergies(updated);
        saveProfileUpdate({ allergies: updated });
    };

    const handleAddCustomAllergy = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            e.preventDefault();
            const val = customAllergy.trim();
            if (val && !allergies.some(a => a.toLowerCase() === val.toLowerCase())) {
                const updated = [...allergies, val];
                setAllergies(updated);
                setCustomAllergy("");
                saveProfileUpdate({ allergies: updated });
            }
        }
    };

    const handleRemoveAllergy = (item) => {
        const updated = allergies.filter(a => a !== item);
        setAllergies(updated);
        saveProfileUpdate({ allergies: updated });
    };

    const handleAddCustomDislike = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            e.preventDefault();
            const val = customDislike.trim();
            if (val && !dislikes.some(d => d.toLowerCase() === val.toLowerCase())) {
                const updated = [...dislikes, val];
                setDislikes(updated);
                setCustomDislike("");
                saveProfileUpdate({ dislikes: updated });
            }
        }
    };

    const handleRemoveDislike = (item) => {
        const updated = dislikes.filter(d => d !== item);
        setDislikes(updated);
        saveProfileUpdate({ dislikes: updated });
    };

    // Regenerate Plan Handler
    const handleRegeneratePlan = async () => {
        if (!window.confirm("Regenerate your diet plan with current preferences? This will generate a fresh weekly recommendation.")) {
            return;
        }
        setIsRegenerating(true);
        try {
            await regeneratePlan();
            await loadData();
        } catch (err) {
            console.error("Regenerate plan error:", err);
            alert("Failed to regenerate plan. Please try again.");
        } finally {
            setIsRegenerating(false);
        }
    };

    // Toggle Eaten on a Slot
    const handleToggleSlotEaten = async (period, nextEatenState) => {
        try {
            await markMealEaten(today, period, nextEatenState);
            await refreshSummaryOnly();
        } catch (err) {
            console.error("Mark eaten error:", err);
        }
    };

    // Meal Replacement
    const handleOpenReplace = (slot) => {
        setSelectedSlotForReplace(slot);
        setIsSearchOpen(true);
    };

    const handleSelectFoodReplacement = async (food) => {
        if (!selectedSlotForReplace) return;
        setIsLoading(true);
        try {
            const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            await replaceMeal({
                day: currentDayName,
                period: selectedSlotForReplace.period || selectedSlotForReplace.name.toLowerCase(),
                index: 0,
                food_id: food.id
            });
            setIsSearchOpen(false);
            setSelectedSlotForReplace(null);
            setSelectedMeal(null);
            await loadData();
        } catch (err) {
            console.error("Replace meal error:", err);
            alert("Could not replace meal. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Compute Today's Slots (Ignoring "Extras")
    const getTodaysSlots = () => {
        if (dailySummary?.planned_today && dailySummary.planned_today.length > 0) {
            return dailySummary.planned_today.filter(
                slot => slot.name !== 'Extras' && (slot.period || '').toLowerCase() !== 'extras'
            );
        }

        // Fallback to weekly plan if dailySummary not yet loaded
        if (weeklyPlan) {
            const currentDayKey = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const slots = weeklyPlan[currentDayKey] || [];
            return slots
                .filter(slot => slot.name !== 'Extras')
                .map(slot => {
                    const totalCals = (slot.items || []).reduce((acc, it) => acc + (it.calories_snapshot || it.calories || 0), 0);
                    const totalPro = (slot.items || []).reduce((acc, it) => acc + (it.protein_snapshot || it.protein || 0), 0);
                    const totalCarbs = (slot.items || []).reduce((acc, it) => acc + (it.carbs_snapshot || it.carbs || 0), 0);
                    const totalFats = (slot.items || []).reduce((acc, it) => acc + (it.fats_snapshot || it.fats || 0), 0);
                    return {
                        name: slot.name,
                        period: (slot.period || slot.name).toLowerCase(),
                        time: slot.time || 'Meal Time',
                        calories: totalCals,
                        protein: totalPro,
                        carbs: totalCarbs,
                        fats: totalFats,
                        is_eaten: false,
                        items: (slot.items || []).map(it => ({
                            food_id: it.food_item_id,
                            name: it.food_name || it.custom_name,
                            quantity: it.quantity || 1,
                            unit: it.serving_unit || 'portion',
                            calories: it.calories_snapshot || it.calories || 0,
                            protein: it.protein_snapshot || it.protein || 0,
                            carbs: it.carbs_snapshot || it.carbs || 0,
                            fats: it.fats_snapshot || it.fats || 0,
                            image: it.food_image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
                            description: it.food_description,
                            benefits: it.food_benefits,
                        }))
                    };
                });
        }

        return [];
    };

    const todaysSlots = getTodaysSlots();

    return (
        <div className={`diet-page-container ${!isLoggedIn ? 'blur-mode' : ''}`}>

            {/* --- 1. PREMIUM FILTER & SETUP BAR --- */}
            <header className="premium-filter-bar glass-panel">
                <div className="filter-group">
                    <label>Goal <span title="Locked to Profile">🔒</span></label>
                    <div className="custom-select-wrapper locked">
                        <select
                            value={selectedGoal}
                            disabled={true}
                            style={{ opacity: 0.7, cursor: 'not-allowed' }}
                        >
                            {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>

                <div className="divider"></div>

                <div className="filter-group">
                    <label>Diet Type</label>
                    <select
                        value={dietType}
                        onChange={(e) => handleDietTypeChange(e.target.value)}
                    >
                        {DIET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="divider"></div>

                <div className="filter-group">
                    <label>Weekly Budget</label>
                    <select
                        className="budget-select"
                        value={budgetLevel}
                        onChange={(e) => handleBudgetChange(e.target.value)}
                    >
                        {BUDGET_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                </div>

                <div className="divider"></div>

                {/* Regenerate Plan Button */}
                <div className="regenerate-group">
                    <button
                        type="button"
                        className="regen-plan-btn"
                        onClick={handleRegeneratePlan}
                        disabled={isRegenerating || isLoading}
                        title="Regenerate your weekly meal plan"
                    >
                        {isRegenerating ? "🔄 Regenerating..." : "⚡ Regenerate Plan"}
                    </button>
                </div>
            </header>

            {/* Allergies & Dislikes Bar */}
            <section className="diet-preferences-bar glass-card">
                {/* Allergies Row */}
                <div className="pref-row">
                    <div className="pref-label-col">
                        <span className="pref-title">🛡️ Allergies:</span>
                    </div>
                    <div className="pref-chips-col">
                        {/* Quick Selection Chips */}
                        {QUICK_ALLERGENS.map(allergen => {
                            const isSelected = allergies.some(a => a.toLowerCase() === allergen.toLowerCase());
                            return (
                                <button
                                    key={allergen}
                                    type="button"
                                    className={`pref-chip ${isSelected ? 'pref-chip-active' : ''}`}
                                    onClick={() => handleToggleAllergy(allergen)}
                                >
                                    {isSelected ? '✓ ' : '+ '} {allergen}
                                </button>
                            );
                        })}

                        {/* Custom Allergies list */}
                        {allergies.filter(a => !QUICK_ALLERGENS.some(q => q.toLowerCase() === a.toLowerCase())).map(a => (
                            <span key={a} className="custom-tag">
                                {a}
                                <button type="button" onClick={() => handleRemoveAllergy(a)}>✕</button>
                            </span>
                        ))}

                        {/* Free text input */}
                        <div className="custom-chip-input-wrap">
                            <input
                                type="text"
                                placeholder="Add allergy..."
                                value={customAllergy}
                                onChange={(e) => setCustomAllergy(e.target.value)}
                                onKeyDown={handleAddCustomAllergy}
                            />
                            <button type="button" onClick={handleAddCustomAllergy}>+</button>
                        </div>
                    </div>
                </div>

                {/* Dislikes Row */}
                <div className="pref-row" style={{ marginTop: '12px' }}>
                    <div className="pref-label-col">
                        <span className="pref-title">🚫 Dislikes:</span>
                    </div>
                    <div className="pref-chips-col">
                        {dislikes.map(d => (
                            <span key={d} className="custom-tag dislike-tag">
                                {d}
                                <button type="button" onClick={() => handleRemoveDislike(d)}>✕</button>
                            </span>
                        ))}
                        <div className="custom-chip-input-wrap">
                            <input
                                type="text"
                                placeholder="Add food dislike (e.g. Karela, Mushroom)..."
                                value={customDislike}
                                onChange={(e) => setCustomDislike(e.target.value)}
                                onKeyDown={handleAddCustomDislike}
                            />
                            <button type="button" onClick={handleAddCustomDislike}>+</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Target Macros Badge */}
            <div className="targets-summary-pill">
                <span>🎯 Daily Target: </span>
                <strong>{targets.calories || 2000} kcal</strong> •
                <span> {targets.protein || 120}g Protein</span> •
                <span> {targets.carbs || 220}g Carbs</span> •
                <span> {targets.fats || 60}g Fats</span> •
                <span> {targets.water || 8} Glasses Water</span>
            </div>

            {/* --- 2. MAIN DASHBOARD --- */}
            <div className="diet-dashboard-grid">

                {/* LEFT COL: Stats & Smart Box */}
                <div className="dashboard-left">
                    {/* Live Summary & Water Tracker */}
                    <div className="stats-row">
                        <div className="stats-card glass-card">
                            <DailyDietSummary
                                summary={dailySummary}
                                onRefresh={refreshSummaryOnly}
                                refreshTrigger={refreshTrigger}
                            />
                        </div>
                    </div>

                    {/* AI COMPANION SMART BOX */}
                    <div className="smart-box-wrapper glass-card glow-border">
                        <DietSmartBox key={weeklyPlan ? 'plan-loaded' : 'loading'} />
                    </div>
                </div>

                {/* RIGHT COL: Logger & Today's Meals */}
                <div className="dashboard-right">
                    {/* NUTRITION LOGGER */}
                    <div className="logger-card glass-card">
                        <NutritionLogger onLogSuccess={refreshSummaryOnly} />
                    </div>

                    {/* TODAY'S RECOMMENDED MEALS */}
                    <div className="todays-plan-preview glass-card">
                        <div className="plan-preview-header">
                            <h4>🍽️ Recommended for Today</h4>
                            <span className="preview-date-badge">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
                        </div>

                        {todaysSlots.length === 0 ? (
                            <p className="empty-msg">No meals scheduled for today. Tap "Regenerate Plan" above!</p>
                        ) : (
                            <div className="slots-grid">
                                {todaysSlots.map((slot, index) => {
                                    const firstItem = slot.items && slot.items[0];
                                    const mealForCard = {
                                        id: `slot-${index}-${slot.period || slot.name}`,
                                        name: slot.name,
                                        type: slot.time || slot.name,
                                        period: slot.period,
                                        calories: slot.calories,
                                        protein: slot.protein,
                                        carbs: slot.carbs,
                                        fat: slot.fats,
                                        items: slot.items || [],
                                        image: (firstItem && firstItem.image) || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
                                        description: firstItem ? firstItem.description : null,
                                        benefits: firstItem ? firstItem.benefits : [],
                                    };

                                    return (
                                        <MealCard
                                            key={mealForCard.id}
                                            meal={mealForCard}
                                            isEaten={slot.is_eaten}
                                            onToggleEaten={(period, nextState) => handleToggleSlotEaten(period, nextState)}
                                            onClick={() => {
                                                if (firstItem) {
                                                    setSelectedMeal({
                                                        ...firstItem,
                                                        type: slot.name,
                                                        slotPeriod: slot.period || slot.name.toLowerCase()
                                                    });
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* --- MEAL DETAIL / DEEP DIVE MODAL --- */}
            {selectedMeal && (
                <MealModal
                    meal={selectedMeal}
                    onClose={() => setSelectedMeal(null)}
                    onReplaceClick={() => {
                        handleOpenReplace(selectedMeal);
                    }}
                />
            )}

            {/* --- FOOD REPLACEMENT SEARCH MODAL (BOTTOM SHEET ON MOBILE) --- */}
            {isSearchOpen && (
                <FoodSearchModal
                    onClose={() => {
                        setIsSearchOpen(false);
                        setSelectedSlotForReplace(null);
                    }}
                    onSelect={(food) => handleSelectFoodReplacement(food)}
                    onSmartReplace={async (opt) => {
                        // Smart replace triggers food search for category
                        console.log("Smart replace option:", opt);
                    }}
                />
            )}

            {/* --- LOGIN OVERLAY --- */}
            {!isLoggedIn && (
                <div className="login-overlay-glass">
                    <div className="login-modal-glass">
                        <span className="lock-emoji">🔒</span>
                        <h2>Unlock Your Personal Diet Plan</h2>
                        <p>Sign in to generate customized Indian meal plans, track hydration, and log daily nutrition.</p>
                        <button onClick={() => navigate('/auth?tab=login')}>Login Now</button>
                    </div>
                </div>
            )}

            {/* LOADING OVERLAY */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Optimizing your diet plan within {budgetLevel} budget...</p>
                </div>
            )}

        </div>
    );
};

export default DietSection;
