import React, { useState } from 'react';
import { MdLock, MdVisibility, MdVisibilityOff, MdCheckCircle } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../axiosConfig';
import './Auth.css'; // Re-use styles

const InputGroup = ({ icon: Icon, toggleIcon, onToggle, ...props }) => (
    <div className="input-container">
        <input className="auth-input" {...props} />
        {Icon && <Icon className="input-icon-left" />}
        {toggleIcon && (
            <button type="button" className="password-toggle" onClick={onToggle}>
                {toggleIcon}
            </button>
        )}
    </div>
);

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Verify Token on Mount
    React.useEffect(() => {
        const verifyToken = async () => {
            try {
                await API.get(`/api/accounts/verify-reset-token/?token=${token}`);
                setTokenValid(true);
            } catch (err) {
                setTokenValid(false);
                setError(err.response?.data?.error || 'Invalid or expired reset link.');
            } finally {
                setVerifying(false);
            }
        };
        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const res = await API.post('/api/accounts/reset-password/', {
                token,
                new_password: password
            });
            setMessage(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="auth-page-wrapper">
                <div className="auth-bg-gradient"></div>
                <div className="auth-content-container" style={{ maxWidth: '500px' }}>
                    <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="spinner"></div>
                        <p>Verifying Reset Link...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="auth-page-wrapper">
                <div className="auth-bg-gradient"></div>
                <div className="auth-content-container" style={{ maxWidth: '500px' }}>
                    <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="error-msg" style={{ justifyContent: 'center' }}><MdLock /> {error}</div>
                        <button className="submit-btn" onClick={() => navigate('/auth?tab=forgot-password')} style={{ marginTop: '20px' }}>
                            Request New Link
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page-wrapper">
            <div className="auth-bg-gradient"></div>

            <div className="auth-content-container" style={{ maxWidth: '500px', minHeight: 'auto' }}>
                <div className="auth-form-panel">
                    <div className="glass-card">
                        <div className="form-title-group">
                            <h2>Reset Password</h2>
                            <p>Create a new strong password.</p>
                        </div>

                        {error && <div className="error-msg"><MdLock /> {error}</div>}
                        {message && <div className="success-msg" style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            color: '#4ade80',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <MdCheckCircle size={20} /> {message}
                            <br /> Redirecting to login...
                        </div>}

                        {!message && (
                            <form onSubmit={handleSubmit}>
                                <InputGroup
                                    icon={MdLock}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    toggleIcon={showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                    onToggle={() => setShowPassword(!showPassword)}
                                    required
                                />

                                <InputGroup
                                    icon={MdLock}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />

                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
