import React, { useState } from 'react';
import API from './axiosConfig';
import './Auth.css';

const Login = ({ onSwitch }) => {
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
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('fitty_greeting_needed', 'true');

      // Auto-redirect to admin dashboard if staff/superuser
      if (res.data.user.is_staff || res.data.user.is_superuser) {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/profile';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div>
        <h2 className="form-title">Welcome Back!</h2>
        <p className="form-subtitle">Login to continue your fitness journey</p>
        <div style={{
          marginTop: '10px',
          padding: '8px',
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#818cf8',
          textAlign: 'center',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          💡 <strong>Admin Note:</strong> Staff accounts will be redirected to the Dashboard.
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label className="form-label">Username or Email</label>
        <input
          type="text"
          name="username"
          className="form-input"
          placeholder="Enter your username or email"
          value={form.username}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <div className="form-label-wrapper">
          <label className="form-label">Password</label>
          <div className="forgot-link">
            <a href="#">Forgot password?</a>
          </div>
        </div>
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
          <span className="social-icon">G</span>
          Continue with Google
        </button>
        <button type="button" className="social-btn facebook" disabled={loading}>
          <span className="social-icon">f</span>
          Continue with Facebook
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