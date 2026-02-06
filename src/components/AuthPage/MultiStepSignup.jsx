import React, { useState } from 'react';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward, MdArrowBack } from 'react-icons/md';
import { FaUser, FaDumbbell, FaBuilding, FaPhone, FaBirthdayCake, FaRulerVertical, FaWeight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../axiosConfig';
import { useAuth } from '../../context/AuthContext';
import './Signup.css'; // We will use shared styles or update this

const InputGroup = ({ icon: Icon, ...props }) => (
    <div className="input-container">
        <input className="auth-input" {...props} />
        {Icon && <Icon className="input-icon-left" />}
    </div>
);

const MultiStepSignup = () => {
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [role, setRole] = useState('USER');
    const [form, setForm] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        // Profile
        mobile: '',
        gender: '',
        dob: '',
        height: '',
        weight: '',
        goal: '',
        activity_level: '',
        // Gym Owner
        gym_name: '',
        gym_address: ''
    });

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const validateStep1 = () => {
        if (!form.name || !form.email || !form.username || !form.password || !form.confirmPassword) {
            setError("All fields are required.");
            return false;
        }
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!form.mobile) {
            setError("Mobile number is required.");
            return false;
        }

        if (role === 'USER') {
            if (!form.gender || !form.dob || !form.height || !form.weight || !form.goal || !form.activity_level) {
                setError("Please complete your profile details.");
                return false;
            }
        } else {
            if (!form.gym_name) {
                setError("Gym Name is required.");
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step === 1) {
            handleNext();
            return;
        }

        if (!validateStep2()) return;

        setLoading(true);
        try {
            const payload = {
                ...form,
                role,
                username: form.username.toLowerCase(),
                email: form.email.toLowerCase(),
                // Numeric conversions
                height: form.height ? parseFloat(form.height) : undefined,
                weight: form.weight ? parseFloat(form.weight) : undefined
            };

            const res = await API.post('/api/accounts/signup/', payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            login(res.data.user, { access: res.data.access, refresh: res.data.refresh });

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-form-wrapper">
            <div className="form-title-group">
                <h2>{step === 1 ? 'Create Account' : (role === 'USER' ? 'Your Profile' : 'Gym Details')}</h2>
                <p>{step === 1 ? 'Join the future of fitness' : 'Tell us a bit more about you'}</p>
            </div>

            {error && <div className="error-msg"><MdLock /> {error}</div>}

            <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Role Selection */}
                            <div className="role-grid">
                                <div
                                    className={`role-select-card ${role === 'USER' ? 'active' : ''}`}
                                    onClick={() => setRole('USER')}
                                >
                                    <div className="role-icon-box"><FaUser /></div>
                                    <div className="role-name">Athlete</div>
                                </div>
                                <div
                                    className={`role-select-card ${role === 'GYM_OWNER' ? 'active' : ''}`}
                                    onClick={() => setRole('GYM_OWNER')}
                                >
                                    <div className="role-icon-box"><FaBuilding /></div>
                                    <div className="role-name">Gym Owner</div>
                                </div>
                            </div>

                            <InputGroup
                                icon={FaUser}
                                type="text"
                                placeholder="Full Name"
                                value={form.name}
                                onChange={(e) => updateForm('name', e.target.value)}
                            />
                            <InputGroup
                                icon={FaUser}
                                type="text"
                                placeholder="Username"
                                value={form.username}
                                onChange={(e) => updateForm('username', e.target.value)}
                            />
                            <InputGroup
                                icon={MdEmail}
                                type="email"
                                placeholder="Email Address"
                                value={form.email}
                                onChange={(e) => updateForm('email', e.target.value)}
                            />

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
                            <div className="input-container">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="auth-input"
                                    placeholder="Confirm Password"
                                    value={form.confirmPassword}
                                    onChange={(e) => updateForm('confirmPassword', e.target.value)}
                                />
                                <MdLock className="input-icon-left" />
                            </div>

                            <button type="button" className="submit-btn" onClick={handleNext}>
                                Continue <MdArrowForward />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Common Fields */}
                            <InputGroup
                                icon={FaPhone}
                                type="tel"
                                placeholder="Mobile Number"
                                value={form.mobile}
                                onChange={(e) => updateForm('mobile', e.target.value)}
                            />

                            {role === 'USER' ? (
                                <>
                                    <div className="row">
                                        <div className="col-6">
                                            <InputGroup
                                                icon={null}
                                                type="date"
                                                value={form.dob}
                                                onChange={(e) => updateForm('dob', e.target.value)}
                                                title="Date of Birth"
                                            />
                                        </div>
                                        <div className="col-6">
                                            <select
                                                className="auth-input"
                                                value={form.gender}
                                                onChange={(e) => updateForm('gender', e.target.value)}
                                            >
                                                <option value="" disabled hidden>Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-6">
                                            <InputGroup
                                                icon={FaRulerVertical}
                                                type="number"
                                                placeholder="Height (cm)"
                                                value={form.height}
                                                onChange={(e) => updateForm('height', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <InputGroup
                                                icon={FaWeight}
                                                type="number"
                                                placeholder="Weight (kg)"
                                                value={form.weight}
                                                onChange={(e) => updateForm('weight', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <select
                                        className="auth-input mb-3"
                                        value={form.goal}
                                        onChange={(e) => updateForm('goal', e.target.value)}
                                    >
                                        <option value="" disabled hidden>Select Fitness Goal</option>
                                        <option value="weight_loss">Weight Loss</option>
                                        <option value="muscle_gain">Muscle Gain</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="endurance">Build Endurance</option>
                                    </select>

                                    <select
                                        className="auth-input mb-3"
                                        value={form.activity_level}
                                        onChange={(e) => updateForm('activity_level', e.target.value)}
                                    >
                                        <option value="" disabled hidden>Activity Level</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </>
                            ) : (
                                <>
                                    <InputGroup
                                        icon={FaBuilding}
                                        type="text"
                                        placeholder="Gym Name"
                                        value={form.gym_name}
                                        onChange={(e) => updateForm('gym_name', e.target.value)}
                                    />
                                    <InputGroup
                                        icon={FaBuilding}
                                        type="text"
                                        placeholder="Gym Address (Optional)"
                                        value={form.gym_address}
                                        onChange={(e) => updateForm('gym_address', e.target.value)}
                                    />
                                </>
                            )}

                            <div className="btn-row">
                                <button type="button" className="text-btn" onClick={handleBack}>
                                    <MdArrowBack /> Back
                                </button>
                                <button type="submit" className="submit-btn full-width" disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Complete Signup'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
};

export default MultiStepSignup;
