import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdLock, MdCheckCircle } from 'react-icons/md';
import API from './axiosConfig';
import { useAuth } from '../context/AuthContext';

const RoleGuard = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();

    // ✅ Hooks MUST be at top level
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('idle');
    // idle | processing | verifying | success | error

    // ✅ Safe early returns AFTER hooks
    if (loading) return null;
    if (!isAuthenticated) return null;

    const isGymOwner = user?.profile?.role === 'GYM_OWNER';
    const isPaid = user?.gym_profile?.payment_status === true;

    const handleUpgrade = async () => {
        try {
            setProcessing(true);
            setPaymentStatus('processing');

            const orderRes = await API.post(
                '/api/gym/payment/create-order/',
                { amount: 29900 }
            );

            const order = orderRes.data;

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_S1nr3QbOsO5BDg',
                amount: order.amount,
                currency: order.currency,
                name: user?.gym_profile?.gym_name || 'Fitty Gym',
                description: 'Upgrade to Premium',
                order_id: order.id,

                handler: async (response) => {
                    try {
                        setPaymentStatus('verifying');
                        await API.post('/api/gym/payment/verify/', response);
                        setPaymentStatus('success');
                        alert('Upgrade successful!');
                        window.location.reload();
                    } catch (err) {
                        setPaymentStatus('error');
                        setProcessing(false);
                        alert('Payment verification failed.');
                    }
                },

                modal: {
                    ondismiss: () => {
                        setProcessing(false);
                        setPaymentStatus('idle');
                    },
                },

                prefill: {
                    name: user?.username,
                    email: user?.email,
                },

                theme: { color: '#FF4B2B' },
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', () => {
                setProcessing(false);
                setPaymentStatus('error');
                alert('Payment failed. Please try again.');
            });

            rzp.open();
        } catch (err) {
            console.error('Payment Init Error:', err);
            setProcessing(false);
            setPaymentStatus('error');
            alert('Could not initiate payment.');
        }
    };

    // 🔒 Premium Guard UI
    if (isGymOwner && !isPaid) {
        return (
            <div
                style={{
                    minHeight: '80vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#0c0c0e',
                    padding: '40px',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: '#141416',
                        padding: '50px',
                        borderRadius: '24px',
                        maxWidth: '600px',
                        border: '1px solid #232326',
                        textAlign: 'center',
                    }}
                >
                    <MdLock style={{ fontSize: '5rem', color: '#FFB800' }} />

                    <h2 style={{ color: '#fff', marginTop: '20px' }}>
                        Premium Access Required
                    </h2>

                    <p style={{ color: '#808191', marginTop: '10px' }}>
                        Upgrade to Premium to unlock this feature.
                    </p>

                    <div style={{ margin: '25px 0' }}>
                        <span style={{ color: '#2dc96e', display: 'block' }}>
                            <MdCheckCircle /> All Gym Features
                        </span>
                        <span style={{ color: '#2dc96e', display: 'block' }}>
                            <MdCheckCircle /> Priority Support
                        </span>
                    </div>

                    {paymentStatus === 'error' && (
                        <div
                            style={{
                                color: '#ff4d4d',
                                background: 'rgba(255,0,0,0.1)',
                                padding: '10px',
                                borderRadius: '8px',
                                marginBottom: '15px',
                            }}
                        >
                            Payment failed. Please retry.
                        </div>
                    )}

                    <button
                        onClick={handleUpgrade}
                        disabled={processing}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: processing ? 'not-allowed' : 'pointer',
                            background: processing
                                ? '#333'
                                : 'linear-gradient(135deg, #FF4B2B, #FF416C)',
                            color: '#fff',
                        }}
                    >
                        {processing ? 'Processing...' : 'Unlock for ₹299'}
                    </button>
                </motion.div>
            </div>
        );
    }

    return children;
};

export default RoleGuard;
