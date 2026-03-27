import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Droplets, Plus } from 'lucide-react';
import './WaterIntake.css';
import { useAuth } from '../../context/AuthContext';
import fittyVoice from '../../utils/fittyVoice';

const WaterIntake = () => {
    const { user } = useAuth();
    const [data, setData] = useState({ glasses: 0, total_ml: 0 });
    const [showModal, setShowModal] = useState(false);
    const [praise, setPraise] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) fetchIntake();
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const interval = setInterval(() => {
            checkReminder(data);
        }, 60 * 1000);
        return () => clearInterval(interval);
    }, [user, data]); 

    const fetchIntake = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            const res = await axios.get('http://127.0.0.1:8000/api/fitness/water-intake/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            window.dispatchEvent(new CustomEvent('waterUpdated', {
                detail: { glasses: res.data.glasses, total_ml: res.data.total_ml }
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

            setData(prev => ({ ...prev, ...newData }));
            window.dispatchEvent(new CustomEvent('waterUpdated', { detail: newData }));

            const msg = `Great job completing another glass! Stay hydrated.`;
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
            "Your body thanks you!"
        ];
        const randomMsg = customMsg || messages[Math.floor(Math.random() * messages.length)];
        setPraise(randomMsg);
        setTimeout(() => setPraise(''), 4000);
    };

    const checkReminder = (currentData) => {
        if (!currentData || !currentData.last_drink_at) return;
        const now = new Date();
        const [hours, minutes] = currentData.last_drink_at.split(':').map(Number);
        const lastDrinkDate = new Date();
        lastDrinkDate.setHours(hours, minutes, 0, 0);

        const diffMs = now - lastDrinkDate;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins >= 60 && diffMins < 61) notifyUser();
    };

    const notifyUser = () => {
        const msg = "Time to drink water! It's been an hour.";
        if (Notification.permission === "granted") {
            new Notification("Hydration Check 💧", { body: msg, icon: "/logo192.png" });
            fittyVoice.speak(msg);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Hydration Check 💧", { body: msg, icon: "/logo192.png" });
                    fittyVoice.speak(msg);
                }
            });
        }
    };

    if (!user) return null;

    const target = 3000;
    const progressPercent = Math.min((data.total_ml / target) * 100, 100);

    return (
        <>
            <motion.div
                className="water-floating-icon"
                onClick={() => setShowModal(true)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <Droplets size={24} className="water-icon-emoji" />
                <span className="water-count-badge">{data.glasses}</span>
            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <motion.div 
                        className="water-modal-overlay" 
                        onClick={() => setShowModal(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="water-modal-content" 
                            onClick={e => e.stopPropagation()}
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        >
                            <button className="water-modal-close" onClick={() => setShowModal(false)}>&times;</button>

                            <h3 className="water-modal-title">Hydration Tracker</h3>
                            <p className="water-modal-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>

                            <div className="water-progress-circle" style={{ '--progress': `${progressPercent}%` }}>
                                <div className="water-progress-inner">
                                    <span className="water-stats-large">{data.glasses}</span>
                                    <span className="water-stats-unit">Glasses</span>
                                </div>
                            </div>

                            <div className="water-stats-row">
                                <div className="water-stat-item">
                                    <strong>{data.total_ml}ml</strong>
                                    <span>Consumed</span>
                                </div>
                                <div className="water-stat-item">
                                    <strong>{target}ml</strong>
                                    <span>Target</span>
                                </div>
                            </div>

                            <button className="water-add-btn" onClick={addWater} disabled={loading}>
                                <Plus size={18} /> {loading ? 'Adding...' : 'Add 250ml'}
                            </button>

                            <AnimatePresence>
                                {praise && (
                                    <motion.div 
                                        className="praise-message"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {praise}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default WaterIntake;
