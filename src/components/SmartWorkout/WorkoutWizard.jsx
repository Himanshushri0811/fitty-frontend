import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Activity, Calendar, User, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import API from '../axiosConfig';
import './SmartWorkout.css';

const WorkoutWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        age: '',
        weight: '',
        height: '',
        gender: 'Male',
        goal: 'General Fitness',
        experience_level: 'Beginner',
        equipment: [],
        days_per_week: 5,
        injuries: 'None'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEquipmentToggle = (item) => {
        setFormData(prev => {
            const current = prev.equipment;
            if (current.includes(item)) {
                return { ...prev, equipment: current.filter(i => i !== item) };
            } else {
                return { ...prev, equipment: [...current, item] };
            }
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // API Call to Generate Workout
            const response = await API.post('/api/workouts/generate/', formData);
            if (response.data && response.data.plan) {
                // Success
                navigate('/workout');
            }
        } catch (error) {
            console.error("Failed to generate workout", error);
            alert("AI Generation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    // Animation variants
    const variants = {
        enter: { x: 100, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -100, opacity: 0 }
    };

    return (
        <div className="wizard-container">
            <div className="wizard-card">
                <div className="wizard-progress">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                    <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                </div>

                <h2 className="wizard-title">
                    {step === 1 && "Start Your Journey"}
                    {step === 2 && "Define Your Goals"}
                    {step === 3 && "Setup Training"}
                </h2>

                <AnimatePresence mode='wait'>
                    {step === 1 && (
                        <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" className="step-content">
                            <div className="input-group">
                                <label><User size={18} /> Age</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Years" />
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>Weight (kg)</label>
                                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Height (cm)</label>
                                    <input type="number" name="height" value={formData.height} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <button className="primary-btn" onClick={nextStep}>Next <ArrowRight size={18} /></button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" className="step-content">
                            <div className="input-group">
                                <label><Activity size={18} /> Fitness Goal</label>
                                <div className="options-grid">
                                    {['Fat Loss', 'Muscle Gain', 'Strength', 'General Fitness'].map(g => (
                                        <button key={g}
                                            className={`option-btn ${formData.goal === g ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, goal: g })}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Experience Level</label>
                                <div className="options-grid">
                                    {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                                        <button key={l}
                                            className={`option-btn ${formData.experience_level === l ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, experience_level: l })}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="btn-row">
                                <button className="secondary-btn" onClick={prevStep}>Back</button>
                                <button className="primary-btn" onClick={nextStep}>Next <ArrowRight size={18} /></button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" className="step-content">
                            <div className="input-group">
                                <label><Dumbbell size={18} /> Available Equipment</label>
                                <div className="options-grid small">
                                    {['None (Bodyweight)', 'Dumbbells', 'Barbell', 'Full Gym', 'Resistance Bands'].map(eq => (
                                        <button key={eq}
                                            className={`option-btn ${formData.equipment.includes(eq) ? 'selected' : ''}`}
                                            onClick={() => handleEquipmentToggle(eq)}
                                        >
                                            {formData.equipment.includes(eq) && <CheckCircle size={14} />} {eq}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group">
                                <label><Calendar size={18} /> Days Per Week: {formData.days_per_week}</label>
                                <input
                                    type="range" min="2" max="7" step="1"
                                    name="days_per_week"
                                    value={formData.days_per_week}
                                    onChange={handleChange}
                                    className="range-slider"
                                />
                            </div>

                            <div className="btn-row">
                                <button className="secondary-btn" onClick={prevStep}>Back</button>
                                <button className="primary-btn glow" onClick={handleSubmit} disabled={loading}>
                                    {loading ? <><Loader2 className="spin" /> Generating AI Plan...</> : "Generate My Plan"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WorkoutWizard;
