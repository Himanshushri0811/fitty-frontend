import React, { useState, useEffect } from 'react';
import { MdEmail, MdLock, MdPerson, MdBusiness, MdFitnessCenter } from 'react-icons/md';
import { FaUser, FaDumbbell, FaGoogle, FaFacebook, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import API from '../axiosConfig';

const GOALS = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'general', label: 'General Fitness' },
    { value: 'endurance', label: 'Build Endurance' },
    { value: 'flexibility', label: 'Improve Flexibility' },
];

const SignupForm = ({ onSwitch }) => {
    const { login } = useAuth();

    const [role, setRole] = useState('athlete'); // 'athlete' | 'gym_owner'

    // Unified form state
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        goal: '',
        gym_name: '',
        // Hidden/Default fields for Athlete
        age: '',
        gender: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [greeting, setGreeting] = useState('');

    // Micro-interaction: Update greeting when name changes
    useEffect(() => {
        if (formData.fullName.length > 2) {
            const firstName = formData.fullName.split(' ')[0];
            setGreeting(`Nice to meet you, ${firstName} 👋`);
        } else {
            setGreeting('');
        }
    }, [formData.fullName]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setError('');
        setGreeting('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (role === 'athlete') {
            if (!formData.fullName || !formData.email || !formData.password || !formData.goal) {
                return setError('Please fill in all required fields.');
            }
        } else {
            // Gym Owner
            if (!formData.gym_name || !formData.fullName || !formData.email || !formData.password) {
                return setError('Please fill in all required fields.');
            }
        }

        setLoading(true);

        try {
            let endpoint = '/api/accounts/signup/';
            let payload = {};

            if (role === 'athlete') {
                endpoint = '/api/accounts/signup/';
                // Mapping fields to backend expectations
                // Backend expects: username, email, password, goal, (age, gender - allow empty)
                // We will use 'username' if provided, else derive from email or name? 
                // To be safe, let's require username or auto-generate. 
                // For this implementation, I'll add a Username field to the form to match backend exactly.

                payload = {
                    name: formData.fullName, // Send Full Name
                    username: formData.username || formData.email.split('@')[0], // Fallback
                    email: formData.email,
                    password: formData.password,
                    goal: formData.goal,
                    age: formData.age || null,
                    gender: formData.gender || 'other',
                };
            } else {
                endpoint = '/api/accounts/signup/gym-owner/';
                payload = {
                    gym_name: formData.gym_name,
                    name: formData.fullName, // Send Owner Name
                    username: formData.username || formData.email.split('@')[0],
                    email: formData.email,
                    password: formData.password,
                };
            }

            const res = await API.post(endpoint, payload);
            login(res.data.user, { access: res.data.access, refresh: res.data.refresh });

        } catch (err) {
            console.error(err);
            const respError = err.response?.data;
            if (typeof respError === 'object') {
                // Try to extract first error message
                const msg = Object.values(respError)[0];
                setError(Array.isArray(msg) ? msg[0] : JSON.stringify(msg));
            } else {
                setError(respError || 'Signup failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-content">
            <div className="auth-header">
                <h2>Create Account</h2>
                <p>Join the elite fitness community</p>
            </div>

            <div className="role-group">
                <div
                    className={`role-card ${role === 'athlete' ? 'active' : ''}`}
                    onClick={() => handleRoleChange('athlete')}
                >
                    <FaUser className="role-icon" />
                    <span className="role-label">Athlete</span>
                </div>
                <div
                    className={`role-card ${role === 'gym_owner' ? 'active' : ''}`}
                    onClick={() => handleRoleChange('gym_owner')}
                >
                    <MdBusiness className="role-icon" />
                    <span className="role-label">Gym Owner</span>
                </div>
            </div>

            <motion.form
                key={role} // Re-render form on role change for animation
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
            >
                {error && <div className="error-box">{error}</div>}

                {/* Common Field: Full Name (UX only if not stored, acts as Owner Name for Gym) */}
                <div className="form-group">
                    <label className="form-label">{role === 'gym_owner' ? 'Owner Full Name' : 'Full Name'}</label>
                    <div className="input-wrapper">
                        <MdPerson className="input-icon-left" />
                        <input
                            type="text"
                            name="fullName"
                            className="auth-input"
                            placeholder="e.g. John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>
                    <AnimatePresence>
                        {greeting && (
                            <motion.div
                                className="micro-copy"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <FaCheckCircle size={12} /> {greeting}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Gym Owner Specific: Gym Name */}
                {role === 'gym_owner' && (
                    <div className="form-group">
                        <label className="form-label">Gym Name</label>
                        <div className="input-wrapper">
                            <MdFitnessCenter className="input-icon-left" />
                            <input
                                type="text"
                                name="gym_name"
                                className="auth-input"
                                placeholder="e.g. Iron Paradise"
                                value={formData.gym_name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )}

                {/* Common: Username */}
                <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="input-wrapper">
                        <FaUser className="input-icon-left" />
                        <input
                            type="text"
                            name="username"
                            className="auth-input"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Common: Email */}
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrapper">
                        <MdEmail className="input-icon-left" />
                        <input
                            type="email"
                            name="email"
                            className="auth-input"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Common: Password */}
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrapper">
                        <MdLock className="input-icon-left" />
                        <input
                            type="password"
                            name="password"
                            className="auth-input"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Athlete Specific: Goal */}
                {role === 'athlete' && (
                    <div className="form-group">
                        <label className="form-label">Primary Goal</label>
                        <div className="input-wrapper">
                            <FaDumbbell className="input-icon-left" />
                            <select
                                name="goal"
                                className="auth-input"
                                value={formData.goal}
                                onChange={handleChange}
                            >
                                <option value="">Select your goal</option>
                                {GOALS.map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Creating Account...' : `Join as ${role === 'athlete' ? 'Athlete' : 'Gym Owner'}`}
                </button>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    Already have an account?
                    <span
                        onClick={onSwitch}
                        style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}
                    >
                        Log In
                    </span>
                </p>

            </motion.form>
        </div>
    );
};

export default SignupForm;
