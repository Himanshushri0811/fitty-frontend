import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdEmail, MdLock, MdPerson, MdBusiness, MdFitnessCenter } from 'react-icons/md';
import { FaArrowLeft } from 'react-icons/fa';
import API from '../axiosConfig';
import '../Auth.css';

import { useAuth } from '../../context/AuthContext';

const GymOwnerSignup = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        gym_name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.email || !form.password || !form.gym_name) {
            return setError('Please fill in all fields');
        }

        setLoading(true);
        try {
            const res = await API.post('/api/accounts/signup/gym-owner/', form);

            // Login and trigger auto-redirect
            login(res.data.user, { access: res.data.access, refresh: res.data.refresh });

        } catch (err) {
            const respErrors = err.response?.data;
            if (typeof respErrors === 'object') {
                const firstError = Object.values(respErrors)[0];
                setError(Array.isArray(firstError) ? firstError[0] : JSON.stringify(firstError));
            } else {
                setError('Signup failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="auth-right" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
                    <button className="back-home" onClick={() => navigate('/auth?tab=signup')} style={{ marginBottom: '20px' }}>
                        <FaArrowLeft /> Back to Signup
                    </button>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-header">
                            <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #FF4B2B, #FF416C)', margin: '0 auto 15px' }}>
                                <MdFitnessCenter style={{ color: 'white', fontSize: '24px' }} />
                            </div>
                            <h2 className="form-title">Gym Owner Registration</h2>
                            <p className="form-subtitle">Scale your fitness business with FitMitra</p>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Gym Name</label>
                            <div className="input-container">
                                <MdBusiness className="input-icon" />
                                <input
                                    type="text"
                                    name="gym_name"
                                    className="form-input"
                                    placeholder="e.g. Powerhouse Gym"
                                    value={form.gym_name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div className="input-container">
                                <MdPerson className="input-icon" />
                                <input
                                    type="text"
                                    name="username"
                                    className="form-input"
                                    placeholder="Choose a username"
                                    value={form.username}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="input-container">
                                <MdEmail className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="owner@gym.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-container">
                                <MdLock className="input-icon" />
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="Create a strong password"
                                    value={form.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Register as Gym Owner'}
                        </button>

                        <p className="switch-text" style={{ marginTop: '20px' }}>
                            Already registered?
                            <span className="switch-link" onClick={() => navigate('/login')}> Login</span>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default GymOwnerSignup;
