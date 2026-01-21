
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdLock, MdStar, MdArrowBack, MdTrendingUp, MdSupportAgent } from 'react-icons/md';
import API from '../axiosConfig';
import { useAuth } from '../../context/AuthContext';
import './GymPlans.css';

const GymPlans = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Get current plan (default to FREE)
    // Note: VerifyPayment updates profile, but AuthContext might not have it immediately unless re-fetched.
    // relying on gym_profile.plan_type from user object if available, otherwise 'FREE'
    const currentPlan = user?.gym_profile?.plan_type || 'FREE';
    const isPro = currentPlan !== 'FREE';

    const handlePayment = async (plan, amount) => {
        if (loading) return;
        setLoading(true);

        try {
            // 1. Create Order
            const orderRes = await API.post('/api/subscriptions/order/create/', {
                amount: amount * 100, // Convert to paise
                plan: plan
            });
            const order = orderRes.data;

            // 2. Razorpay Options
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_S1nr3QbOsO5BDg',
                amount: order.amount,
                currency: order.currency,
                name: "FitMitra Manager",
                description: `Upgrade to ${plan} Plan`,
                order_id: order.id,

                handler: async (response) => {
                    try {
                        // 3. Verify Payment
                        await API.post('/api/subscriptions/verify/', response);
                        alert(`🎉 Successfully upgraded to ${plan} Plan!`);
                        navigate('/gym-dashboard'); // Redirect to dashboard
                        window.location.reload(); // Reload to refresh auth state/features
                    } catch (err) {
                        alert("Payment Verification Failed. Please contact support.");
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: () => setLoading(false)
                }
            };

            // 4. Open Razorpay
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Payment Error:", err);
            alert("Could not initiate payment. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="gym-plans-container">
            <header className="plans-header">
                <button className="back-btn" onClick={() => navigate('/gym-dashboard')}>
                    <MdArrowBack /> Back to Dashboard
                </button>
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <h1 className="text-gradient">Upgrade Your Gym</h1>
                    <p>Unlock the full power of FitMitra for just ₹399/month</p>
                </motion.div>
            </header>

            <div className="plans-grid">
                {/* FREE PLAN */}
                <motion.div
                    className="plan-card"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="card-header">
                        <h2>Free Plan</h2>
                        <div className="price">₹0<span>/month</span></div>
                        <span className="subtitle" style={{ color: 'var(--text-muted)' }}>Starter Access</span>
                    </div>
                    <ul className="features-list">
                        <li><MdCheckCircle className="icon success" /> <strong>Up to 5 Members</strong></li>
                        <li><MdCheckCircle className="icon success" /> Basic Member Directory</li>
                        <li><MdCheckCircle className="icon success" /> <strong>Limited</strong> AI Chat (Text)</li>
                        <li className="dimmed"><MdLock className="icon lock" /> <strong>Unlimited</strong> Members Added</li>
                        <li className="dimmed"><MdLock className="icon lock" /> Revenue & Fee reminders</li>
                        <li className="dimmed"><MdLock className="icon lock" /> AI Voice Assistant</li>
                    </ul>
                    <button className="plan-btn disabled" disabled>
                        {isPro ? 'Switch to Basic' : 'Current Plan'}
                    </button>
                </motion.div>

                {/* PRO PLAN - ₹399 */}
                <motion.div
                    className="plan-card featured"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.03 }}
                >
                    {isPro && <div className="badge">Active Plan</div>}
                    <div className="card-header">
                        <h2>Pro Plan</h2>
                        <div className="price">₹399<span>/month</span></div>
                        <span className="subtitle text-gradient">Most Popular</span>
                    </div>
                    <ul className="features-list">
                        <li><MdCheckCircle className="icon success" /> <strong>Unlimited</strong> Members</li>
                        <li><MdCheckCircle className="icon success" /> <strong>AI Voice Assistant</strong> & Coach</li>
                        <li><MdTrendingUp className="icon success" /> <strong>Revenue Features</strong> & Reminders</li>
                        <li><MdCheckCircle className="icon success" /> <strong>Delete/Manage</strong> Members</li>
                        <li><MdSupportAgent className="icon success" /> <strong>Priority</strong> Support 24/7</li>
                        <li><MdStar className="icon gold" /> <strong>Verified</strong> Gym Badge</li>
                    </ul>
                    {isPro ? (
                        <button className="plan-btn disabled" disabled>Already Active</button>
                    ) : (
                        <button
                            className="plan-btn primary"
                            onClick={() => handlePayment('PRO', 399)}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Upgrade Now'}
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default GymPlans;

