import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MealModal from './MealModal';
import FoodSearchModal from './FoodSearchModal';
import DietSmartBox from './SmartBox/DietSmartBox';
import NutritionLogger from './NutritionLogger';
import { fetchDietPlan, updateDietProfile, replaceMeal, fetchDietProfile } from '../../services/dietService';
import fittyVoice from '../../utils/fittyVoice';
import DailyDietSummary from './DailyDietSummary'; // Re-integrated
import './DietSection.css';

const GOALS = ["Weight Loss", "Muscle Gain", "Maintenance"];
const DIET_TYPES = ["Veg", "Non-Veg", "Vegan", "Egg"];
const BUDGET_RANGES = ["₹100 - ₹500", "₹500 - ₹1000", "₹1000 - ₹2000", "Premium (₹2000+)"];

const DietSection = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Filter State
    const [selectedGoal, setSelectedGoal] = useState("Weight Loss");
    const [dietType, setDietType] = useState("Veg");
    const [budgetRange, setBudgetRange] = useState("₹500 - ₹1000");

    // Data State
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [targets, setTargets] = useState({ calories: 2000, protein: 150 });
    const [currentDay, setCurrentDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

    // Modals
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Initial Load
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setIsLoggedIn(true);
            loadData();
        }
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Parallel Fetch
            const [planData, profileData] = await Promise.all([
                fetchDietPlan(),
                fetchDietProfile()
            ]);

            // Set Plan
            if (planData.plan) {
                setWeeklyPlan(planData.plan);
                setTargets(planData.targets || { calories: 2000, protein: 100 });
            } else {
                setWeeklyPlan(planData);
            }

            // Set Profile (GoalLocked)
            if (profileData) {
                if (profileData.goal) setSelectedGoal(profileData.goal);
                if (profileData.diet_type) setDietType(profileData.diet_type);
                // Budget might be defaulted or customized here later
            }

        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Kept for manual refresh if needed
    const loadUserPlan = async () => {
        const data = await fetchDietPlan();
        if (data.plan) setWeeklyPlan(data.plan);
    };

    // Filter Handlers
    const handleFilterChange = async (key, value) => {
        if (!isLoggedIn) return setShowLoginPrompt(true);

        // Update local state
        if (key === 'goal') return; // Goal is locked
        if (key === 'type') setDietType(value);
        if (key === 'budget') setBudgetRange(value);

        // Debounce or immediate update? Let's do immediate for 'wow' factor but show loading
        setIsLoading(true);
        try {
            // Mapping numeric range to backend "Budget Level" (Low/Medium/High)
            // Backend expects: budget_level
            let budgetLevel = "Medium";
            if (value.includes("100")) budgetLevel = "Low";
            if (value.includes("2000")) budgetLevel = "High";

            await updateDietProfile({
                goal: selectedGoal, // Always send locked goal
                diet_type: key === 'type' ? value : dietType,
                budget_level: budgetLevel,
                // We could send the exact range string if backend supports it later
                budget_range_text: key === 'budget' ? value : budgetRange
            });
            await loadUserPlan();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- RENDER HELPERS ---
    const getMealsForDay = () => {
        if (!weeklyPlan) return [];
        const dayKey = currentDay.toLowerCase();
        const dailySlots = weeklyPlan[dayKey];
        if (!dailySlots) return [];

        return dailySlots.flatMap((slot, index) => {
            return slot.items.map((item, i) => ({
                id: `${currentDay}-${slot.name}-${i}`,
                food_id: item.food_item_id,
                type: slot.name,
                name: item.food_name || item.custom_name,
                calories: Number(item.calories) || 0,
                protein: Number(item.protein) || 0,
                image: item.food_image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
            }));
        });
    };

    const todaysMeals = getMealsForDay();

    return (
        <div className={`diet-page-container ${!isLoggedIn ? 'blur-mode' : ''}`}>

            {/* --- 1. PREMIUM FILTER BAR --- */}
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
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        {DIET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="divider"></div>

                <div className="filter-group">
                    <label>Weekly Budget</label>
                    <select
                        className="budget-select"
                        value={budgetRange}
                        onChange={(e) => handleFilterChange('budget', e.target.value)}
                    >
                        {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
            </header>

            {/* --- 2. MAIN DASHBOARD --- */}
            <div className="diet-dashboard-grid">

                {/* LEFT COL: Stats & Smart Box */}
                <div className="dashboard-left">

                    {/* QUICK STATS RINGS */}
                    <div className="stats-row">
                        {/* Re-using DailyDietSummary but wrapped nicely */}
                        <div className="stats-card glass-card">
                            <DailyDietSummary
                                meals={todaysMeals}
                                targets={targets}
                            />
                        </div>
                    </div>

                    {/* AI COLPANION */}
                    <div className="smart-box-wrapper glass-card glow-border">
                        <DietSmartBox key={weeklyPlan ? 'plan-loaded' : 'loading'} />
                    </div>

                </div>

                {/* RIGHT COL: Logger & Quick Actions */}
                <div className="dashboard-right">

                    {/* NUTRITION LOGGER */}
                    <div className="logger-card glass-card">
                        <NutritionLogger onLogSuccess={loadUserPlan} />
                    </div>

                    {/* FUTURE: Meal List or "What's Next" could go here */}
                    <div className="todays-plan-preview glass-card">
                        <h4>🍽️ Recommended for Today</h4>
                        <div className="mini-meal-list">
                            {todaysMeals.slice(0, 3).map((m, i) => (
                                <div key={i} className="mini-meal-row">
                                    <img src={m.image} alt="food" />
                                    <div>
                                        <span>{m.name}</span>
                                        <small>{m.type} • {m.calories} cal</small>
                                    </div>
                                </div>
                            ))}
                            {todaysMeals.length === 0 && <p className="empty-msg">Generating your plan...</p>}
                        </div>
                    </div>

                </div>

            </div>

            {/* --- LOGIN OVERLAY --- */}
            {!isLoggedIn && (
                <div className="login-overlay-glass">
                    <div className="login-modal-glass">
                        <span className="lock-emoji">🔒</span>
                        <h2>Unlock Your Personal Diet Plan</h2>
                        <button onClick={() => navigate('/auth?tab=login')}>Login Now</button>
                    </div>
                </div>
            )}

            {/* LOADING OVERLAY */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Optimizing your plan within {budgetRange}...</p>
                </div>
            )}

        </div>
    );
};

export default DietSection;
