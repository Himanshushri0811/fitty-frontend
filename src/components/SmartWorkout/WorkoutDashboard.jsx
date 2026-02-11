import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, Calendar, Play, Sparkles, X, Eye, MessageSquare } from 'lucide-react';
import API from '../axiosConfig';
import { FIXED_WEEKLY_PLAN } from './standardPlan';
import './SmartWorkout.css';

const WorkoutDashboard = () => {
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(0);
    const [exerciseMap, setExerciseMap] = useState({});
    const [videoModal, setVideoModal] = useState({ show: false, url: '', title: '' });

    useEffect(() => {
        // Auto-Day Detection
        const jsDay = new Date().getDay();
        const tabIndex = jsDay === 0 ? 6 : jsDay - 1;
        setSelectedDay(tabIndex);

        fetchPlanAndData();
    }, []);

    const fetchPlanAndData = async () => {
        try {
            // Fetch backend exercises to get video URLs
            const res = await API.get('/api/workouts/exercises/');
            const map = {};
            res.data.forEach(ex => {
                map[ex.name] = ex.video_url; // Use name as key
            });
            setExerciseMap(map);

            // Use Fixed Standard Plan
            setPlan({
                name: "Fitty Pro Split",
                goal: "Muscle Building & Strength",
                days_per_week: 6,
                routines: FIXED_WEEKLY_PLAN
            });
        } catch (err) {
            console.error("Error loading data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoClick = (exName) => {
        const url = exerciseMap[exName];
        if (url) {
            setVideoModal({ show: true, url, title: exName });
        } else {
            alert("No demo video uploaded yet for this exercise.");
        }
    };

    if (loading) return <div className="loading-screen">Loading your plan...</div>;
    if (!plan) return null;

    const currentRoutine = plan.routines[selectedDay] || plan.routines[0];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>{plan.name}</h1>
                    <div className="plan-stats">
                        <span><Calendar size={16} /> {currentRoutine.day_name}</span>
                        <span>Focus: {currentRoutine.focus_area}</span>
                    </div>
                </div>
                {/* 
                <button className="ai-gen-btn glow" onClick={() => navigate('/workout/generate')}>
                    <Sparkles size={18} /> Custom AI Plan
                </button> 
                */}
            </header>

            <div className="day-tabs">
                {plan.routines.map((day, index) => (
                    <button
                        key={index}
                        className={`day-tab ${selectedDay === index ? 'active' : ''}`}
                        onClick={() => setSelectedDay(index)}
                    >
                        <span className="day-abbr">{day.day_name.substring(0, 3)}</span>
                        <span className="day-full">{day.day_name}</span>
                    </button>
                ))}
            </div>

            <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="routine-content"
            >
                <div className="routine-header">
                    <h2>{currentRoutine.day_name}</h2>
                    <span className="focus-badge">{currentRoutine.focus_area}</span>
                </div>

                {currentRoutine.categories && currentRoutine.categories.length > 0 ? (
                    currentRoutine.categories.map((cat, catIdx) => (
                        <div key={catIdx} className="category-section">
                            <h3>{cat.name}</h3>
                            <div className="exercises-list">
                                {cat.exercises.map((exName, exIdx) => (
                                    <div className="exercise-card" key={exIdx}>
                                        <div className="ex-details">
                                            <h3>{exName}</h3>
                                            <div className="ex-meta">
                                                <span>3 Sets</span> • <span>12-15 Reps</span>
                                            </div>
                                        </div>
                                        <div className="ex-actions">
                                            {/* DEMO VIDEO BUTTON -> Internal Player */}
                                            <button
                                                className={`btn-demo ${!exerciseMap[exName] ? 'disabled' : ''}`}
                                                onClick={() => handleDemoClick(exName)}
                                                disabled={!exerciseMap[exName]}
                                                title={!exerciseMap[exName] ? "No video uploaded" : "Watch Demo"}
                                            >
                                                <Play size={18} /> {exerciseMap[exName] ? "Demo Video" : "No Video"}
                                            </button>

                                            <button
                                                className="btn-ai-check"
                                                onClick={() => navigate('/posture', {
                                                    state: {
                                                        exercises: [exName],
                                                        exerciseId: exName.toLowerCase().replace(/ /g, '_'),
                                                    }
                                                })}
                                            >
                                                <Camera size={18} /> AI Check
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rest-day-text">
                        <h3>Rest & Recovery Day 😴</h3>
                        <p>Allow your muscles to recover for the next session.</p>
                    </div>
                )}
            </motion.div>

            {/* VIDEO MODAL */}
            <AnimatePresence>
                {videoModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="video-modal-overlay"
                        onClick={() => setVideoModal({ ...videoModal, show: false })}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="video-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <h3>{videoModal.title}</h3>

                                    <div className="header-actions">
                                        <button
                                            className="header-icon-btn fitty-coach-icon"
                                            title="Ask Fitty Coach"
                                            onClick={() => {
                                                setVideoModal({ ...videoModal, show: false });
                                                navigate('/fitty');
                                            }}
                                        >
                                            <Sparkles size={18} />
                                        </button>

                                        <button
                                            className="header-icon-btn posture-check-icon"
                                            title="AI Posture Check"
                                            onClick={() => {
                                                setVideoModal({ ...videoModal, show: false });
                                                navigate('/posture', {
                                                    state: {
                                                        exercises: [videoModal.title],
                                                        exerciseId: videoModal.title.toLowerCase().replace(/ /g, '_'),
                                                    }
                                                });
                                            }}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>
                                <button className="close-btn" onClick={() => setVideoModal({ ...videoModal, show: false })}><X /></button>
                            </div>
                            <video controls autoPlay className="modal-video-player">
                                <source src={videoModal.url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkoutDashboard;
