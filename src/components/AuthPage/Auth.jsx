import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaHeartbeat, FaChartLine } from 'react-icons/fa';

import LoginForm from './LoginForm';
import MultiStepSignup from './MultiStepSignup';
import ForgotPassword from './ForgotPassword';
import fittyMascot from '../../assets/fitty_mascot.png';
import './Auth.css';

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Parse query params for initial tab state
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'login';
    const [authMode, setAuthMode] = useState(initialTab);

    // Sync state with URL changes
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab') || 'login';
        setAuthMode(tab);
    }, [location.search]);

    const handleSwitch = (mode) => {
        setAuthMode(mode);
        navigate(`/auth?tab=${mode}`, { replace: true });
    };

    return (
        <div className="auth-page-wrapper">
            {/* Background Gradient Layer */}
            <div className="auth-bg-gradient" />

            <div className="auth-content-container">
                {/* --- LEFT PANEL: BRANDING --- */}
                <div className="auth-brand-panel">
                    <div className="fitty-mascot-container">
                        <div className="mascot-glow" />
                        <img src={fittyMascot} alt="Fitty AI" className="fitty-mascot-img" />
                    </div>

                    <h1 className="brand-title">Hi, I'm Fitty 👋</h1>
                    <p className="brand-subtitle">Your AI Fitness Assistant</p>

                    <div className="brand-features">
                        <div className="feature-pill">
                            <span className="feature-icon-wrapper"><FaDumbbell /></span>
                            Personalized Workouts
                        </div>
                        <div className="feature-pill">
                            <span className="feature-icon-wrapper"><FaHeartbeat /></span>
                            Smart Diet Planning
                        </div>
                        <div className="feature-pill">
                            <span className="feature-icon-wrapper"><FaChartLine /></span>
                            Progress Tracking
                        </div>
                    </div>
                </div>

                {/* --- RIGHT PANEL: FORM CARD --- */}
                <div className="auth-form-panel">
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Tab Switcher - Hide if Forgot Password */}
                        {authMode !== 'forgot-password' && (
                            <div className="auth-tab-group">
                                <button
                                    className={`tab-btn ${authMode === 'login' ? 'active' : ''}`}
                                    onClick={() => handleSwitch('login')}
                                >
                                    Log In
                                </button>
                                <button
                                    className={`tab-btn ${authMode === 'signup' ? 'active' : ''}`}
                                    onClick={() => handleSwitch('signup')}
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}

                        {/* Form Content with Transitions */}
                        <div className="form-content">
                            <AnimatePresence mode="wait">
                                {authMode === 'login' && (
                                    <motion.div
                                        key="login"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <LoginForm />
                                    </motion.div>
                                )}
                                {authMode === 'signup' && (
                                    <motion.div
                                        key="signup"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <MultiStepSignup />
                                    </motion.div>
                                )}
                                {authMode === 'forgot-password' && (
                                    <motion.div
                                        key="forgot-password"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ForgotPassword onBack={() => handleSwitch('login')} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
