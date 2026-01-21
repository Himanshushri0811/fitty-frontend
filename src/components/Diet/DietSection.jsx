import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WeeklyDiet from './WeeklyDiet';
import MealModal from './MealModal';
import GroceryList from './GroceryList';
import FoodSearchModal from './FoodSearchModal';
import DailyDietSummary from './DailyDietSummary';
import { fetchDietPlan, updateDietProfile, replaceMeal } from '../../services/dietService';
import fittyVoice from '../../utils/fittyVoice';
import './DietSection.css';

const GOALS = ["Weight Loss", "Muscle Gain", "Maintenance"];
const DIET_TYPES = ["Veg", "Non-Veg"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FILTERS = ["All", "High Protein", "Vegan", "Low Carb"];

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

    // Wizard State
    const [step, setStep] = useState(1);
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
                type: slot.name, // "Breakfast"
                name: item.food_name || item.custom_name,
                calories: item.calories || 0,
                protein: item.protein || 0,
                carbs: item.carbs || 0,
                fat: item.fats || 0,
                image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80", // Placeholder
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

            {/* 1. Greeting Box */}
            {isLoggedIn && (
                <div className="greeting-box animate-fade-in">
                    <h2>{greeting}</h2>
                    <p className="motivational-text">
                        {step === 4 ? "Your personalized plan is ready!" : "Let's start your journey!"}
                    </p>
                </div>
            )}

            {/* --- WIZARD THIS --- */}
            {isLoading && <div className="loading-spinner">Loading your plan...</div>}

            {/* Step 1: Goal Selection */}
            {!isLoading && step === 1 && (
                <div className="wizard-step animate-slide-up">
                    <h2 className="step-title">What is your primary goal? 🎯</h2>
                    <div className="goal-options-large">
                        {GOALS.map(goal => (
                            <button
                                key={goal}
                                className="big-option-btn"
                                onClick={() => handleProtectedAction(() => handleGoalSelect(goal))}
                            >
                                {goal}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Budget Selection */}
            {!isLoading && step === 2 && (
                <div className="wizard-step animate-slide-up">
                    <button className="back-btn-small" onClick={() => setStep(1)}>← Back</button>
                    <h2 className="step-title">What is your weekly budget? 💰</h2>
                    <div className="goal-options-large">
                        {["Low", "Medium", "High"].map(b => (
                            <button
                                key={b}
                                className="big-option-btn"
                                onClick={() => {
                                    setBudget(b);
                                    setStep(3);
                                    speak(`Got it. ${b} budget.`);
                                }}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Diet Type Selection */}
            {!isLoading && step === 3 && (
                <div className="wizard-step animate-slide-up">
                    <button className="back-btn-small" onClick={() => setStep(2)}>← Back</button>
                    <h2 className="step-title">Diet Preference 🥗🍖</h2>
                    <div className="goal-options-large">
                        {DIET_TYPES.map(type => (
                            <button
                                key={type}
                                className="big-option-btn"
                                onClick={() => handleDietTypeSelect(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 4: The PLAN */}
            {!isLoading && step === 4 && (
                <div className="plan-dashboard animate-fade-in">

                    {/* Header Actions */}
                    <div className="plan-header-actions">
                        <button className="reset-btn" onClick={() => { setStep(1); setSelectedGoal(""); }}>Change Goal</button>

                        {/* Water Tracker Mini */}
                        <div className="water-tracker">
                            <span className="water-icon">💧</span>
                            <span className="water-count">{waterIntake} Glasses</span>
                            <button className="add-water-btn" onClick={addWater}>+</button>
                        </div>
                    </div>

                    {/* Day Selector */}
                    <div className="day-selector">
                        {DAYS.map(day => (
                            <button
                                key={day}
                                className={`day-btn ${currentDay === day ? 'active' : ''}`}
                                onClick={() => handleProtectedAction(() => setCurrentDay(day))}
                            >
                                {day.substring(0, 3)}
                            </button>
                        ))}
                    </div>

                    {/* Daily Summary */}
                    <DailyDietSummary meals={displayedMeals} targets={targets} />



                    {/* Filters */}
                    {/* <div className="tag-filters">...</div> */}

                    {/* Meals Grid */}
                    {displayedMeals.length > 0 ? (
                        <WeeklyDiet
                            meals={displayedMeals}
                            onMealClick={(meal) => setSelectedMeal(meal)}
                        />
                    ) : (
                        <div className="empty-state">
                            <p>No meals found for this day. Try generating a new plan.</p>
                        </div>
                    )}

                    {/* Grocery List */}
                    <GroceryList plan={dayData} />

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
