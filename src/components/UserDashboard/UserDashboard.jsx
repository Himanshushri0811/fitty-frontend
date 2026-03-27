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
    Trophy,
    Zap,
    Play,
    Utensils,
    Activity,
    Target
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
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
            {/* HERO SECTION */}
            <motion.div className="dashboard-hero" variants={itemVariants}>
                <div className="hero-text">
                    <h1>{greeting}, {user?.name || 'Champ'}</h1>
                    <p>You have a <strong>5 day streak</strong>. Keep up the momentum.</p>
                </div>
                <div className="hero-action">
                    <button className="btn-primary-glow" onClick={() => navigate('/workout')}>
                        <Play size={16} fill="currentColor" /> Start workout
                    </button>
                </div>
            </motion.div>

            {/* KEY STATS ROW */}
            <motion.div className="stats-grid" variants={itemVariants}>
                <div className="stat-card">
                    <div className="stat-icon-wrapper fire"><Flame size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Active Burn</span>
                        <div className="stat-value">{Math.round(caloriesBurned)}<span className="unit">kcal</span></div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper water"><Droplets size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Hydration</span>
                        <div className="stat-value">{waterData.glasses}<span className="unit">/12</span></div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper fitness"><Activity size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Focus</span>
                        <div className="stat-value text-truncate" style={{ maxWidth: '100px', fontSize: '1.25rem' }}>
                            {todayWorkout?.focus || 'Rest'}
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper gold"><Target size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Goal Weight</span>
                        <div className="stat-value">75<span className="unit">kg</span></div>
                    </div>
                </div>
            </motion.div>

            {/* BENTO GRID LAYOUT */}
            <div className="bento-grid">
                
                {/* 1. CHART SECTION (Wide) */}
                <motion.div className="bento-item chart-section" variants={itemVariants}>
                    <div className="section-header">
                        <h3><TrendingUp size={18} className="icon-mr" /> Activity Trends</h3>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyStats}>
                                <defs>
                                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, dy: 10 }} />
                                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 500 }}
                                />
                                <Area type="monotone" dataKey="calories" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 2. TODAY'S PLAN (Tall) */}
                <motion.div className="bento-item plan-section" variants={itemVariants}>
                    <div className="section-header">
                        <h3><Calendar size={18} className="icon-mr" /> Today's Plan</h3>
                        <span className="badge-highlight">{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</span>
                    </div>

                    <div className="plan-scroll-list">
                        {todayWorkout?.exercises?.length > 0 ? (
                            todayWorkout.exercises.map((ex, idx) => (
                                <div key={idx} className="plan-item-compact">
                                    <div className="list-icon-box">
                                        <Dumbbell size={18} />
                                    </div>
                                    <div className="plan-info">
                                        <h4>{ex.name}</h4>
                                        <p>{ex.sets} sets • {ex.reps} reps</p>
                                    </div>
                                    <ChevronRight size={16} color="var(--text-muted)" />
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                No specific exercises planned for today.
                            </div>
                        )}
                        
                        <div className="plan-item-compact">
                            <div className="list-icon-box" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                                <Utensils size={18} />
                            </div>
                            <div className="plan-info">
                                <h4>Nutrition Goal</h4>
                                <p>Consume 150g Protein</p>
                            </div>
                        </div>
                    </div>
                    
                    <button className="btn-full-width" onClick={() => navigate('/workout')}>View Full Routine</button>
                </motion.div>

                {/* 3. LEADERBOARD (Small) */}
                <motion.div className="bento-item leaderboard-section" variants={itemVariants}>
                    <div className="section-header">
                        <h3><Trophy size={18} className="icon-mr text-warning" /> Top Performers</h3>
                    </div>
                    <div className="leaderboard-list">
                        {[1, 2, 3].map((i) => (
                            <div className="lb-item" key={i}>
                                <span className="lb-rank">#{i}</span>
                                <div className="lb-user">
                                    <div className="lb-avatar">{String.fromCharCode(64 + i)}</div>
                                    <span>Athlete {i}</span>
                                </div>
                                <span className="lb-score">{2000 - (i * 150)} xp</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 4. ACHIEVEMENTS (Horizontal Scroll) */}
                <motion.div className="bento-item achievement-section" variants={itemVariants}>
                    <div className="section-header">
                        <h3><Zap size={18} className="icon-mr text-warning" /> Latest Achievement</h3>
                    </div>
                    <div className="achievement-display">
                        <div className="badge-icon-large">
                            <Flame size={24} color="#f59e0b" fill="#f59e0b" />
                        </div>
                        <div className="badge-info">
                            <h4>Consistency King</h4>
                            <p>Worked out 7 days straight</p>
                        </div>
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
};

export default UserDashboard;
