
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdLock, MdStar, MdArrowBack } from 'react-icons/md';
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

    const handlePayment = async (plan, amount) => {
        if (loading) return;
        setLoading(true);

        try {
            // 1. Create Order
            const orderRes = await API.post('/api/gym/payment/create-order/', {
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
                        await API.post('/api/gym/payment/verify/', response);
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
                <h1>Choose Your Growth Plan</h1>
                <p>Unlock powerful tools to manage and scale your gym.</p>
            </header>

            <div className="plans-grid">
                {/* FREE PLAN */}
                <motion.div
                    className={`plan-card ${currentPlan === 'FREE' ? 'current-plan' : ''}`}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="card-header">
                        <h2>Free</h2>
                        <div className="price">₹0<span>/month</span></div>
                    </div>
                    <ul className="features-list">
                        <li><MdCheckCircle className="icon success" /> Basic Gym Profile</li>
                        <li><MdCheckCircle className="icon success" /> Read-only Member View</li>
                        <li><MdCheckCircle className="icon success" /> Manual Workout Posting</li>
                        <li className="dimmed"><MdLock className="icon lock" /> Member Management</li>
                        <li className="dimmed"><MdLock className="icon lock" /> AI Assistant</li>
                        <li className="dimmed"><MdLock className="icon lock" /> Financial Analytics</li>
                    </ul>
                    <button className="plan-btn disabled" disabled>
                        {currentPlan === 'FREE' ? 'Current Plan' : 'Basic Version'}
                    </button>
                </motion.div>

                {/* STARTER PLAN */}
                <motion.div
                    className={`plan-card featured ${currentPlan === 'STARTER' ? 'current-plan' : ''}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                >
                    {currentPlan === 'STARTER' && <div className="badge">Current Plan</div>}
                    <div className="card-header highlight">
                        <h2>Starter</h2>
                        <div className="price">₹299<span>/month</span></div>
                        <span className="subtitle">Most Popular</span>
                    </div>
                    <ul className="features-list">
                        <li><MdCheckCircle className="icon success" /> <strong>Up to 50 Members</strong></li>
                        <li><MdCheckCircle className="icon success" /> Add/Edit/Remove Members</li>
                        <li><MdCheckCircle className="icon success" /> Payment History Tracking</li>
                        <li><MdCheckCircle className="icon success" /> Basic Analytics</li>
                        <li><MdCheckCircle className="icon success" /> Standard AI Support</li>
                    </ul>
                    {currentPlan === 'STARTER' ? (
                        <button className="plan-btn disabled" disabled>Active</button>
                    ) : (
                        <button
                            className="plan-btn primary"
                            onClick={() => handlePayment('STARTER', 299)}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Upgrade using Razorpay'}
                        </button>
                    )}
                </motion.div>

                {/* PRO PLAN */}
                <motion.div
                    className={`plan-card ${currentPlan === 'PRO' ? 'current-plan' : ''}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                >
                    {currentPlan === 'PRO' && <div className="badge">Current Plan</div>}
                    <div className="card-header">
                        <h2>Pro</h2>
                        <div className="price">₹599<span>/month</span></div>
                        <span className="subtitle highlight-text">Best Value</span>
                    </div>
                    <ul className="features-list">
                        <li><MdCheckCircle className="icon success" /> <strong>Unlimited Members</strong></li>
                        <li><MdStar className="icon gold" /> <strong>Advanced Revenue Insights</strong></li>
                        <li><MdStar className="icon gold" /> <strong>Priority AI Business Coach</strong></li>
                        <li><MdCheckCircle className="icon success" /> Automated Fee Reminders</li>
                        <li><MdCheckCircle className="icon success" /> 24/7 Priority Support</li>
                    </ul>
                    {currentPlan === 'PRO' ? (
                        <button className="plan-btn disabled" disabled>Active</button>
                    ) : (
                        <button
                            className="plan-btn secondary"
                            onClick={() => handlePayment('PRO', 599)}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Go Pro'}
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default GymPlans;
