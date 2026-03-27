import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, TrendingUp, Zap, Target, Award, ArrowRight, Activity, Camera, Maximize, AlertCircle } from 'lucide-react';
import './MissionControl.css';
import API from '../axiosConfig';

/* --- FITTY TERMINAL --- */
const FittyTerminal = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
        let index = 0;
        setDisplayedText('');
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 20);
        return () => clearInterval(interval);
    }, [text]);

    return (
        <div className="fitty-terminal-card">
            <div className="terminal-header">
                <Zap size={16} /> FITTY AI SYSTEM // MISSION DIRECTIVE
            </div>
            <div className="terminal-body">
                {'>'} {displayedText}
                <span className="typing-cursor"></span>
            </div>
        </div>
    );
};

/* --- FOCUS & MEDITATION SYSTEM (WEBCAM) --- */
const FocusZone = ({ onScoreGenerated }) => {
    const [isActive, setIsActive] = useState(false);
    const [timer, setTimer] = useState(60); // 60 seconds demo session
    const [feedback, setFeedback] = useState('Align inside frame');
    const [feedbackType, setFeedbackType] = useState('neutral');
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Camera Lifecycle
    useEffect(() => {
        if (isActive) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isActive]);

    // Timer & Mock AI Feedback Lifecycle
    useEffect(() => {
        let interval;
        if (isActive && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
                // Mock AI real-time feedback logic (Hackathon flavor)
                const mockState = Math.random();
                if (mockState > 0.8) {
                    setFeedback('Too much movement! Breathe.');
                    setFeedbackType('feedback-bad');
                } else {
                    setFeedback('Perfect posture. Holding focus.');
                    setFeedbackType('feedback-good');
                }
            }, 1000);
        } else if (timer === 0 && isActive) {
            handleSessionComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timer]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
        } catch (err) {
            setFeedback("Camera permission denied. Cannot track posture.");
            setFeedbackType("feedback-bad");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const toggleFocus = () => {
        if (!isActive) {
            setTimer(60);
            setFeedback("Calibrating skeletal tracking...");
            setFeedbackType("neutral");
            setIsActive(true);
        } else {
            setIsActive(false);
            setFeedback("Session Aborted");
        }
    };

    const handleSessionComplete = () => {
        setIsActive(false);
        setFeedback("Session Complete! Focus Score Generated.");
        setFeedbackType("feedback-good");
        stopCamera();
        // Calculate mock score
        const score = Math.floor(Math.random() * 20) + 80; // 80-100 score
        if(onScoreGenerated) onScoreGenerated(score);
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="focus-zone">
            <div className="section-title">
                <Target size={20} /> Focus & Posture Zone
            </div>
            
            <div className={`focus-scanner-container ${isActive ? 'focus-active' : ''}`}>
                <video ref={videoRef} autoPlay playsInline muted />
                
                {/* Visual Scanner Tech Overlay */}
                <div className="scanner-overlay-ui">
                    <div className="scan-corner scan-tl"></div>
                    <div className="scan-corner scan-tr"></div>
                    <div className="scan-corner scan-bl"></div>
                    <div className="scan-corner scan-br"></div>
                    <div className="scanning-line"></div>
                </div>

                {!isActive && timer === 60 && (
                    <div style={{ position: 'absolute', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection:'column', alignItems:'center', gap: '8px' }}>
                        <Camera size={40} />
                        <span>Camera Ready</span>
                    </div>
                )}

                {isActive && (
                    <div className={`focus-feed-text ${feedbackType}`}>
                        {feedback}
                    </div>
                )}
            </div>

            <div className="focus-controls">
                <div className="focus-timer">{formatTime(timer)}</div>
                <button 
                    className={`focus-start-btn ${isActive ? 'stop' : ''}`}
                    onClick={toggleFocus}
                >
                    {isActive ? 'HALT SESSION' : 'INITIATE FOCUS'}
                </button>
            </div>
        </div>
    );
};

