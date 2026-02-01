import React, { useState } from 'react';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaUser, FaDumbbell, FaBuilding, FaGoogle, FaFacebook } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../axiosConfig';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const SignupForm = () => {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [role, setRole] = useState('USER');
    const [form, setForm] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        goal: '',
        gym_name: ''
    });

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!form.name || !form.username || !form.email || !form.password) {
            return setError("All fields are required.");
        }
        if (role === 'USER' && !form.goal) return setError("Please select a fitness goal.");
        if (role === 'GYM_OWNER' && !form.gym_name) return setError("Please enter your Gym Name.");

        setLoading(true);
        try {
            const payload = {
                ...form,
                role,
                username: form.username.toLowerCase(),
                email: form.email.toLowerCase()
            };

            const res = await API.post('/api/accounts/signup/', payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            login(res.data.user, { access: res.data.access, refresh: res.data.refresh });

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-form-wrapper">
            <div className="form-title-group">
                <h2>Create Account</h2>
                <p>Join the future of fitness</p>
            </div>

            {error && <div className="error-msg"><MdLock /> {error}</div>}

            {/* Role Selection */}
            <div className="role-grid">
                <div
                    className={`role-select-card ${role === 'USER' ? 'active' : ''}`}
                    onClick={() => setRole('USER')}
                >
                    <div className="role-icon-box"><FaUser /></div>
                    <div className="role-name">Athlete</div>
                    <div className="role-desc">For personal fitness</div>
                </div>
                <div
                    className={`role-select-card ${role === 'GYM_OWNER' ? 'active' : ''}`}
                    onClick={() => setRole('GYM_OWNER')}
                >
                    <div className="role-icon-box"><FaBuilding /></div>
                    <div className="role-name">Gym Owner</div>
                    <div className="role-desc">Manage your business</div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* 1. Full Name (Common) */}
                <div className="input-container">
                    <input
                        type="text"
                        className="auth-input"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={(e) => updateForm('name', e.target.value)}
                    />
                    <FaUser className="input-icon-left" />
                </div>

                {/* Nice to meet you Animation */}
                <AnimatePresence>
                    {form.name.length >= 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="name-feedback"
                        >
                            Nice to meet you, {form.name.split(' ')[0]} 👋
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. Gym Name (Gym Owner Only) */}
                {role === 'GYM_OWNER' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="input-container"
                    >
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Gym Name"
                            value={form.gym_name}
                            onChange={(e) => updateForm('gym_name', e.target.value)}
                        />
                        <FaBuilding className="input-icon-left" />
                    </motion.div>
                )}

                {/* 3. Username */}
                <div className="input-container">
                    <input
                        type="text"
                        className="auth-input"
                        placeholder="Username"
                        value={form.username}
                        onChange={(e) => updateForm('username', e.target.value)}
                    />
                    <FaUser className="input-icon-left" />
                </div>

                {/* 4. Email */}
                <div className="input-container">
                    <input
                        type="email"
                        className="auth-input"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                    />
                    <MdEmail className="input-icon-left" />
                </div>

                {/* 5. Password */}
                <div className="input-container">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="auth-input"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => updateForm('password', e.target.value)}
                    />
                    <MdLock className="input-icon-left" />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                </div>

                {/* 6. Fitness Goal (Athlete Only) */}
                {role === 'USER' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="input-container"
                    >
                        <div style={{ position: 'relative' }}>
                            <select
                                className="auth-input"
                                value={form.goal}
                                onChange={(e) => updateForm('goal', e.target.value)}
                                style={{ appearance: 'none', cursor: 'pointer' }}
                            >
                                <option value="" disabled hidden>Select Fitness Goal</option>
                                <option style={{ color: '#000' }} value="weight_loss">Weight Loss</option>
                                <option style={{ color: '#000' }} value="muscle_gain">Muscle Gain</option>
                                <option style={{ color: '#000' }} value="general">General Fitness</option>
                                <option style={{ color: '#000' }} value="endurance">Build Endurance</option>
                            </select>
                            <FaDumbbell className="input-icon-left" />
                        </div>
                    </motion.div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Creating Account...' : (role === 'GYM_OWNER' ? 'Create Gym Account' : 'Start My Journey')}
                </button>
            </form>

            <div className="social-divider">or join with</div>

            <div className="social-btn-row">
                <button className="social-btn"><FaGoogle /></button>
                <button className="social-btn"><FaFacebook /></button>
            </div>
        </div>
    );
};

export default SignupForm;
