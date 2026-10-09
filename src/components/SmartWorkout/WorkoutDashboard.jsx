import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Camera, Calendar, Play, Sparkles, X, Eye, Flame, Trophy, 
    Timer, RotateCcw, Plus, Pause, CheckCircle2, Dumbbell 
} from 'lucide-react';
import API from '../axiosConfig';
import { FIXED_WEEKLY_PLAN } from './standardPlan';
import useRestTimer from '../../hooks/useRestTimer';
import './SmartWorkout.css';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Bicep', 'Tricep', 'Abs'];

const WorkoutDashboard = () => {
    const navigate = useNavigate();
    const [planTab, setPlanTab] = useState(() => localStorage.getItem('workout_tab') || 'standard');
    const [standardPlan, setStandardPlan] = useState(null);
    const [myPlan, setMyPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(0);
    const [exerciseMap, setExerciseMap] = useState({});
    const [videoModal, setVideoModal] = useState({ show: false, url: '', title: '' });

    // Progress stats
    const [stats, setStats] = useState({ streak: 0, workouts_completed: 0 });

    // Muscle group video library browser
    const [selectedMuscle, setSelectedMuscle] = useState(null);
    const [libraryVideos, setLibraryVideos] = useState([]);
    const [libraryLoading, setLibraryLoading] = useState(false);

    // Rest timer hook
    const { remaining, running, progress, start, pause, resume, addTime, reset } = useRestTimer(60);

    useEffect(() => {
        const jsDay = new Date().getDay();
        const tabIndex = jsDay === 0 ? 6 : jsDay - 1;
        setSelectedDay(tabIndex);

        fetchInitialData();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await API.get('/api/accounts/dashboard/stats/', { params: { date: today } });
            if (res.data) {
                setStats({
                    streak: res.data.streak || 0,
                    workouts_completed: res.data.workouts_completed || 0
                });
            }
        } catch (e) {
            // Fail silently
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // 1. Fetch exercises library map for video fallback
            const exRes = await API.get('/api/workouts/exercises/');
            const map = {};
            (exRes.data || []).forEach(ex => {
                map[ex.name] = ex.video_url;
            });
            setExerciseMap(map);

            // 2. Set standard plan
            const std = {
                name: "Fitty Pro Split",
                goal: "Muscle Building & Strength",
                days_per_week: 6,
                routines: FIXED_WEEKLY_PLAN
            };
            setStandardPlan(std);

            // 3. Fetch active user plan
            try {
                const planRes = await API.get('/api/workouts/current/');
                if (planRes.data && planRes.data.plan) {
                    setMyPlan(planRes.data.plan);
                    const savedTab = localStorage.getItem('workout_tab');
                    if (!savedTab) {
                        setPlanTab('my_plan');
                        localStorage.setItem('workout_tab', 'my_plan');
                    }
                } else {
                    if (planTab === 'my_plan' && !localStorage.getItem('workout_tab')) {
                        setPlanTab('standard');
                    }
                }
            } catch (err) {
                console.warn("No active workout plan loaded", err);
            }
        } catch (err) {
            console.error("Error loading workout data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setPlanTab(tab);
        localStorage.setItem('workout_tab', tab);
        setSelectedDay(0);
    };

    const handleMuscleClick = async (muscle) => {
        if (selectedMuscle === muscle) {
            setSelectedMuscle(null);
            setLibraryVideos([]);
            return;
        }
        setSelectedMuscle(muscle);
        setLibraryLoading(true);
        try {
            const res = await API.get(`/api/workouts/library/?muscle=${encodeURIComponent(muscle)}`);
            setLibraryVideos(res.data || []);
        } catch (e) {
            console.error("Failed to load library exercises", e);
        } finally {
            setLibraryLoading(false);
        }
    };

    const handleDemoClick = (exName, directUrl) => {
        const url = directUrl || exerciseMap[exName];
        if (url) {
            setVideoModal({ show: true, url, title: exName });
        } else {
            alert("No demo video uploaded yet for this exercise.");
        }
    };

    const handlePostureCheck = (exName, postureConfig) => {
        navigate('/posture', {
            state: {
                exercises: [exName],
                exerciseId: exName.toLowerCase().replace(/ /g, '_'),
                poseConfig: postureConfig || null
            }
        });
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-screen">
                    <Dumbbell className="spin" size={32} />
                    <p>Loading your training plan...</p>
                </div>
            </div>
        );
    }

    const activePlanObj = planTab === 'my_plan' ? myPlan : standardPlan;
    const currentRoutine = activePlanObj?.routines?.[selectedDay] || activePlanObj?.routines?.[0];

    const formatTimer = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div className="dashboard-container">
            {/* PROGRESS STRIP */}
            <div className="progress-strip">
                <div className="stat-pill">
                    <Flame size={18} className="stat-icon-flame" />
                    <span><strong>{stats.streak}</strong> Day Streak</span>
                </div>
                <div className="stat-pill">
                    <Trophy size={18} className="stat-icon-trophy" />
                    <span><strong>{stats.workouts_completed}</strong> Completed</span>
                </div>
                <button className="ai-gen-btn glow" onClick={() => navigate('/workout/generate')}>
                    <Sparkles size={16} /> Generate with AI
                </button>
            </div>

            {/* PLAN TOGGLE */}
            <div className="plan-toggle-bar">
                <button 
                    className={`plan-toggle-btn ${planTab === 'standard' ? 'active' : ''}`}
                    onClick={() => handleTabChange('standard')}
                >
                    Standard Gym Split
                </button>
                <button 
                    className={`plan-toggle-btn ${planTab === 'my_plan' ? 'active' : ''}`}
                    onClick={() => handleTabChange('my_plan')}
                >
                    My Plan {myPlan ? '✓' : ''}
                </button>
            </div>

            {/* HEADER */}
            <header className="dashboard-header">
                <div>
                    <h1>{activePlanObj ? activePlanObj.name : "Custom Plan"}</h1>
                    {currentRoutine && (
                        <div className="plan-stats">
                            <span><Calendar size={16} /> {currentRoutine.day_name}</span>
                            <span>Focus: {currentRoutine.focus_area}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* REST TIMER CARD */}
            <div className={`rest-timer-bar ${running ? 'timer-active' : ''}`}>
                <div className="timer-info">
                    <Timer size={20} className={running ? 'pulse' : ''} />
                    <div>
                        <span className="timer-label">Rest Timer</span>
                        <div className="timer-display">{formatTimer(remaining)}</div>
                    </div>
                </div>
                <div className="timer-progress-wrap">
                    <div className="timer-progress-fill" style={{ width: `${progress * 100}%` }}></div>
                </div>
                <div className="timer-actions">
                    {running ? (
                        <button className="timer-btn" onClick={pause} title="Pause"><Pause size={16} /></button>
                    ) : (
                        <button className="timer-btn play" onClick={resume} title="Resume"><Play size={16} /></button>
                    )}
                    <button className="timer-btn" onClick={() => addTime(15)} title="+15s"><Plus size={16} />15s</button>
                    <button className="timer-btn" onClick={reset} title="Reset"><RotateCcw size={16} /></button>
                </div>
            </div>

            {/* EMPTY STATE FOR MY PLAN */}
            {planTab === 'my_plan' && !myPlan ? (
                <div className="empty-plan-card">
                    <Dumbbell size={48} className="empty-icon" />
                    <h2>No Custom Plan Saved Yet</h2>
                    <p>Create a hyper-personalized plan tailored to your equipment, goals, and schedule in seconds.</p>
                    <button className="ai-gen-btn glow mt-3" onClick={() => navigate('/workout/generate')}>
                        <Sparkles size={18} /> Generate Plan with Fitty AI
                    </button>
                </div>
            ) : (
                <>
                    {/* DAY TABS */}
                    {activePlanObj?.routines && (
                        <div className="day-tabs">
                            {activePlanObj.routines.map((day, index) => (
                                <button
                                    key={index}
                                    className={`day-tab ${selectedDay === index ? 'active' : ''}`}
                                    onClick={() => setSelectedDay(index)}
                                >
                                    <span className="day-abbr">{(day.day_name || `Day ${index+1}`).substring(0, 3)}</span>
                                    <span className="day-full">{day.day_name || `Day ${index+1}`}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ROUTINE CONTENT */}
                    <motion.div
                        key={`${planTab}-${selectedDay}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="routine-content"
                    >
                        {currentRoutine ? (
                            <>
                                <div className="routine-header">
                                    <h2>{currentRoutine.day_name}</h2>
                                    <span className="focus-badge">{currentRoutine.focus_area}</span>
                                </div>

                                {/* IF STANDARD SPLIT (Uses categories) */}
                                {currentRoutine.categories && currentRoutine.categories.length > 0 ? (
                                    currentRoutine.categories.map((cat, catIdx) => (
                                        <div key={catIdx} className="category-section">
                                            <h3>{cat.name}</h3>
                                            <div className="exercises-list">
                                                {cat.exercises.map((exName, exIdx) => {
                                                    const hasVid = !!exerciseMap[exName];
                                                    return (
                                                        <div className="exercise-card" key={exIdx}>
                                                            <div className="ex-details">
                                                                <h3>{exName}</h3>
                                                                <div className="ex-meta">
                                                                    <span>3 Sets</span> • <span>12-15 Reps</span> • <span>60s Rest</span>
                                                                </div>
                                                            </div>
                                                            <div className="ex-actions">
                                                                <button
                                                                    className={`btn-demo ${!hasVid ? 'disabled' : ''}`}
                                                                    onClick={() => handleDemoClick(exName)}
                                                                    disabled={!hasVid}
                                                                >
                                                                    <Play size={16} /> {hasVid ? "Demo" : "No Video"}
                                                                </button>
                                                                <button
                                                                    className="btn-rest"
                                                                    onClick={() => start(60)}
                                                                >
                                                                    <Timer size={16} /> Rest
                                                                </button>
                                                                <button
                                                                    className="btn-ai-check"
                                                                    onClick={() => handlePostureCheck(exName)}
                                                                >
                                                                    <Camera size={16} /> Check Posture
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : currentRoutine.exercises && currentRoutine.exercises.length > 0 ? (
                                    /* IF MY PLAN (Uses routine.exercises array) */
                                    <div className="exercises-list">
                                        {currentRoutine.exercises.map((ex, exIdx) => {
                                            const videoUrl = ex.video_url || exerciseMap[ex.name];
                                            return (
                                                <div className="exercise-card" key={exIdx}>
                                                    <div className="ex-details">
                                                        <h3>{ex.name}</h3>
                                                        <div className="ex-meta">
                                                            <span>{ex.sets || 3} Sets</span> • 
                                                            <span>{ex.reps || "12"} Reps</span> • 
                                                            <span>{ex.rest || 60}s Rest</span>
                                                        </div>
                                                        {ex.notes && <p className="ex-notes">{ex.notes}</p>}
                                                    </div>
                                                    <div className="ex-actions">
                                                        <button
                                                            className={`btn-demo ${!videoUrl ? 'disabled' : ''}`}
                                                            onClick={() => handleDemoClick(ex.name, videoUrl)}
                                                            disabled={!videoUrl}
                                                        >
                                                            <Play size={16} /> {videoUrl ? "Demo" : "No Video"}
                                                        </button>
                                                        <button
                                                            className="btn-rest"
                                                            onClick={() => start(ex.rest || 60)}
                                                        >
                                                            <Timer size={16} /> Rest
                                                        </button>
                                                        <button
                                                            className="btn-ai-check"
                                                            onClick={() => handlePostureCheck(ex.name, ex.posture_config)}
                                                        >
                                                            <Camera size={16} /> Check Posture
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rest-day-text">
                                        <h3>Rest & Recovery Day 😴</h3>
                                        <p>Allow your muscles to recover for the next session.</p>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </motion.div>
                </>
            )}

            {/* VIDEO LIBRARY BY MUSCLE GROUP */}
            <div className="library-section">
                <div className="library-header">
                    <h3>Explore Exercise Library</h3>
                    <p>Filter exercises and view form demos</p>
                </div>
                <div className="muscle-chips">
                    {MUSCLE_GROUPS.map((m) => (
                        <button
                            key={m}
                            className={`muscle-chip ${selectedMuscle === m ? 'active' : ''}`}
                            onClick={() => handleMuscleClick(m)}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {libraryLoading && <div className="library-loading">Loading exercises...</div>}

                {libraryVideos.length > 0 && (
                    <div className="library-grid">
                        {libraryVideos.map((item) => (
                            <div key={item.id} className="library-card">
                                <div className="library-card-info">
                                    <h4>{item.name}</h4>
                                    <span className="lib-meta">{item.muscle} • {item.equipment}</span>
                                </div>
                                <div className="lib-card-actions">
                                    {item.video_url && (
                                        <button 
                                            className="btn-demo-sm"
                                            onClick={() => handleDemoClick(item.name, item.video_url)}
                                        >
                                            <Play size={14} /> Watch
                                        </button>
                                    )}
                                    {item.has_posture_check && (
                                        <button 
                                            className="btn-ai-check-sm"
                                            onClick={() => handlePostureCheck(item.name)}
                                        >
                                            <Camera size={14} /> Check
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                                                handlePostureCheck(videoModal.title);
                                            }}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>
                                <button className="close-btn" onClick={() => setVideoModal({ ...videoModal, show: false })}>
                                    <X />
                                </button>
                            </div>
                            <video controls autoPlay playsInline preload="metadata" className="modal-video-player">
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
