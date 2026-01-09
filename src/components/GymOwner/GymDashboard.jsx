import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MdDashboard, MdPersonAdd, MdPeople, MdPayments,
    MdEventNote, MdSettings, MdLock, MdCheckCircle,
    MdNavigateNext, MdInfo
} from 'react-icons/md';
import API from '../axiosConfig';
import './GymDashboard.css';

const GymDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(false);
    const [planType, setPlanType] = useState('FREE');
    const [gymName, setGymName] = useState('FitMitra Gym');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const overviewRes = await API.get('/api/gym/dashboard/overview/');
            setStats(overviewRes.data.stats);
            setPaymentStatus(overviewRes.data.payment_status);
            setPlanType(overviewRes.data.plan_type || 'FREE');
            setGymName(overviewRes.data.gym_name);

            if (overviewRes.data.payment_status) {
                const membersRes = await API.get('/api/gym/members/');
                setMembers(membersRes.data);
            }
        } catch (err) {
            console.error("Error fetching dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgradeClick = () => {
        navigate('/gym-plans');
    };

    if (loading) return <div className="gym-loading">Loading Dashboard...</div>;

    return (
        <div className="gym-dashboard-container">
            {/* Sidebar */}
            <div className="gym-sidebar">
                <div className="sidebar-header">
                    <h2>{gymName}</h2>
                    <p>Owner Dashboard</p>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <MdDashboard /> Overview
                    </button>
                    <button className={activeTab === 'add-member' ? 'active' : ''} onClick={() => setActiveTab('add-member')}>
                        <MdPersonAdd /> Add Candidate
                    </button>
                    <button className={activeTab === 'members' ? 'active' : ''} onClick={() => setActiveTab('members')}>
                        <MdPeople /> Members List
                    </button>
                    <button className={activeTab === 'fees' ? 'active' : ''} onClick={() => setActiveTab('fees')}>
                        <MdPayments /> Fees Management
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <MdSettings /> Profile
                    </button>
                </nav>

                {!paymentStatus ? (
                    <div className="sidebar-upgrade-card">
                        <MdLock className="lock-icon" />
                        <p>Features Locked</p>
                        <button onClick={handleUpgradeClick}>
                            View Upgrade Plans
                        </button>
                    </div>
                ) : (
                    <div className="sidebar-plan-info">
                        <p className="plan-label">Current Plan</p>
                        <div className="plan-badge-sidebar">{planType}</div>
                        {planType === 'STARTER' && (
                            <button className="upgrade-link" onClick={handleUpgradeClick}>
                                Upgrade to Pro
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="gym-main-content">
                {!paymentStatus && activeTab !== 'overview' && activeTab !== 'profile' ? (
                    <LockedFeatureView onUpgrade={handleUpgradeClick} />
                ) : (
                    <div className="tab-content">
                        {activeTab === 'overview' && <OverviewTab stats={stats} paymentStatus={paymentStatus} onUpgrade={handleUpgradeClick} />}
                        {activeTab === 'add-member' && <AddMemberTab onMemberAdded={fetchDashboardData} />}
                        {activeTab === 'members' && <MembersTable members={members} />}
                        {activeTab === 'fees' && <FeesTab members={members} />}
                        {activeTab === 'profile' && <ProfileTab gymName={gymName} />}
                    </div>
                )}
            </div>
        </div>
    );
};

const LockedFeatureView = ({ onUpgrade, isProcessing }) => (
    <div className="locked-view">
        <div className="blurred-overlay">
            <div className="dummy-content">
                <div className="dummy-row"></div>
                <div className="dummy-row"></div>
                <div className="dummy-row"></div>
            </div>
        </div>
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="locked-card-premium"
        >
            <div className="premium-badge">PREMIUM</div>
            <MdLock className="huge-lock" />
            <h1>Unlock Full Access</h1>
            <p>You're currently on the Free Plan. Upgrade to manage members, track fees, and access detailed analytics.</p>

            <div className="pricing-info">
                <span className="price">₹299</span>
                <span className="period">/ one-time</span>
            </div>

            <div className="benefit-list">
                <div className="benefit-item"><MdCheckCircle /> <strong>Unlimited</strong> Member Registration</div>
                <div className="benefit-item"><MdCheckCircle /> <strong>Automated</strong> Fees Reminders</div>
                <div className="benefit-item"><MdCheckCircle /> <strong>Revenue</strong> Tracking & Analytics</div>
                <div className="benefit-item"><MdCheckCircle /> <strong>Priority</strong> Owner Support</div>
            </div>

            <button
                className="upgrade-btn-premium"
                onClick={onUpgrade}
            >
                View Plans & Upgrade
            </button>
            <p className="secure-text">🔒 Secure payment via Razorpay</p>
        </motion.div>
    </div>
);

const OverviewTab = ({ stats, paymentStatus, onUpgrade }) => (
    <div className="dashboard-overview">
        <header className="page-header">
            <h1>Workspace Overview</h1>
            <p>Overview of your gym's performance</p>
        </header>

        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon members"><MdPeople /></div>
                <div className="stat-info">
                    <span className="label">Total Members</span>
                    <span className="value">{stats?.total_members || 0}</span>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon paid"><MdCheckCircle /></div>
                <div className="stat-info">
                    <span className="label">Paid Members</span>
                    <span className="value">{stats?.paid_members || 0}</span>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon pending"><MdInfo /></div>
                <div className="stat-info">
                    <span className="label">Payment Pending</span>
                    <span className="value">{stats?.pending_members || 0}</span>
                </div>
            </div>
        </div>

        {!paymentStatus && (
            <div className="promo-banner">
                <div className="promo-text">
                    <h3>Take your gym to the next level</h3>
                    <p>Track fees, manage attendance and get detailed reports.</p>
                </div>
                <button onClick={onUpgrade}>Upgrade Now <MdNavigateNext /></button>
            </div>
        )}
    </div>
);

const AddMemberTab = ({ onMemberAdded }) => {
    const [formData, setFormData] = useState({
        name: '', mobile: '', join_date: '', fees_status: 'PENDING', fees_due_date: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post('/api/gym/members/', formData);
            alert("Member added successfully!");
            setFormData({ name: '', mobile: '', join_date: '', fees_status: 'PENDING', fees_due_date: '' });
            onMemberAdded();
        } catch (err) {
            alert("Error adding member. Please check your data.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="add-member-container">
            <header className="page-header">
                <h1>Add New Candidate</h1>
                <p>Register a new member to your gym</p>
            </header>
            <form className="gym-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="input-group">
                        <label>Mobile Number</label>
                        <input type="text" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} required />
                    </div>
                </div>
                <div className="form-row">
                    <div className="input-group">
                        <label>Join Date</label>
                        <input type="date" value={formData.join_date} onChange={e => setFormData({ ...formData, join_date: e.target.value })} required />
                    </div>
                    <div className="input-group">
                        <label>Fees Due Date</label>
                        <input type="date" value={formData.fees_due_date} onChange={e => setFormData({ ...formData, fees_due_date: e.target.value })} required />
                    </div>
                </div>
                <div className="input-group">
                    <label>Initial Fees Status</label>
                    <select value={formData.fees_status} onChange={e => setFormData({ ...formData, fees_status: e.target.value })}>
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                    </select>
                </div>
                <button type="submit" className="form-submit" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Member'}
                </button>
            </form>
        </div>
    );
};

const MembersTable = ({ members }) => (
    <div className="members-list-container">
        <header className="page-header">
            <h1>Members List</h1>
            <p>Manage all registered gym members</p>
        </header>
        <div className="table-responsive">
            <table className="gym-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Join Date</th>
                        <th>Status</th>
                        <th>Due Date</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map(m => (
                        <tr key={m.id}>
                            <td>{m.name}</td>
                            <td>{m.mobile}</td>
                            <td>{m.join_date}</td>
                            <td>
                                <span className={`status-badge ${m.fees_status.toLowerCase()}`}>
                                    {m.fees_status}
                                </span>
                            </td>
                            <td>{m.fees_due_date}</td>
                        </tr>
                    ))}
                    {members.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No members found</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
);

const FeesTab = ({ members }) => (
    <div className="fees-management">
        <header className="page-header">
            <h1>Fees Status</h1>
            <p>Track payments and pending dues</p>
        </header>
        <div className="fees-grid">
            {members.map(m => (
                <div className={`fee-card ${m.fees_status.toLowerCase()}`} key={m.id}>
                    <div className="fee-user">
                        <h4>{m.name}</h4>
                        <p>{m.mobile}</p>
                    </div>
                    <div className="fee-info">
                        <span className="due-label">Due Date:</span>
                        <span className="due-date">{m.fees_due_date}</span>
                    </div>
                    <div className="fee-action">
                        <span className={`status-txt ${m.fees_status.toLowerCase()}`}>{m.fees_status}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ProfileTab = ({ gymName }) => (
    <div className="gym-profile-tab">
        <header className="page-header">
            <h1>Gym Profile</h1>
            <p>Manage your gym details</p>
        </header>
        <div className="profile-details-card">
            <div className="profile-row">
                <label>Gym Name</label>
                <span>{gymName}</span>
            </div>
            <div className="profile-row">
                <label>Establishment Date</label>
                <span>Joined FitMitra recently</span>
            </div>
            {/* Add more profile fields as needed */}
        </div>
    </div>
);

export default GymDashboard;
