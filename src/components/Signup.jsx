import React, { useState } from 'react';
import { MdEmail, MdLock, MdCalendarToday } from 'react-icons/md';
import { FaUser, FaDumbbell, FaTransgender, FaGoogle, FaFacebook } from 'react-icons/fa';
import API from './axiosConfig';

import { useAuth } from '../context/AuthContext';

const GOALS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'general', label: 'General Fitness' },
  { value: 'endurance', label: 'Build Endurance' },
  { value: 'flexibility', label: 'Improve Flexibility' },
];

const Signup = ({ onSwitch }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    goal: '',
    age: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.goal) {
      return setError('Please fill all required fields (*)');
    }
    setLoading(true);
    try {
      const res = await API.post('/api/accounts/signup/', form, {
        headers: { 'Content-Type': 'application/json' }
      });
      // This will trigger PublicRoute to redirect to dashboard
      login(res.data.user, { access: res.data.access, refresh: res.data.refresh });
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2 className="form-title">Join Fitty</h2>
        <p className="form-subtitle">Choose your path to begin</p>
      </div>

      <div className="role-selector-signup" style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '25px',
        background: 'var(--bg-main)',
        padding: '8px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)'
      }}>
        <div
          onClick={() => { }}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            color: 'white',
            fontWeight: '700',
            fontSize: '0.9rem'
          }}
        >
          I am an Athlete
        </div>
        <div
          onClick={() => window.location.href = '/signup/gym-owner'}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
            background: 'transparent',
            color: 'var(--text-dim)',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}
        >
          I am a Gym Owner
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Username *</label>
          <div className="input-container">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email *</label>
          <div className="input-container">
            <MdEmail className="input-icon" />
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Password *</label>
        <div className="input-container">
          <MdLock className="input-icon" />
          <input
            type="password"
            name="password"
            className="form-input"
            placeholder="Min 8 characters"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Age</label>
          <div className="input-container">
            <MdCalendarToday className="input-icon" />
            <input
              type="number"
              name="age"
              className="form-input"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
              disabled={loading}
              min="10"
              max="100"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Gender</label>
          <div className="input-container">
            <FaTransgender className="input-icon" />
            <select
              name="gender"
              className="form-input"
              value={form.gender}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Fitness Goal *</label>
        <div className="input-container">
          <FaDumbbell className="input-icon" />
          <select
            name="goal"
            className="form-input"
            value={form.goal}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Choose your primary goal</option>
            {GOALS.map(g => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span> Creating Account...
          </>
        ) : 'Create Account'}
      </button>

      <div className="divider">
        <span>or sign up with</span>
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
        Already have an account?
        <span className="switch-link" onClick={onSwitch}> Login</span>
      </p>
      <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', color: '#808191' }}>
        Are you a Gym Owner?
        <span
          style={{ color: '#FF4B2B', cursor: 'pointer', marginLeft: '5px', fontWeight: '600' }}
          onClick={() => window.location.href = '/signup/gym-owner'}
        >
          Register here
        </span>
      </div>
    </form>
  );
};

export default Signup;