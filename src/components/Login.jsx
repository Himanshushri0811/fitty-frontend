import React, { useState } from 'react';
import { MdEmail, MdLock } from 'react-icons/md';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import API from './axiosConfig';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = ({ onSwitch }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
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

      // Update global auth state - this triggers PublicRoute to redirect
      login(res.data.user, { access: res.data.access, refresh: res.data.refresh });

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2 className="form-title">Welcome Back</h2>
        <p className="form-subtitle">Continuing your fitness journey with FitMitra</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label className="form-label">Username or Email</label>
        <div className="input-container">
          <MdEmail className="input-icon" />
          <input
            type="text"
            name="username"
            className="form-input"
            placeholder="Username or email"
            value={form.username}
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
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span> Logging in...
          </>
        ) : 'Login'}
      </button>

      <div className="divider">
        <span>or continue with</span>
      </div>

      <div className="social-buttons">
        <button type="button" className="social-btn google" disabled={loading}>
          <span className="social-icon"><FaGoogle /></span>
          Google
        </button>
        <button type="button" className="social-btn facebook" disabled={loading}>
          <span className="social-icon"><FaFacebook /></span>
          Facebook
        </button>
      </div>

      <p className="switch-text">
        Don't have an account?
        <span className="switch-link" onClick={onSwitch}> Sign up</span>
      </p>
    </form>
  );
};

export default Login;