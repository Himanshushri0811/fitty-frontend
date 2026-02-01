import React, { useState } from 'react';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md';
import { FaUser, FaDumbbell, FaBuilding, FaGoogle, FaFacebook } from 'react-icons/fa';
import API from '../axiosConfig';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import './Signup.css';

const SignupForm = ({ onSwitch }) => {
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Unified Form State
    const [form, setForm] = useState({
        role: '',
        name: '',
        username: '',
        email: '',
        password: '',
        goal: '',
        gym_name: '',
        // Defaults for API compatibility
        age: '',
        gender: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const nextStep = () => {
        if (step === 1 && !form.role) return setError("Please select a role to continue.");
        if (step === 2) {
            if (!form.name || !form.email || !form.username) return setError("Please fill in all fields.");
            // Simple email validation regex
            if (!/\S+@\S+\.\S+/.test(form.email)) return setError("Please enter a valid email.");
        }
        setStep(prev => prev + 1);
        setError('');
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.password) return setError("Password is required.");
        if (form.role === 'USER' && !form.goal) return setError("Please select a fitness goal.");
        if (form.role === 'GYM_OWNER' && !form.gym_name) return setError("Please enter your Gym Name.");

        setLoading(true);
        try {
            // Prepare payload based on backend expectations
            const payload = {
                ...form,
                // Ensure username is lowercased as per backend refactor
                username: form.username.toLowerCase(),
                email: form.email.toLowerCase()
            };

            const res = await API.post('/api/accounts/signup/', payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            // Navigate/Login on success
            login(res.data.user, { access: res.data.access, refresh: res.data.refresh });

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.response?.data?.detail || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER STEPS ---

    // STEP 1: Role Selection
    const renderStep1 = () => (
        <div className="step-content">
            <div className="form-header">
                <h2 className="form-title">Select Your Role</h2>
                <p className="form-subtitle">How will you be using FitMitra?</p>
            </div>

            <div className="role-cards">
                <div
                    className={`role-card ${form.role === 'USER' ? 'selected' : ''}`}
                    onClick={() => updateForm('role', 'USER')}
                >
                    <div className="role-icon"><FaUser /></div>
                    <div className="role-info">
                        <h3>I am an Athlete</h3>
                        <p>I want to train, track my diet, and improve my fitness.</p>
                    </div>
                </div>

                <div
                    className={`role-card ${form.role === 'GYM_OWNER' ? 'selected' : ''}`}
                    onClick={() => updateForm('role', 'GYM_OWNER')}
                >
                    <div className="role-icon"><FaBuilding /></div>
                    <div className="role-info">
                        <h3>I am a Gym Owner</h3>
                        <p>I want to manage members, payments, and branding.</p>
                    </div>
                </div>
            </div>

            <button className="submit-btn" onClick={nextStep} style={{ marginTop: '30px' }}>
                Continue
            </button>
        </div>
    );

    // STEP 2: Basic Info
    const renderStep2 = () => (
        <div className="step-content">
            <button className="back-btn" onClick={prevStep}><MdArrowBack /> Back</button>
            <div className="form-header">
                <h2 className="form-title">Basic Details</h2>
                <p className="form-subtitle">Let's get to know you better</p>
            </div>

            <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-container">
                    <FaUser className="input-icon" />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => updateForm('name', e.target.value)}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Username</label>
                <div className="input-container">
                    <FaUser className="input-icon" />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="johndoe123"
                        value={form.username}
                        onChange={(e) => updateForm('username', e.target.value)}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-container">
                    <MdEmail className="input-icon" />
                    <input
                        type="email"
                        className="form-input"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                    />
                </div>
            </div>

            <button className="submit-btn" onClick={nextStep}>
                Next Step
            </button>
        </div>
    );

    // STEP 3: Specifics & Password
    const renderStep3 = () => (
        <div className="step-content">
            <button className="back-btn" onClick={prevStep}><MdArrowBack /> Back</button>
            <div className="form-header">
                <h2 className="form-title">Final Details</h2>
                <p className="form-subtitle">Secure your account</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-container">
                        <MdLock className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-input"
                            placeholder="Min 8 characters"
                            value={form.password}
                            onChange={(e) => updateForm('password', e.target.value)}
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

                {form.role === 'USER' ? (
                    <div className="form-group">
                        <label className="form-label">Fitness Goal</label>
                        <div className="input-container">
                            <FaDumbbell className="input-icon" />
                            <select
                                className="form-input"
                                value={form.goal}
                                onChange={(e) => updateForm('goal', e.target.value)}
                            >
                                <option value="">Select Goal</option>
                                <option value="weight_loss">Weight Loss</option>
                                <option value="muscle_gain">Muscle Gain</option>
                                <option value="general">General Fitness</option>
                                <option value="endurance">Build Endurance</option>
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="form-group">
                        <label className="form-label">Gym Name</label>
                        <div className="input-container">
                            <FaBuilding className="input-icon" />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Gold's Gym"
                                value={form.gym_name}
                                onChange={(e) => updateForm('gym_name', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Complete Signup'}
                </button>
            </form>
        </div>
    );

    return (
        <div className="signup-form-wrapper">
            {/* Progress Dots */}
            <div className="step-indicator">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`step-dot ${step >= i ? 'active' : ''}`} />
                ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {step === 1 && (
                <>
                    <div className="divider">
                        <span>Or sign up with</span>
                    </div>
                    <div className="social-buttons">
                        <button type="button" className="social-btn"><FaGoogle /> Google</button>
                        <button type="button" className="social-btn"><FaFacebook /> Facebook</button>
                    </div>
                    <p className="switch-text">
                        Already have an account?
                        <span className="switch-link" onClick={onSwitch}>Login</span>
                    </p>
                </>
            )}
        </div>
    );
};

export default SignupForm;
