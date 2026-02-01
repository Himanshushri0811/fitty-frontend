import React, { useState } from 'react';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import API from '../axiosConfig';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import './Login.css';

const LoginForm = ({ onSwitch }) => {
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            return setError('Please enter username and password');
        }
        setLoading(true);
        try {
            // Backend expects 'username' but logic handles email too
            const res = await API.post('/api/accounts/login/', form, {
                headers: { 'Content-Type': 'application/json' }
            });

            login(res.data.user, { access: res.data.access, refresh: res.data.refresh });

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-form-wrapper">
            <div className="form-header">
                <h2 className="form-title">Welcome Back</h2>
                <p className="form-subtitle">Enter your details to access your account</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Email or Username</label>
                    <div className="input-container">
                        <MdEmail className="input-icon" />
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            placeholder="Enter your email or username"
                            value={form.username}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-container">
                        <MdLock className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="show-password-btn"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </form>

            <div className="divider">
                <span>Or continue with</span>
            </div>

            <div className="social-buttons">
                <button type="button" className="social-btn" disabled={loading}>
                    <FaGoogle /> Google
                </button>
                <button type="button" className="social-btn" disabled={loading}>
                    <FaFacebook /> Facebook
                </button>
            </div>

            <p className="switch-text">
                New to FitMitra?
                <span className="switch-link" onClick={onSwitch}>Create Account</span>
            </p>
        </div>
    );
};

export default LoginForm;
