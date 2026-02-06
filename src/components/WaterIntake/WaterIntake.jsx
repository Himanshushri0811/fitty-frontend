import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import './WaterIntake.css';
import { useAuth } from '../../context/AuthContext'; // Assuming you have this
import fittyVoice from '../../utils/fittyVoice';


const WaterIntake = () => {
    const { user } = useAuth(); // To check if logged in
    const [data, setData] = useState({ glasses: 0, total_ml: 0 });
    const [showModal, setShowModal] = useState(false);
    const [praise, setPraise] = useState('');
    const [loading, setLoading] = useState(false);

    // Initial load
    useEffect(() => {
        if (user) {
            fetchIntake();
        }
    }, [user]);

    // Timer logic separated from data fetch
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            // Check reminder using current state inside closure if possible,
            // or we need to access latest state. 
            // Better to rely on the fact that this affect re-runs if we include data, 
            // BUT we must NOT fetchIntake() in here.
            checkReminder(data);
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, [user, data]); // Re-creates interval when data changes, which is fine and safe.

    const fetchIntake = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const res = await axios.get('http://127.0.0.1:8000/api/fitness/water-intake/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);

            // Dispatch event initially (optional, but good for sync)
            window.dispatchEvent(new CustomEvent('waterUpdated', {
                detail: {
                    glasses: res.data.glasses,
                    total_ml: res.data.total_ml
                }
            }));

        } catch (err) {
            console.error("Failed to fetch hydration data", err);
        }
    };

    const addWater = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.post('http://127.0.0.1:8000/api/fitness/water-intake/',
                { amount_ml: 250 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const newData = {
                glasses: res.data.glasses,
                total_ml: res.data.total_ml,
                last_drink_at: res.data.last_drink_at
            };

            setData(prev => ({
                ...prev,
                ...newData
            }));

            // Dispatch event for other components (e.g., Dashboard) to listen to
            window.dispatchEvent(new CustomEvent('waterUpdated', {
                detail: newData
            }));

            const msg = `Great job completing another glass! Stay fit and stay hydrated.`;
            showPraise(res.data.glasses, msg);
            fittyVoice.speak(msg);
        } catch (err) {
            console.error("Failed to add water", err);
        } finally {
            setLoading(false);
        }
    };

    const showPraise = (glasses, customMsg = null) => {
        const messages = [
            "Good job!",
            "Keep it up!",
            "Hydration is key!",
            `Way to go! ${glasses} glasses down!`,
            "Your body thanks you!"
        ];
        const randomMsg = customMsg || messages[Math.floor(Math.random() * messages.length)];
        setPraise(randomMsg);
        setTimeout(() => setPraise(''), 3000);
    };

    const checkReminder = (currentData) => {
        if (!currentData || !currentData.last_drink_at) return;

        const now = new Date();
        const [hours, minutes] = currentData.last_drink_at.split(':').map(Number);
        const lastDrinkDate = new Date();
        lastDrinkDate.setHours(hours, minutes, 0, 0);

        const diffMs = now - lastDrinkDate;
        const diffMins = Math.floor(diffMs / 60000);

        // If it's been exactly 60 minutes (or close to it) since last drink
        // Note: In real app, you'd track if you already notified for this hour.
        // For hackathon/demo, simply checking if diff > 60 might spam if we check every minute.
        // So we check if it is 'roughly' an hour, e.g., between 60 and 61 mins.

        if (diffMins >= 60 && diffMins < 61) {
            notifyUser();
        }
    };

    const notifyUser = () => {
        const msg = "Time to drink water! It's been an hour.";
        if (Notification.permission === "granted") {
            new Notification("Hydration Check 💧", {
                body: msg,
                icon: "/logo192.png"
            });
            fittyVoice.speak(msg);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Hydration Check 💧", {
                        body: msg,
                        icon: "/logo192.png"
                    });
                    fittyVoice.speak(msg);
                }
            });
        }
    };

    if (!user) return null; // Don't show if not logged in

    // Calculate progress (Target 3000ml)
    const target = 3000;
    const progressPercent = Math.min((data.total_ml / target) * 100, 100);

    return (
        <>
            {/* Floating Icon with Animation */}
            <motion.div
                className="water-floating-icon"
                onClick={() => setShowModal(true)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: 1,
                    opacity: 1,
                    y: [0, -8, 0], // Floating bounce effect
                    boxShadow: [
                        "0 4px 15px rgba(0, 198, 251, 0.4)",
                        "0 8px 25px rgba(0, 198, 251, 0.6)",
                        "0 4px 15px rgba(0, 198, 251, 0.4)"
                    ]
                }}
                transition={{
                    y: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    },
                    boxShadow: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    },
                    scale: { duration: 0.5 },
                    opacity: { duration: 0.5 }
                }}
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0], transition: { rotate: { duration: 0.5 } } }}
                whileTap={{ scale: 0.9 }}
            >
                <span className="water-icon-emoji">💧</span>
                <span className="water-count-badge">{data.glasses}</span>
            </motion.div>

            {/* Modal */}
            {showModal && (
                <div className="water-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="water-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="water-modal-close" onClick={() => setShowModal(false)}>&times;</button>

                        <h3 className="water-modal-title">Hydration Tracker</h3>
                        <p style={{ color: '#888', marginBottom: '20px' }}>{new Date().toDateString()}</p>

                        <div className="water-progress-circle" style={{ '--progress': `${progressPercent}%` }}>
                            <div className="water-progress-inner">
                                <span className="water-stats-large">{data.glasses}</span>
                                <span className="water-stats-unit">Glasses</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginBottom: '10px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <strong>{data.total_ml}ml</strong>
                                <div style={{ fontSize: '11px', color: '#777' }}>Consumed</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <strong>{target}ml</strong>
                                <div style={{ fontSize: '11px', color: '#777' }}>Target</div>
                            </div>
                        </div>

                        <button className="water-add-btn" onClick={addWater} disabled={loading}>
                            {loading ? 'Adding...' : '+ Add 1 Glass (250ml)'}
                        </button>

                        {praise && <div className="praise-message">{praise}</div>}
                    </div>
                </div>
            )}
        </>
    );
};

export default WaterIntake;
