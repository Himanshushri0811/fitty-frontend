import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaDumbbell,
    FaAppleAlt,
    FaChartLine,
    FaHeartbeat,
    FaRunning,
    FaHome,
    FaArrowRight
} from 'react-icons/fa';
import { GiMuscleUp } from 'react-icons/gi';
import { MdFitnessCenter } from 'react-icons/md';
import './Auth.css';

// Import Login and Signup components
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') === 'signup' ? false : true; // default to login

    const [isLogin, setIsLogin] = useState(initialTab);

    // Sync state with URL query parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'signup') {
            setIsLogin(false);
        } else if (tab === 'login') {
            setIsLogin(true);
        }
    }, [location.search]);

    const handleSwitch = () => {
        const nextLoginState = !isLogin;
        setIsLogin(nextLoginState);
        navigate(`/auth?tab=${nextLoginState ? 'login' : 'signup'}`, { replace: true });
    };

    const benefits = [
        { icon: <FaDumbbell />, text: 'AI-Personalized Workouts' },
        { icon: <FaAppleAlt />, text: 'Indian Diet Plans' },
        { icon: <GiMuscleUp />, text: 'Posture Correction' },
        { icon: <FaChartLine />, text: 'Progress Tracking' },
        { icon: <FaHeartbeat />, text: 'Health Monitoring' },
        { icon: <FaRunning />, text: 'Voice Assistant' }
    ];

    return (
        <div className="auth-page">
            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Left Section - Branding & Benefits */}
                <div className="auth-left">
                    <div className="brand-section">
                        <div className="logo">
                            <span className="logo-icon">
                                <MdFitnessCenter style={{ color: 'white' }} />
                            </span>
                            <div className="logo-text">
                                <h1>FitMitra</h1>
                                <p>Advanced AI Trainer</p>
                            </div>
                        </div>

                        <div className="hero-content">
                            <h2>Unlock Your <br /> <span style={{ color: 'var(--accent-primary)' }}>Peak Potential</span></h2>
                            <p>Join 50,000+ athletes using AI to crush their fitness goals. Real-time feedback, diet plans, and more.</p>
                        </div>

                        <div className="feature-pills">
                            {benefits.slice(0, 3).map((b, i) => (
                                <div key={i} className="feature-pill">{b.icon} {b.text}</div>
                            ))}
                        </div>
                    </div>

                    <div className="benefits-section" style={{ marginTop: 'auto', paddingTop: '20px' }}>
                        <div className="stats">
                            <div className="stat">
                                <span className="stat-number">50K+</span>
                                <span className="stat-label">Athletes</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">4.9★</span>
                                <span className="stat-label">Rating</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Forms */}
                <div className="auth-right">


                    {/* Tabs */}
                    <div className="tabs-container">
                        <div className="tabs">
                            <button
                                className={`tab ${isLogin ? 'active' : ''}`}
                                onClick={() => !isLogin && handleSwitch()}
                            >
                                Login
                            </button>
                            <button
                                className={`tab ${!isLogin ? 'active' : ''}`}
                                onClick={() => isLogin && handleSwitch()}
                            >
                                Sign Up
                            </button>
                            <div className={`tab-indicator ${isLogin ? 'left' : 'right'}`}></div>
                        </div>
                    </div>

                    <div className="forms-container">
                        <div className="form-wrapper" style={{ width: '100%', padding: '0 20px' }}>
                            <AnimatePresence mode='wait'>
                                {isLogin ? (
                                    <motion.div
                                        key="login"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <LoginForm onSwitch={handleSwitch} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="signup"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <SignupForm onSwitch={handleSwitch} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="auth-footer">
                        <p>By continuing, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a></p>
                        <button className="back-home" onClick={() => navigate('/')}>
                            <FaHome /> Back to Home
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
