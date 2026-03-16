import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFire, FaTerminal, FaPlay, FaBolt, FaDumbbell, FaHeartbeat } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../axiosConfig';
import './MissionControl.css';

/* =========================================================================
   SUB-COMPONENTS 
========================================================================= */

const AIStrategyMessage = ({ message }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      if (index < message.length) {
        setDisplayedText((prev) => prev + message.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className="fitty-terminal">
      <div className="terminal-header">
        <FaTerminal /> <span>FITTY OS v4.2 - SECURE NEURAL LINK</span>
      </div>
      <div className="terminal-text">
        {displayedText}
        <span className="typing-cursor"></span>
      </div>
    </div>
  );
};

const StreakDisplay = ({ streak }) => (
  <motion.div className="streak-display" whileHover={{ scale: 1.05 }}>
    <FaFire /> <span>{streak} DAY STREAK</span>
  </motion.div>
);

const XPProgressBar = ({ level, xp }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    // 500 XP per level
    const progress = (xp % 500) / 500 * 100;
    setTimeout(() => setWidth(progress), 200);
  }, [xp]);

  return (
    <div className="xp-container">
      <div className="level-badge">LEVEL {level} ATHLETE</div>
      <div className="xp-bar-bg">
        <div className="xp-fill" style={{ width: `${width}%` }} />
      </div>
      <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px', textAlign: 'right', fontFamily: 'monospace' }}>
        {xp % 500} / 500 XP
      </div>
    </div>
  );
};

const QuickWorkoutLauncher = () => {
  const navigate = useNavigate();
  return (
    <div className="quick-launcher">
      <h3>Quick Systems</h3>
      <button className="quick-btn" onClick={() => navigate('/workout')}>
        <FaBolt className="qb-icon" style={{color: '#ffdd00'}} />
        <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>5 MIN CORE</span>
      </button>
      <button className="quick-btn" onClick={() => navigate('/workout')}>
        <FaHeartbeat className="qb-icon" style={{color: '#ff416c'}} />
        <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>10 MIN HIIT</span>
      </button>
      <button className="quick-btn" onClick={() => navigate('/workout')}>
        <FaDumbbell className="qb-icon" style={{color: '#00ffcc'}} />
        <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>FULL BODY</span>
      </button>
    </div>
  );
};

/* =========================================================================
   MAIN COMPONENT 
========================================================================= */

const MissionControl = () => {
  const navigate = useNavigate();
  const [missionData, setMissionData] = useState(null);
  const [userStats, setUserStats] = useState({ level: 1, xp: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fake Completion State for Hackathon Demo UI Juice
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    fetchDailyMission();
  }, []);

  const fetchDailyMission = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/missions/today/');
      setMissionData(res.data.mission);
      setUserStats(res.data.stats);
    } catch (err) {
      console.error("Error fetching mission", err);
      // Fallback data for UI preview/demo mode if API fails
      setMissionData({
        id: "demo_123",
        title: "Alpha Centauri Protocol",
        difficulty: "Intermediate",
        xp_reward: 150,
        strategy: "Sensors indicate optimal recovery. Engaging full mobility and core protocol.",
        exercises: [
          { name: "Pushups", sets: 3, reps_or_duration: "20 reps" },
          { name: "Plank", sets: 3, reps_or_duration: "60 sec" },
          { name: "Jump Squats", sets: 3, reps_or_duration: "15 reps" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const startMission = () => {
    // In actual implementation, we'd pass missionData to Context or Redux
    // and route to the active workout session.
    // For demo purposes, we will briefly show completing it.
    completeMissionDemo();
  };

  const completeMissionDemo = async () => {
    try {
      // Complete API Call
      // if valid mission, API.post(`/api/missions/${missionData.id}/complete/`);
      if (missionData.id !== "demo_123") {
         await API.post(`/api/missions/${missionData.id}/complete/`);
      }
      
      // Update UI Stats locally for the "Level Up" feel
      setUserStats(prev => ({
        ...prev,
        xp: prev.xp + missionData.xp_reward,
        level: Math.floor((prev.xp + missionData.xp_reward) / 500) + 1
      }));
      setShowCompletion(true);
    } catch (e) {
      console.log("Mission already complete or error");
      setShowCompletion(true);
    }
  };

  if (loading) {
    return (
      <div className="mission-control-wrapper" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <h2 style={{color: '#00ffcc', fontFamily: 'monospace'}}>CALCULATING OPTIMAL PROTOCOL...</h2>
      </div>
    );
  }

  return (
    <div className="mission-control-wrapper">
      <header className="mission-header">
        <h1>Mission Control</h1>
        <div className="stats-header">
          <StreakDisplay streak={userStats.streak} />
          <XPProgressBar level={userStats.level} xp={userStats.xp} />
        </div>
      </header>

      <main className="mission-grid">
        <section className="main-mission-section">
          {missionData && (
            <>
              <AIStrategyMessage message={missionData.strategy} />
              
              <motion.div 
                className="mission-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="mission-card-header">
                  <div className="mission-title-group">
                    <h2>{missionData.title}</h2>
                    <div className="mission-badges">
                      <span className="badge badge-difficulty">{missionData.difficulty}</span>
                      <span className="badge badge-xp">+{missionData.xp_reward} XP</span>
                    </div>
                  </div>
                  <FaBolt size={40} color="#00ffcc" style={{opacity: 0.8}} />
                </div>

                <div className="exercises-list">
                  {missionData.exercises && missionData.exercises.map((ex, i) => (
                    <div className="exercise-item" key={i}>
                      <span className="ex-name">{ex.name}</span>
                      <span className="ex-details">{ex.sets} Sets × {ex.reps_or_duration}</span>
                    </div>
                  ))}
                </div>

                <button className="launch-btn" onClick={startMission}>
                  <FaPlay style={{marginRight: '10px'}}/> INITIATE MISSION
                </button>
              </motion.div>
            </>
          )}
        </section>

        <aside className="quick-launch-sidebar">
          <QuickWorkoutLauncher />
        </aside>
      </main>

      {/* Completion Overlay */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div 
            className="completion-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.h2
               initial={{ scale: 0.5 }}
               animate={{ scale: 1 }}
               transition={{ type: "spring", stiffness: 200 }}
            >
              MISSION ACCOMPLISHED
            </motion.h2>
            <p>+{missionData.xp_reward} XP EARNED</p>
            <button className="completion-btn" onClick={() => setShowCompletion(false)}>
              RETURN TO BASE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MissionControl;
