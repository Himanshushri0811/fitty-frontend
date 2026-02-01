import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MealModal from './MealModal';
import FoodSearchModal from './FoodSearchModal';
import DietSmartBox from './SmartBox/DietSmartBox';
import NutritionLogger from './NutritionLogger';
import { fetchDietPlan, updateDietProfile, replaceMeal } from '../../services/dietService';
import fittyVoice from '../../utils/fittyVoice';
import './DietSection.css';

const GOALS = ["Weight Loss", "Muscle Gain", "Maintenance"];
const DIET_TYPES = ["Veg", "Non-Veg"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FILTERS = ["All", "High Protein", "Vegan", "Low Carb"];

/* INLINE CSS FOR GOAL SWITCHER (Adding to DietSection.css ideally, but user file map shows css is imported. 
   I will add these styles to SmartBox.css or DietSection.css? 
   The user context provided access to 'd:\demo_project\FITMITRA\Frontent\src\components\Diet\SmartBox\SmartBox.css'. 
   I'll edit SmartBox.css since it is open and related to the dashboard view.
*/

const DietSection = () => {
    const navigate = useNavigate();

    // Get today's day name
    const now = new Date();
    const systemDay = now.getDay(); // 0: Sun, 1: Mon...
    const todayName = DAYS[(systemDay + 6) % 7];

    // State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Wizard State (Deprecated, Default to Dashboard=4)
    const [step, setStep] = useState(4);
    const [selectedGoal, setSelectedGoal] = useState("");
    const [budget, setBudget] = useState("Medium");

    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [currentDay, setCurrentDay] = useState(todayName);
    const [activeFilter, setActiveFilter] = useState("All");

    // Modals
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const [greeting, setGreeting] = useState("");
    const [waterIntake, setWaterIntake] = useState(0);

    // Greeting & Initial Setup
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const loggedInStatus = !!token;
        setIsLoggedIn(loggedInStatus);

        const hour = now.getHours();
        let greet = "Hello!";
        if (hour < 12) greet = "Good Morning ☀️";
        else if (hour < 17) greet = "Good Afternoon 🌤";
        else greet = "Good Evening 🌙";
        setGreeting(greet);

        if (loggedInStatus) {
            loadUserPlan();
        }
    }, [step]); // Re-fetch when step resets

    const [targets, setTargets] = useState({ calories: 2000, protein: 150 });

    const loadUserPlan = async () => {
        setIsLoading(true);
        try {
            const data = await fetchDietPlan();
            // Handle both old format (array/obj) and new format ({plan, targets})
            if (data.plan) {
                setWeeklyPlan(data.plan);
                setTargets(data.targets);
            } else {
                setWeeklyPlan(data); // Fallback
            }

            if (data.plan || data) {
                setStep(4);
            }
        } catch (error) {
            console.log("No existing plan found or error", error);
            // Handle Session Expiry or Invalid Token
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem('access_token');
                setIsLoggedIn(false);
                setShowLoginPrompt(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const speak = (text) => {
        fittyVoice.speak(text);
    };

    const handleProtectedAction = (actionFn) => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
        } else {
            actionFn();
        }
    };

    const handleGoalSelect = (goal) => {
        setSelectedGoal(goal);
        let msg = "";
        if (goal === "Weight Loss") msg = "Amazing! Let's burn those calories together.";
        if (goal === "Muscle Gain") msg = "Wow! Let's build some serious strength.";
        if (goal === "Maintenance") msg = "Great choice! Keeping it balanced is key.";
        speak(msg + " Now, are you Veg or Non-Veg?");
        setStep(2);
    };

    const handleDietTypeSelect = async (type) => {
        // Submit Profile
        setIsLoading(true);
        try {
            await updateDietProfile({
                goal: selectedGoal,
                diet_type: type,
                budget_level: budget
            });
            speak(`Perfect. Generating your ${type} ${selectedGoal} plan with ${budget} budget.`);
            await loadUserPlan(); // Reload to get the generated plan
        } catch (err) {
            alert("Failed to create plan. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const addWater = () => {
        setWaterIntake(prev => prev + 1);
        if ((waterIntake + 1) % 4 === 0) {
            speak("Great hydration! Keep drinking water.");
        }
    };

    // --- DASHBOARD HANDLERS ---
    const handleGoalChangeDashboard = async (newGoal) => {
        if (!isLoggedIn) return setShowLoginPrompt(true);
        setSelectedGoal(newGoal);
        setIsLoading(true);
        try {
            // Need to get current diet type or assume from state
            const type = activeFilter === "All" ? "Veg" : activeFilter;
            await updateDietProfile({ goal: newGoal, diet_type: type, budget_level: budget });
            await loadUserPlan(); // This will refresh the SmartBox too via key change
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleDietTypeChangeDashboard = async (newType) => {
        if (!isLoggedIn) return setShowLoginPrompt(true);
        setActiveFilter(newType); // Hack: Using activeFilter to store type for now
        setIsLoading(true);
        try {
            await updateDietProfile({ goal: selectedGoal || "Weight Loss", diet_type: newType, budget_level: budget });
            await loadUserPlan();
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };


    // --- MEAL HANDLING ---

    const handleReplaceMealClick = () => {
        // Close detail modal, open search modal
        // We need to keep track of which meal we are replacing.
        // selectedMeal has id: "Monday-Breakfast-0"
        setIsSearchOpen(true);
    };

    const handleReplacement = async (payload) => {
        // Shared logic for both Manual and Smart replacement
        // payload: { food_id } OR { replace_mode }
        if (!selectedMeal) return;

        const [day, period, idxStr] = selectedMeal.id.split('-');
        setIsLoading(true);
        try {
            const result = await replaceMeal({
                day,
                period,
                index: parseInt(idxStr),
                ...payload
            });

            // Refresh plan
            await loadUserPlan(); // This will fetch the updated plan
            setIsSearchOpen(false);
            setSelectedMeal(null);

            if (result.reason) {
                speak(result.reason); // "Switched to Oats Upma..."
            } else {
                speak(`Updated your meal successfully.`);
            }
        } catch (err) {
            alert("Failed to replace meal. " + (err.response?.data?.error || ""));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFoodSelect = (food) => {
        handleReplacement({ food_id: food.id });
    };

    const handleSmartReplace = (mode) => {
        handleReplacement({ replace_mode: mode });
    };


    // --- DATA PARSING ---
    // Backend returns { monday: [...], tuesday: [...] }
    let displayedMeals = [];
    let dayData = { meals: [] };

    // Safety check for case sensitivity (backend returns lower keys)
    const dayKey = currentDay.toLowerCase();

    if (weeklyPlan && weeklyPlan[dayKey]) {
        // Transform Backend API structure to UI structure
        const dailySlots = weeklyPlan[dayKey];

        // Map slots to UI meals
        const mappedMeals = dailySlots.flatMap((slot, index) => {
            return slot.items.map((item, i) => ({
                id: `${currentDay}-${slot.name}-${i}`,
                food_id: item.food_item_id, // For fetching Deep Dive
                type: slot.name, // "Breakfast"
                name: item.food_name || item.custom_name,
                calories: item.calories || 0,
                protein: item.protein || 0,
                carbs: item.carbs || 0,
                fat: item.fats || 0,
                image: item.food_image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80", // Placeholder
                tags: item.food_good_for || ["Healthy"],
                ingredients: item.food_name ? [item.food_name] : ["Custom Meal"],
                description: item.food_description,
                benefits: item.food_benefits,
                budget: item.food_budget,
                prepTime: "10 min"
            }));
        });

        dayData = { meals: mappedMeals };
        displayedMeals = mappedMeals.filter(meal => {
            if (activeFilter === "All") return true;
            return true;
        });
    }

    return (
        <div className={`diet-container ${!isLoggedIn ? 'restricted' : ''}`}>

            {/* --- DASHBOARD ALWAYS VISIBLE --- */}
            {isLoading && <div className="loading-spinner">Loading your updated plan...</div>}

            {/* Step 4: The PLAN (Now Default) */}
            {!isLoading && step === 4 && (
                <div className="plan-dashboard animate-fade-in">

                    {/* NEW: Goal Switcher */}
                    <div className="goal-switcher-container">
                        <select
                            className="goal-select"
                            value={selectedGoal || "Weight Loss"}
                            onChange={(e) => handleGoalChangeDashboard(e.target.value)}
                        >
                            {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>

                        <select
                            className="goal-select"
                            value={activeFilter === "All" ? "Veg" : activeFilter}
                            onChange={(e) => handleDietTypeChangeDashboard(e.target.value)}
                        >
                            {DIET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* NEW: AI SMART BOX */}
                    <DietSmartBox key={weeklyPlan ? weeklyPlan._id : 'default'} /> {/* Use plan ID or simple counter to force refresh */}

                    {/* Header Actions */}
                    <div className="plan-header-actions">
                        {/* Actions Removed */}
                    </div>

                    {/* Day Selector REMOVED */}
                    {/* Daily Summary REMOVED */}
                    {/* Meals Grid REMOVED */}
                    {/* Grocery List REMOVED */}

                    {/* NEW: Nutrition Logger */}
                    <NutritionLogger />

                </div>
            )}

            {/* Login Prompt Component */}
            {!isLoggedIn && (
                <div className="login-overlay-glass">
                    <div className="login-modal-glass">
                        <span className="lock-emoji">🔒</span>
                        <h2>Unlock Smart Diet</h2>
                        <p>Login to access AI-powered diet plans, voice tracking, and smart recipes.</p>
                        <button className="login-btn-glass" onClick={() => navigate('/auth?tab=login')}>Login Now</button>
                    </div>
                </div>
            )}

            {/* Meal Detail Modal */}
            {selectedMeal && !isSearchOpen && (
                <MealModal
                    meal={selectedMeal}
                    onClose={() => setSelectedMeal(null)}
                    onReplaceClick={handleReplaceMealClick} // Pass handler
                />
            )}

            {/* Search Modal */}
            {isSearchOpen && (
                <FoodSearchModal
                    onClose={() => setIsSearchOpen(false)}
                    onSelect={handleFoodSelect}
                    onSmartReplace={handleSmartReplace}
                />
            )}

        </div>
    );
};


export default DietSection;
