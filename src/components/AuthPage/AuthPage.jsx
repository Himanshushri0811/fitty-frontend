import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdFitnessCenter, MdCheckCircle } from 'react-icons/md';
import { FaDumbbell, FaRobot, FaChartLine } from 'react-icons/fa';

import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import './Auth.css';

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('login');

    // Sync state with URL query 'tab'
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'signup' || tab === 'login') {
            setActiveTab(tab);
        }
    }, [location.search]);

    const switchTab = (tab) => {
        setActiveTab(tab);
        navigate(`/auth?tab=${tab}`, { replace: true });
    };

    const benefits = [
        { icon: <FaRobot />, text: "AI Coach Fitty" },
        { icon: <FaDumbbell />, text: "Smart Workouts" },
        { icon: <FaChartLine />, text: "Pro Analytics" },
        { icon: <MdCheckCircle />, text: "Goal Tracking" },
    ];

    return (
        <div className="auth-page-wrapper">
            {/* --- Left Panel (Brand & Vision) --- */}
            <div className="auth-left-panel">
                <div className="bg-gradient-circle" /> {/* Ambient Background */}

                <div className="brand-container">
                    <div className="brand-logo-icon">
                        <MdFitnessCenter />
                    </div>
                    <div className="brand-text">
                        <h1>FitMitra</h1>
                        <p>Next-Gen Fitness AI</p>
                    </div>
                </div>

                <motion.div
                    className="hero-visual"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <h2>Unlock Your <br /> <span className="text-gradient">Peak Potential</span></h2>
                    <p>
                        Join 50,000+ athletes using AI to crush their goals.
                        Personalized plans, real-time posture correction, and smart diet tracking.
                    </p>

                    <div className="glass-features">
                        {benefits.map((b, i) => (
                            <motion.div
                                key={i}
                                className="feature-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + (i * 0.1) }}
                            >
                                <span className="feature-icon">{b.icon}</span>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* --- Right Panel (Auth Forms) --- */}
            <div className="auth-right-panel">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Tab Switcher */}
                    <div className="tab-switcher">
                        <button
                            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => switchTab('login')}
                        >
                            Login
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                            onClick={() => switchTab('signup')}
                        >
                            Sign Up
                        </button>
                        <div
                            className={`tab-indicator ${activeTab === 'signup' ? 'right' : ''}`}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'login' ? (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <LoginForm onSwitch={() => switchTab('signup')} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="signup"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <SignupForm onSwitch={() => switchTab('login')} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;
