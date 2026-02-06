import React, { useState, useEffect } from 'react';
import { MdEmail, MdArrowBack, MdSend } from 'react-icons/md';
import { motion } from 'framer-motion';
import API from '../axiosConfig';

const InputGroup = ({ icon: Icon, error, ...props }) => (
    <div className="input-group-wrapper">
        <div className={`input-container ${error ? 'input-error' : ''}`}>
            <input className="auth-input" {...props} />
            {Icon && <Icon className="input-icon-left" />}
        </div>
        {error && <span className="field-error-text">{error}</span>}
    </div>
);

const ForgotPassword = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [fieldError, setFieldError] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);

    // Real-time Validation
    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setFieldError('');
            setIsFormValid(false);
        } else if (!emailRegex.test(email)) {
            setFieldError('Enter a valid email address');
            setIsFormValid(false);
        } else {
            setFieldError('');
            setIsFormValid(true);
        }
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid || loading) return;

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await API.post('/api/accounts/forgot-password/', { email });
            setMessage(res.data.message || 'If an account exists, a reset link has been sent.');
            setEmail(''); // Clear input on success
            setIsFormValid(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-form-wrapper">
            <div className="form-title-group">
                <h2>Forgot Password?</h2>
                <p>Enter your email to receive a reset link.</p>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {message && <div className="success-msg" style={{
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#4ade80',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>{message}</div>}

            <form onSubmit={handleSubmit}>
                <InputGroup
                    icon={MdEmail}
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    error={fieldError}
                />

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={!isFormValid || loading}
                    style={{ opacity: (!isFormValid || loading) ? 0.6 : 1, cursor: (!isFormValid || loading) ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Sending...' : 'Send Reset Link'} <MdSend />
                </button>

                <div className="btn-row" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                    <button type="button" className="text-btn" onClick={onBack}>
                        <MdArrowBack /> Back to Login
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ForgotPassword;
