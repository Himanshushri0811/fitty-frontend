import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Chip,
    Card,
    CardContent,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    FitnessCenter,
    Group,
    AttachMoney,
    Star,
    CheckCircle,
    Lock,
    Timer
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper to load Razorpay script
const loadRazorpay = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const GymOwnerDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${API_BASE_URL}/gym/dashboard/overview/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDashboardData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleUpgrade = async () => {
        setProcessingPayment(true);
        const token = localStorage.getItem('access_token');

        // 1. Load Razorpay SDK
        const res = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            setProcessingPayment(false);
            return;
        }

        try {
            // 2. Create Order
            const orderRes = await axios.post(
                `${API_BASE_URL}/gym/payment/create-order/`,
                { amount: 399, plan: 'PRO' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const orderData = orderRes.data; // { id: "order_xyz", amount: 39900, ... }

            // 3. Open Razorpay Checkout used Options
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_YourKeyShouldBeHere", // Make sure this is in your Frontend .env
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Fitty Pro Upgrade",
                description: "Unlimited Access for 30 Days",
                order_id: orderData.id,
                handler: async function (response) {
                    // 4. Verify Payment on Backend
                    try {
                        await axios.post(
                            `${API_BASE_URL}/gym/payment/verify/`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        alert("Upgrade Successful! Welcome to Pro.");
                        fetchDashboardData(); // Refresh UI
                    } catch (verifyError) {
                        alert("Payment Verification Failed. Contact Support.");
                    }
                },
                prefill: {
                    name: dashboardData?.gym_name || "Gym Owner",
                    email: "owner@example.com", // You can fetch real email from profile
                    contact: ""
                },
                theme: {
                    color: "#E2F009", // Fitty Brand Color
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            alert("Error starting payment: " + (err.response?.data?.message || err.message));
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress sx={{ color: '#E2F009' }} />
            </Box>
        );
    }

    const isPro = dashboardData?.plan_type === 'PRO';

    // Calculate stats for display
    const { total_members, paid_members, pending_members } = dashboardData?.stats || {};
    const limit = dashboardData?.max_members_allowed;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Welcome, {dashboardData?.gym_name}
                </Typography>
                <Chip
                    icon={isPro ? <Star /> : <FitnessCenter />}
                    label={isPro ? "PRO MEMBER" : "FREE PLAN"}
                    sx={{
                        bgcolor: isPro ? '#E2F009' : '#444',
                        color: isPro ? 'black' : 'white',
                        fontWeight: 'bold',
                        px: 2
                    }}
                />
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: '#1E1E1E', color: 'white', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Group sx={{ color: '#E2F009', mr: 2 }} />
                            <Typography variant="h6">Total Members</Typography>
                        </Box>
                        <Typography variant="h3">{total_members} / {isPro ? '∞' : limit}</Typography>
                        <Typography variant="body2" color="gray">
                            {limit - total_members} slots remaining
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: '#1E1E1E', color: 'white', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CheckCircle sx={{ color: '#4CAF50', mr: 2 }} />
                            <Typography variant="h6">Fee Paid</Typography>
                        </Box>
                        <Typography variant="h3">{paid_members}</Typography>
                        <Typography variant="body2" color="gray">
                            Active Members
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: '#1E1E1E', color: 'white', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AttachMoney sx={{ color: '#FF5252', mr: 2 }} />
                            <Typography variant="h6">Pending Fees</Typography>
                        </Box>
                        <Typography variant="h3">{pending_members}</Typography>
                        <Typography variant="body2" color="gray">
                            Action Required
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Subscription Status Section */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ bgcolor: '#1E1E1E', color: 'white', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>Subscription Status</Typography>

                            {isPro ? (
                                <Box>
                                    <Typography variant="body1" sx={{ color: '#4CAF50', display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <CheckCircle sx={{ mr: 1 }} /> Your Pro Plan is Active
                                    </Typography>
                                    <Typography>
                                        Expires on: {new Date(dashboardData.plan_expiry).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box>
                                    <Typography variant="body1" paragraph>
                                        You are currently on the Free Plan. You are limited to 25 members and have restricted access to analytics.
                                    </Typography>
                                    <List>
                                        <ListItem disablePadding><ListItemIcon><Lock sx={{ color: 'gray' }} /></ListItemIcon><ListItemText primary="Unlock Unlimited Members" /></ListItem>
                                        <ListItem disablePadding><ListItemIcon><Lock sx={{ color: 'gray' }} /></ListItemIcon><ListItemText primary="Revenue Analytics" /></ListItem>
                                        <ListItem disablePadding><ListItemIcon><Lock sx={{ color: 'gray' }} /></ListItemIcon><ListItemText primary="Automated Reminders" /></ListItem>
                                    </List>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: isPro ? '#2C3E50' : '#E2F009', height: '100%', color: isPro ? 'white' : 'black' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>

                            {isPro ? (
                                <>
                                    <Star sx={{ fontSize: 60, mb: 2, color: '#F1C40F' }} />
                                    <Typography variant="h5">Pro Active</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Thank you for being a premium partner!</Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>UPGRADE</Typography>
                                    <Typography variant="h6">TO PRO</Typography>
                                    <Typography variant="h3" sx={{ mt: 2, fontWeight: 'bold' }}>₹399</Typography>
                                    <Typography variant="body2">/ month</Typography>

                                    <Button
                                        variant="contained"
                                        sx={{ mt: 3, bgcolor: 'black', color: 'white', '&:hover': { bgcolor: '#333' } }}
                                        fullWidth
                                        onClick={handleUpgrade}
                                        disabled={processingPayment}
                                    >
                                        {processingPayment ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Upgrade Now"}
                                    </Button>
                                </>
                            )}

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default GymOwnerDashboard;
