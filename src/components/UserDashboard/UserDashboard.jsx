import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../axiosConfig';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Flame,
    Droplets,
    Dumbbell,
    TrendingUp,
    Calendar,
    ChevronRight,
    CheckCircle2,
    Trophy,
    Zap,
    Crown,
    Play,
    Utensils
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState('');
    const [loading, setLoading] = useState(true);

    // Data States
    const [todayWorkout, setTodayWorkout] = useState(null);
    const [waterData, setWaterData] = useState({ glasses: 0, total_ml: 0 });
    const [weeklyStats, setWeeklyStats] = useState([]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        fetchDashboardData();

        // Listen for real-time water updates from global event
        const handleWaterUpdate = (event) => {
            if (event.detail) {
                setWaterData(prev => ({
                    ...prev,
                    glasses: event.detail.glasses,
                    total_ml: event.detail.total_ml
                }));
            }
        };

        window.addEventListener('waterUpdated', handleWaterUpdate);
        return () => window.removeEventListener('waterUpdated', handleWaterUpdate);
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const planRes = await API.get('/api/accounts/workout/plan/');
            const plan = planRes.data;
            const todayIndex = (new Date().getDay() + 6) % 7;
            setTodayWorkout(plan[todayIndex]);

            // Safe Token Fetch
            const token = localStorage.getItem('access_token');
            if (token) {
                const waterRes = await axios.get('http://127.0.0.1:8000/api/fitness/water-intake/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWaterData(waterRes.data);
            }

            const mockChartData = [
                { name: 'Mon', calories: 320, active: 45 },
                { name: 'Tue', calories: 450, active: 60 },
                { name: 'Wed', calories: 280, active: 30 },
                { name: 'Thu', calories: 500, active: 75 },
                { name: 'Fri', calories: 390, active: 50 },
                { name: 'Sat', calories: 410, active: 65 },
                { name: 'Sun', calories: 300, active: 40 },
            ];
            setWeeklyStats(mockChartData);

        } catch (error) {
            console.error("Dashboard fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    const caloriesBurned = todayWorkout ? (todayWorkout.exercises.reduce((acc, curr) => acc + (curr.sets * curr.reps * 0.5), 0) * 5) : 0;

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="dashboard-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* HER0 SECTION */}
            <motion.div className="dashboard-hero glass-panel" variants={itemVariants}>
                <div className="hero-text">
                    <h1>{greeting}, <span className="text-gradient-gold">{user?.name || 'Champ'}</span> 🚀</h1>
                    <p>Ready to dominate today? You're on a <strong>5 Day Streak!</strong> 🔥</p>
                </div>
                <div className="hero-action">
                    <button className="btn-primary-glow" onClick={() => navigate('/workout')}>
                        <Play size={20} fill="currentColor" /> Start Workout
                    </button>
                </div>
            </motion.div>

            {/* KEY STATS ROW */}
            <motion.div className="stats-grid" variants={itemVariants}>
                <motion.div className="stat-card glass-card" whileHover={{ y: -5 }}>
                    <div className="stat-icon-wrapper fire">
                        <Flame size={24} />
                    </div>
                    <div>
                        <span className="stat-label">Calories Burned</span>
                        <div className="stat-value">{Math.round(caloriesBurned)} <span className="unit">kcal</span></div>
                    </div>
                </motion.div>

                <motion.div className="stat-card glass-card" whileHover={{ y: -5 }}>
                    <div className="stat-icon-wrapper water">
                        <Droplets size={24} />
                    </div>
                    <div>
                        <span className="stat-label">Hydration</span>
                        <div className="stat-value">{waterData.glasses}<span className="unit">/12</span></div>
                    </div>
                </motion.div>

                <motion.div className="stat-card glass-card" whileHover={{ y: -5 }}>
                    <div className="stat-icon-wrapper fitness">
                        <Dumbbell size={24} />
                    </div>
                    <div>
                        <span className="stat-label">Current Focus</span>
                        <div className="stat-value text-truncate" style={{ maxWidth: '120px' }}>{todayWorkout?.focus || 'Rest'}</div>
                    </div>
                </motion.div>

                <motion.div className="stat-card glass-card" whileHover={{ y: -5 }}>
                    <div className="stat-icon-wrapper gold">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <span className="stat-label">Next Goal</span>
                        <div className="stat-value">75 <span className="unit">kg</span></div>
                    </div>
                </motion.div>
            </motion.div>

            {/* BENTO GRID LAYOUT */}
            <div className="bento-grid">

                {/* 1. CHART SECTION (Wide) */}
                <motion.div className="glass-card bento-item chart-section" variants={itemVariants}>
                    <div className="section-header">
                        <h3><TrendingUp size={20} className="icon-mr" /> Activity Trends</h3>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyStats}>
                                <defs>
                                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                />
                                <Area type="monotone" dataKey="calories" stroke="#818cf8" strokeWidth={3} fillUrl="url(#colorCal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 2. TODAY'S PLAN (Tall) */}
                <motion.div className="glass-card bento-item plan-section" variants={itemVariants}>
                    <div className="section-header">
                        <h3><Calendar size={20} className="icon-mr" /> Today's Plan</h3>
                        <span className="badge-highlight">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                    </div>

                    <div className="plan-scroll-list">
                        {todayWorkout?.exercises?.length > 0 ? (
                            todayWorkout.exercises.map((ex, idx) => (
                                <motion.div
                                    key={idx}
                                    className="plan-item-compact"
                                    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                >
                                    <img src={`https://ui-avatars.com/api/?name=${ex.name}&background=random`} className="ex-thumb" alt="ex" />
                                    <div className="plan-info">
                                        <h4>{ex.name}</h4>
                                        <p>{ex.sets} sets • {ex.reps} reps</p>
                                    </div>
                                    <CheckCircle2 size={18} className="text-muted" />
                                </motion.div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>No specific exercises today.</p>
                            </div>
                        )}
                        <div className="plan-item-compact dietary-tip">
                            <div className="plan-icon-small"><Utensils size={14} /></div>
                            <div className="plan-info">
                                <h4>Post-Workout</h4>
                                <p>Try a protein shake!</p>
                            </div>
                        </div>
                    </div>
                    <button className="btn-full-width mt-3" onClick={() => navigate('/workout')}>Start Session</button>
                </motion.div>

                {/* 3. LEADERBOARD (Small) */}
                <motion.div className="glass-card bento-item leaderboard-section" variants={itemVariants}>
                    <div className="section-header">
                        <h3><Crown size={20} className="icon-mr text-warning" /> Top Performers</h3>
                    </div>
                    <div className="leaderboard-list">
                        {[1, 2, 3].map((i) => (
                            <div className="lb-item" key={i}>
                                <span className="lb-rank">#{i}</span>
                                <div className="lb-user">
                                    <div className="lb-avatar" />
                                    <span>User {i}</span>
                                </div>
                                <span className="lb-score">{2000 - (i * 150)} xp</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 4. ACHIEVEMENTS (Horizontal Scroll) */}
                <motion.div className="glass-card bento-item achievement-section" variants={itemVariants}>
                    <div className="section-header">
                        <h3><Zap size={20} className="icon-mr text-warning" /> Recent Unlock</h3>
                    </div>
                    <div className="achievement-display">
                        <div className="badge-icon-large">🏆</div>
                        <div className="badge-info">
                            <h4>Early Riser</h4>
                            <p>5 morning workouts</p>
                        </div>
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
};

export default UserDashboard;
