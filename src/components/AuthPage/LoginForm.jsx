import React, { useState } from 'react';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import API from '../axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        username: '',
        password: ''
    });

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/api/accounts/login/', form, {
                headers: { 'Content-Type': 'application/json' }
            });
            login(res.data.user, { access: res.data.access, refresh: res.data.refresh });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-form-wrapper">
            <div className="form-title-group">
                <h2>Welcome Back!</h2>
                <p>Login to continue your fitness journey</p>
            </div>

            {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-msg"><MdLock /> {error}</motion.div>}

            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <input
                        type="text"
                        className="auth-input"
                        placeholder="Username or Email"
                        value={form.username}
                        onChange={(e) => updateForm('username', e.target.value)}
                    />
                    <MdEmail className="input-icon-left" />
                </div>

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

                <div className="form-options">
                    <label className="checkbox-label">
                        <input type="checkbox" /> Remember me
                    </label>
                    <button
                        type="button"
                        className="forgot-link"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: '#818cf8' }}
                        onClick={() => navigate('/auth?tab=forgot-password')}
                    >
                        Forgot Password?
                    </button>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Logging In...' : 'Log In'}
                </button>
            </form>

            <div className="social-divider">or continue with</div>

            <div className="social-btn-row">
                <button type="button" className="social-btn"><FaGoogle /> Google</button>
                <button type="button" className="social-btn"><FaFacebook /> Facebook</button>
            </div>
        </div>
    );
};

export default LoginForm;
