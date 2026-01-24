import React, { useState } from 'react';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import API from '../axiosConfig';

const LoginForm = ({ onSwitch }) => {
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            return setError('Please enter your credentials.');
        }
        setLoading(true);
        try {
            // NOTE: Using the same endpoint as before
            const res = await API.post('/api/accounts/login/', form, {
                headers: { 'Content-Type': 'application/json' }
            });
            // Trigger login context
            login(res.data.user, { access: res.data.access, refresh: res.data.refresh });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit}
            className="auth-form-content"
        >
            <div className="auth-header">
                <h2>Welcome Back</h2>
                <p>Continue your fitness journey</p>
            </div>

            {error && (
                <motion.div
                    className="error-box"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {error}
                </motion.div>
            )}

            <div className="form-group">
                <label className="form-label">Username</label>
                <div className="input-wrapper">
                    <MdEmail className="input-icon-left" />
                    <input
                        type="text"
                        name="username"
                        className="auth-input"
                        placeholder="Username or email"
                        value={form.username}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                    <MdLock className="input-icon-left" />
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="auth-input"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            zIndex: 2
                        }}
                    >
                        {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>Forgot password?</a>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
            </button>

            <div style={{ margin: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                or continue with
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <FaGoogle /> Google
                </button>
                <button type="button" className="btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <FaFacebook /> Facebook
                </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                Don't have an account?
                <span
                    onClick={onSwitch}
                    style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}
                >
                    Sign Up
                </span>
            </p>
        </motion.form>
    );
};

export default LoginForm;
