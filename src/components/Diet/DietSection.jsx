import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WeeklyDiet from './WeeklyDiet';
import MealModal from './MealModal';
import GroceryList from './GroceryList';
import { dietData } from './dietData';
import fittyVoice from '../../utils/fittyVoice';
import './DietSection.css';

const GOALS = ["Fat Loss", "Muscle Gain", "Maintenance"];
const DIET_TYPES = ["Veg", "Non-Veg"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FILTERS = ["All", "High Protein", "Vegan", "Low Carb", "Keto"];

const DietSection = () => {
    const navigate = useNavigate();
    const synth = window.speechSynthesis;

    // State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Wizard State
    const [step, setStep] = useState(1); // 1: Goal, 2: Diet Type, 3: Plan
    const [selectedGoal, setSelectedGoal] = useState("");
    const [selectedDietType, setSelectedDietType] = useState("");

    const [currentDay, setCurrentDay] = useState("Monday");
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedMeal, setSelectedMeal] = useState(null);

    const [greeting, setGreeting] = useState("");
    const [waterIntake, setWaterIntake] = useState(0);

    // Greeting & Initial Setup
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const loggedInStatus = !!token;
        setIsLoggedIn(loggedInStatus);

        // Greeting Logic
        const hour = new Date().getHours();
        let greet = "Hello!";
        if (hour < 12) greet = "Good Morning ☀️";
        else if (hour < 17) greet = "Good Afternoon 🌤";
        else greet = "Good Evening 🌙";

        setGreeting(greet);

        // Initial Voice Greeting (Only if just loaded and user interaction policy allows - safe call)
        if (loggedInStatus && step === 1) {
            speak(greet + " Welcome to your diet planner. Please select your fitness goal.");
        }
    }, []);

    // Voice Function
    const speak = (text) => {
        fittyVoice.speak(text);
    };

    // Handlers
    const handleProtectedAction = (actionFn) => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
        } else {
            actionFn();
        }
    };

    const handleGoalSelect = (goal) => {
        setSelectedGoal(goal);
        // Motivational Message
        let msg = "";
        if (goal === "Fat Loss") msg = "Amazing! Let's burn those calories together.";
        if (goal === "Muscle Gain") msg = "Wow! Let's build some serious strength.";
        if (goal === "Maintenance") msg = "Great choice! Keeping it balanced is key.";

        speak(msg + " Now, are you Veg or Non-Veg?");
        setStep(2);
    };

    const handleDietTypeSelect = (type) => {
        setSelectedDietType(type);
        speak(`Perfect. Generating your ${type} ${selectedGoal} plan.`);
        setStep(3);
    };

    const addWater = () => {
        setWaterIntake(prev => prev + 1);
        // Encouragement every 4 glasses
        if ((waterIntake + 1) % 4 === 0) {
            speak("Great hydration! Keep drinking water.");
        }
    };

    // Get relevant meals
    const goalData = dietData[selectedGoal] || {};
    const dietTypeData = goalData[selectedDietType] || [];
    const dayData = dietTypeData.find(d => d.day === currentDay) || { meals: [] };

    // Filter meals
    const displayedMeals = dayData.meals.filter(meal => {
        if (activeFilter === "All") return true;
        return meal.tags && meal.tags.includes(activeFilter);
    });

    return (
        <div className={`diet-container ${!isLoggedIn ? 'restricted' : ''}`}>

            {/* 1. Greeting Box */}
            {isLoggedIn && (
                <div className="greeting-box animate-fade-in">
                    <h2>{greeting}</h2>
                    <p className="motivational-text">
                        {selectedGoal && `Goal: ${selectedGoal}`}
                        {!selectedGoal && "Let's start your journey!"}
                    </p>
                </div>
            )}

            {/* --- WIZARD FLOW --- */}

            {/* Step 1: Goal Selection */}
            {step === 1 && (
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

            {/* Step 2: Diet Type Selection */}
            {step === 2 && (
                <div className="wizard-step animate-slide-up">
                    <button className="back-btn-small" onClick={() => setStep(1)}>← Back</button>
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

            {/* Step 3: The PLAN */}
            {step === 3 && (
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

                    {/* Filters */}
                    <div className="tag-filters">
                        {FILTERS.map(filter => (
                            <button
                                key={filter}
                                className={`filter-tag ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Meals Grid */}
                    <WeeklyDiet
                        meals={displayedMeals}
                        onMealClick={(meal) => setSelectedMeal(meal)}
                    />

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
            {selectedMeal && (
                <MealModal
                    meal={selectedMeal}
                    onClose={() => setSelectedMeal(null)}
                />
            )}

        </div>
    );
};

export default DietSection;
