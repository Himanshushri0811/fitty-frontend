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
  FaUser,
  FaSignOutAlt,
  FaChevronRight,
  FaGoogle,
  FaFacebook,
  FaCheck
} from 'react-icons/fa';
import { GiMuscleUp } from 'react-icons/gi';
import { MdFitnessCenter, MdEmail, MdLock, MdPerson } from 'react-icons/md';
import './Auth.css';

// Import Login and Signup components (make sure they exist)
import LoginForm from './Login';
import SignupForm from './Signup';

const Auth = ({ initialTab = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(initialTab === 'login');
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'signup') {
      setIsLogin(false);
    } else if (tab === 'login') {
      setIsLogin(true);
    }
  }, [location]);

  const handleSwitch = () => {
    setIsAnimating(true);
    const nextLoginState = !isLogin;
    setTimeout(() => {
      setIsLogin(nextLoginState);
      // Update URL without page reload
      navigate(`/auth?tab=${nextLoginState ? 'login' : 'signup'}`, { replace: true });
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 300);
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
          <motion.div
            className="brand-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="logo">
              <span className="logo-icon">
                <MdFitnessCenter style={{ color: 'white' }} />
              </span>
              <div className="logo-text">
                <h1>Fitty</h1>
                <p>Advanced AI Trainer</p>
              </div>
            </div>

            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Fitness Motivation"
              />
              <div className="image-overlay">
                <h3>Limitless Living</h3>
                <p>Precision guidance. Peak performance.</p>
              </div>
            </div>
          </motion.div>

          <div className="benefits-section">
            <h3>Engineered for Results</h3>
            <div className="benefits-list">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="benefit-item"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <span className="benefit-icon">{benefit.icon}</span>
                  <span>{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="stats">
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Athletes</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Rating</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">AI Sync</span>
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

          {/* Forms with Animation */}
          <div className="forms-container">
            <div className={`forms-slider ${isLogin ? 'login-active' : 'signup-active'}`}>

              {/* Login Form */}
              <div className="form-wrapper login-wrapper">
                <LoginForm onSwitch={handleSwitch} />
              </div>

              {/* Signup Form */}
              <div className="form-wrapper signup-wrapper">
                <SignupForm onSwitch={handleSwitch} />
              </div>

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