/* --- MAIN DAHSBOARD COMPONENT --- */
const MissionControl = () => {
    const navigate = useNavigate();
    
    // User Profile Stats State
    const [xp, setXp] = useState(1240);
    const [streak, setStreak] = useState(5);
    const [challengesDone, setChallengesDone] = useState(12);
    const [postureScore, setPostureScore] = useState(88);

    const level = Math.floor(xp / 1000) + 1;
    const currentLevelXp = xp % 1000;
    const progressPercent = (currentLevelXp / 1000) * 100;

    const ranks = ["ROOKIE", "ACTIVE", "ATHLETE", "ELITE", "MASTER"];
    const rankTitle = ranks[Math.min(level - 1, ranks.length - 1)];

    // Challenges State
    const challenges = [
        { id: 1, title: '5 Minute Core Burn', metric: '3 Sets • 5 Mins', diff: 'Beginner', diffClass: 'diff-beginner' },
        { id: 2, title: 'Upper Body Superset', metric: '4 Sets • 15 Mins', diff: 'Intermediate', diffClass: 'diff-intermediate' },
        { id: 3, title: 'HIIT Death Protocol', metric: '5 Sets • 20 Mins', diff: 'Advanced', diffClass: 'diff-advanced' }
    ];

    const fittyMessage = "Sensors indicate optimal recovery state. Muscle fatigue is low. Recommend engaging intermediate strength protocol followed by a 60-second posture alignment focus.";

    // Handle score from the Focus System
    const handleFocusScore = (score) => {
        setPostureScore(score);
        setXp(prev => prev + 150); // Award XP
        setChallengesDone(prev => prev + 1);
        alert(`Focus Session Completed! You scored ${score}/100 and earned 150 XP!`);
    };

    return (
        <div className="mission-control-wrapper">
            
            {/* HER HEADER: Title & Rank */}
            <motion.div 
                className="mission-header-panel"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mission-title-area">
                    <h1>Mission Control</h1>
                    <p>Your central AI hub for daily challenges, rank progression, and skeletal tracking.</p>
                    
                    <div className="stats-badges">
                        <div className="stat-mini-badge"><Zap size={16} /> {streak} Day Streak</div>
                        <div className="stat-mini-badge"><Award size={16} /> {challengesDone} Completed</div>
                        <div className="stat-mini-badge"><Activity size={16} /> Posture Score: {postureScore}</div>
                    </div>
                </div>

                <div className="rank-system-wrapper">
                    <div className="rank-header">
                        <div className="current-rank">Level {level} <span className="rank-title">{rankTitle}</span></div>
                        <div className="xp-text">{currentLevelXp} / 1000 XP</div>
                    </div>
                    <div className="rank-progress-bar">
                        <div className="rank-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </motion.div>

            {/* BENTO GRID */}
            <div className="mission-bento-grid">
                
                <FittyTerminal text={fittyMessage} />

                {/* Challenges Column */}
                <motion.div 
                    className="challenges-section"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="section-title"><TrendingUp size={20}/> Daily Live Challenges</div>
                    
                    {challenges.map((chal, i) => (
                        <div className="challenge-card" key={chal.id} onClick={() => navigate('/workout')}>
                            <div className="challenge-info">
                                <h3>{chal.title}</h3>
                                <p>{chal.metric}</p>
                            </div>
                            <div style={{display:'flex', alignItems: 'center', gap: '16px'}}>
                                <span className={`difficulty-badge ${chal.diffClass}`}>{chal.diff}</span>
                                <button className="start-chal-btn"><Play size={16} fill="currentColor" /></button>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Focus Zone Column */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <FocusZone onScoreGenerated={handleFocusScore} />
                </motion.div>

                {/* MAIN CTA */}
                <motion.div 
                    className="main-cta-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <button className="huge-launch-btn" onClick={() => navigate('/workout')}>
                        Start Today's Protocol <ArrowRight size={24} />
                    </button>
                </motion.div>

            </div>
        </div>
    );
};

export default MissionControl;
