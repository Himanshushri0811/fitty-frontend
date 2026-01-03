import React, { useState } from 'react';
import API from './axiosConfig';

const GOALS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'general', label: 'General Fitness' },
  { value: 'endurance', label: 'Build Endurance' },
  { value: 'flexibility', label: 'Improve Flexibility' },
];

const Signup = ({ onSwitch }) => {
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
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      window.location.href = '/profile';
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div>
        <h2 className="form-title">Start Your Journey</h2>
        <p className="form-subtitle">Create your personalized fitness profile</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Username *</label>
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

        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Password *</label>
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

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Age</label>
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

        <div className="form-group">
          <label className="form-label">Gender</label>
          <select
            name="gender"
            className="form-input"
            value={form.gender}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Fitness Goal *</label>
        <select
          name="goal"
          className="form-input"
          value={form.goal}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="">Select your primary goal</option>
          {GOALS.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
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
          <span className="social-icon">G</span>
          Continue with Google
        </button>
        <button type="button" className="social-btn facebook" disabled={loading}>
          <span className="social-icon">f</span>
          Continue with Facebook
        </button>
      </div>

      <p className="switch-text">
        Already have an account?
        <span className="switch-link" onClick={onSwitch}> Login</span>
      </p>
    </form>
  );
};

export default Signup;