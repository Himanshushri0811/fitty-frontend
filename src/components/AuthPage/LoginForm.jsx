import React, { useState } from 'react';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaUser, FaGoogle, FaFacebook } from 'react-icons/fa';
import API from '../axiosConfig';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const LoginForm = () => {
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
            <div className="form-title-group">
                <h2>Welcome Back</h2>
                <p>Continue your fitness journey</p>
            </div>

            {error && <div className="error-msg"><MdLock /> {error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Username / Email */}
                <div className="input-container">
                    <input
                        type="text"
                        className="auth-input"
                        placeholder="Username or Email"
                        value={form.username}
                        onChange={handleChange}
                        name="username"
                        required
                    />
                    <FaUser className="input-icon-left" />
                </div>

                {/* Password */}
                <div className="input-container">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="auth-input"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        name="password"
                        required
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

                <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                    <button type="button" style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer' }}>
                        Forgot password?
                    </button>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </form>

            <div className="social-divider">or continue with</div>

            <div className="social-btn-row">
                <button className="social-btn"><FaGoogle /></button>
                <button className="social-btn"><FaFacebook /></button>
            </div>
        </div>
    );
};

export default LoginForm;
