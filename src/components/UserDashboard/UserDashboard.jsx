import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaDumbbell,
    FaAppleAlt,
    FaChartLine,
    FaRobot,
    FaUser,
    FaCalendarCheck,
    FaFire
} from 'react-icons/fa';
import './UserDashboard.css';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('User');

    useEffect(() => {
        // In a real app, fetch from context or API
        const storedUser = localStorage.getItem('username');
        if (storedUser) setUsername(storedUser);
    }, []);

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

    return (
        <div className="user-dashboard-container">
            <motion.div
                className="dashboard-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1>Welcome back, <span className="highlight-text">{username}</span>!</h1>
                <p>Ready to crush your goals today?</p>
            </motion.div>

            <motion.div
                className="dashboard-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Quick Actions */}
                <motion.div
                    className="dashboard-card action-card workout-card"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate('/workout')}
                >
                    <div className="card-icon"><FaDumbbell /></div>
                    <h3>Start Workout</h3>
                    <p>Continue your training plan.</p>
                </motion.div>

                <motion.div
                    className="dashboard-card action-card diet-card"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate('/diet')}
                >
                    <div className="card-icon"><FaAppleAlt /></div>
                    <h3>View Diet Plan</h3>
                    <p>Track your nutrition today.</p>
                </motion.div>

                <motion.div
                    className="dashboard-card ai-card"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate('/voice-assistant')}
                >
                    <div className="card-icon"><FaRobot /></div>
                    <h3>Ask Fitty AI</h3>
                    <p>Get instant advice on form & health.</p>
                </motion.div>

                <motion.div
                    className="dashboard-card stats-card"
                    variants={itemVariants}
                    onClick={() => navigate('/health-tracking')}
                >
                    <div className="card-header">
                        <h3><FaChartLine /> Health Overview</h3>
                    </div>
                    <div className="stats-preview">
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Workouts</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Calories</span>
                        </div>
                    </div>
                </motion.div>

                {/* Daily Streak / Progress */}
                <motion.div
                    className="dashboard-card streak-card"
                    variants={itemVariants}
                >
                    <div className="card-icon"><FaFire /></div>
                    <h3>Current Streak</h3>
                    <div className="streak-count">0 Days</div>
                    <p>Keep it up!</p>
                </motion.div>

                <motion.div
                    className="dashboard-card profile-card"
                    variants={itemVariants}
                    onClick={() => navigate('/profile')}
                >
                    <div className="card-icon"><FaUser /></div>
                    <h3>My Profile</h3>
                    <p>Update goals & settings.</p>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default UserDashboard;
