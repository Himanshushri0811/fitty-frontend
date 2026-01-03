import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Workout.css";

// ------------------- MOCK DATA -------------------
const WORKOUT_PLANS = {
  "Muscle Building": [
    {
      day: "Mon",
      focus: "Chest & Triceps",
      icon: "💪",
      exercises: [
        { id: 1, name: "Bench Press", sets: "4", reps: "8-12", rest: "90s", difficulty: "Hard", animation: "/animations/bench-press.json", description: "Primary compound movement for chest development. Keep elbows at 45 degrees." },
        { id: 2, name: "Incline Press", sets: "3", reps: "10-12", rest: "60s", difficulty: "Medium", animation: "/animations/incline-press.json", description: "Targets upper chest fibers. Control the negative." },
        { id: 3, name: "Tricep Pushdowns", sets: "3", reps: "12-15", rest: "60s", difficulty: "Medium", animation: "/animations/pushdown.json", description: "Isolate lateral head of triceps. Keep elbows tucked." },
      ],
    },
    {
      day: "Tue",
      focus: "Back & Biceps",
      icon: "🔥",
      exercises: [
        { id: 5, name: "Deadlift", sets: "4", reps: "5-8", rest: "120s", difficulty: "Hard", animation: "/animations/deadlift.json", description: "Full body compound. Keep back straight and core tight." },
        { id: 6, name: "Pull Ups", sets: "3", reps: "AMRAP", rest: "90s", difficulty: "Medium", animation: "/animations/pullup.json", description: "Vertical pull for lat width. Full range of motion." },
      ],
    },
    { day: "Wed", focus: "Rest & Mobility", icon: "🧘", exercises: [] },
    {
      day: "Thu", focus: "Shoulders & Abs", icon: "🥥", exercises: [
        { id: 11, name: "Overhead Press", sets: "4", reps: "6-8", rest: "90s", difficulty: "Hard", animation: "/animations/ohp.json", description: "Vertical press for shoulders." }
      ]
    },
    {
      day: "Fri", focus: "Legs", icon: "🦵", exercises: [
        { id: 15, name: "Squats", sets: "4", reps: "6-10", rest: "120s", difficulty: "Hard", animation: "/animations/squat.json", description: "King of leg exercises." }
      ]
    },
    { day: "Sat", focus: "Cardio", icon: "🏃", exercises: [] },
    { day: "Sun", focus: "Rest", icon: "🛌", exercises: [] },
  ],
  "Fat Loss": [
    {
      day: "Mon",
      focus: "Full Body Circuit",
      icon: "⚡",
      exercises: [
        { id: 101, name: "Burpees", sets: "4", reps: "20", rest: "30s", difficulty: "Hard", animation: "/animations/burpees.json", description: "Metabolic conditioning." },
        { id: 102, name: "Kettlebell Swings", sets: "4", reps: "20", rest: "45s", difficulty: "Medium", animation: "/animations/kb-swing.json", description: "Posterior chain power." },
      ],
    },
    { day: "Tue", focus: "HIIT Cardio", icon: "🔥", exercises: [] },
    { day: "Wed", focus: "Active Recovery", icon: "🧘", exercises: [] },
    { day: "Thu", focus: "Upper Body Burn", icon: "💪", exercises: [] },
    { day: "Fri", focus: "Lower Body Blast", icon: "🦵", exercises: [] },
    { day: "Sat", focus: "Long Run", icon: "🏃", exercises: [] },
    { day: "Sun", focus: "Rest", icon: "🛌", exercises: [] },
  ]
};

export default function Workout() {
  const navigate = useNavigate();
  const synth = window.speechSynthesis;

  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Wizard State: 1 = Goal Selection, 2 = Plan Display
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("");

  // Plan State
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeExercise, setActiveExercise] = useState(null);
  const [greeting, setGreeting] = useState("");

  // --- EFFECTS ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const status = !!token;
    setIsLoggedIn(status);

    // Initial Greeting
    const hour = new Date().getHours();
    let timeGreet = "Hello";
    if (hour < 12) timeGreet = "Good Morning";
    else if (hour < 17) timeGreet = "Good Afternoon";
    else timeGreet = "Good Evening";

    setGreeting(`${timeGreet}, Champion! 🏋️`);

    // Voice Intro if logged in
    if (status && step === 1) {
      speak(`${timeGreet}. Welcome to the Iron Temple. What is your training focus today?`);
    }
  }, []);

  // --- VOICE FUNCTION ---
  const speak = (text) => {
    if (synth.speaking) {
      synth.cancel();
    }
    const utterThis = new SpeechSynthesisUtterance(text);
    // Attempt to select a motivating voice
    const voices = synth.getVoices();
    // Prefer a deeper/authoritative voice if available, or just the default
    const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Male')) || voices[0];
    if (preferredVoice) utterThis.voice = preferredVoice;
    synth.speak(utterThis);
  };

  // --- HANDLERS ---
  const handleProtectedAction = (actionCallback) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
    } else {
      actionCallback();
    }
  };

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    // Motivational confirmation
    let msg = "";
    if (goal === "Muscle Building") msg = "Excellent choice. Let's build some serious mass. Moving to your weekly schedule.";
    else if (goal === "Fat Loss") msg = "Time to shred. Intensity will be high. Loading your circuit plan.";

    speak(msg);
    setSelectedDayIndex(0);
    setStep(2);
  };

  const handleStartWorkout = () => {
    speak("Starting session. Redirecting to AI Posture Corrector. Stay focused.");
    handleProtectedAction(() => {
      navigate('/posture');
    });
  };

  const handleDayClick = (index) => {
    handleProtectedAction(() => setSelectedDayIndex(index));
  };

  // --- DERIVED DATA ---
  const currentPlan = WORKOUT_PLANS[selectedGoal] || WORKOUT_PLANS["Muscle Building"];
  const currentDay = currentPlan[selectedDayIndex];

  return (
    <div className={`workout-container ${!isLoggedIn ? 'restricted-mode' : ''}`}>

      {/* 1. GREETING BOX (Visible only in Step 2 or if logged in) */}
      {isLoggedIn && (
        <div className="greeting-box animate-fade-in">
          <h2>{greeting}</h2>
          <p className="motivational-text">
            {selectedGoal ? `Focus: ${selectedGoal}` : "Ready to dominate?"}
          </p>
        </div>
      )}

      {/* --- WIZARD: STEP 1 (GOAL SELECTION) --- */}
      {step === 1 && (
        <div className="wizard-step animate-slide-up">
          <h1 className="step-title">Choose Your Battlefield ⚔️</h1>
          <div className="goal-options-large">
            {Object.keys(WORKOUT_PLANS).map(goal => (
              <button
                key={goal}
                className="big-option-btn card-glass"
                onClick={() => handleProtectedAction(() => handleGoalSelect(goal))}
              >
                <span className="goal-icon-large">{goal === "Muscle Building" ? "💪" : "🔥"}</span>
                {goal}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- WIZARD: STEP 2 (WEEKLY PLAN) --- */}
      {step === 2 && (
        <div className="plan-dashboard animate-slide-up">

          <div className="plan-header-actions">
            <button className="back-btn-small" onClick={() => setStep(1)}>← Change Goal</button>
          </div>

          {/* WEEKLY GRID (Horizontal Scroll) */}
          <div className="weekly-grid">
            {currentPlan.map((dayData, index) => (
              <div
                key={dayData.day}
                className={`day-card ${index === selectedDayIndex ? 'active' : ''}`}
                onClick={() => handleDayClick(index)}
              >
                <div className="day-icon">{dayData.icon}</div>
                <div className="day-info">
                  <h3>{dayData.day}</h3>
                  <span>{dayData.focus}</span>
                </div>
                {!isLoggedIn && <div className="lock-icon">🔒</div>}
              </div>
            ))}
          </div>

          {/* ACTIVE DAY EXERCISES */}
          <div className="exercise-section card-glass">
            <div className="section-title">
              <div className="title-left">
                <h2>{currentDay.day} — {currentDay.focus}</h2>
                <span className="exercise-count">{currentDay.exercises.length} Exercises</span>
              </div>
              <button className="start-workout-btn pulse-glow" onClick={handleStartWorkout}>
                Start Session 🚀
              </button>
            </div>

            {currentDay.exercises.length > 0 ? (
              <div className="exercise-list">
                {currentDay.exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="exercise-item"
                    onClick={() => handleProtectedAction(() => setActiveExercise(exercise))}
                  >
                    <div className="ex-content">
                      <h4 className="ex-name">{exercise.name}</h4>
                      <div className="ex-meta">
                        <span className="tag sets">{exercise.sets} Sets</span>
                        <span className="tag reps">{exercise.reps} Reps</span>
                        <span className="tag difficulty">{exercise.difficulty}</span>
                      </div>
                    </div>
                    <div className="ex-arrow">ℹ️</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Rest & Recovery. Stretch, Hydrate, Repeat. 🧘</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* LOGIN PROMPT (Glass Overlay) */}
      {!isLoggedIn && (
        <div className="login-overlay-glass">
          <div className="login-modal-glass">
            <span className="lock-emoji">🔒</span>
            <h2>Unlock Pro Workouts</h2>
            <p>Sign in to access elite training schedules and AI posture correction.</p>
            <button className="login-btn-glass" onClick={() => navigate('/auth?tab=login')}>Login Now</button>
          </div>
        </div>
      )}

      {/* EXERCISE MODAL */}
      {activeExercise && (
        <div className="modal-overlay" onClick={() => setActiveExercise(null)}>
          <div className="modal-content glass-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setActiveExercise(null)}>&times;</button>
            <div className="modal-header">
              <h3>{activeExercise.name}</h3>
              <span className={`difficulty-badge ${activeExercise.difficulty.toLowerCase()}`}>
                {activeExercise.difficulty}
              </span>
            </div>

            <div className="modal-body">
              {/* Animation Placeholder */}
              <div className="animation-placeholder">
                <div className="pulse-circle"></div>
                <span>Anim: {activeExercise.animation ? "Ready" : "N/A"}</span>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Sets</label> <strong>{activeExercise.sets}</strong>
                </div>
                <div className="detail-item">
                  <label>Reps</label> <strong>{activeExercise.reps}</strong>
                </div>
                <div className="detail-item">
                  <label>Rest</label> <strong>{activeExercise.rest}</strong>
                </div>
              </div>

              <div className="description-box">
                <h4>Technique Focus</h4>
                <p>{activeExercise.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
