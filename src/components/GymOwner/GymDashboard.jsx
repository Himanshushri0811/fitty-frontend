import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdDashboard, MdPersonAdd, MdPeople, MdPayments,
    MdEventNote, MdSettings, MdLock, MdCheckCircle,
    MdNavigateNext, MdInfo, MdStar, MdDelete, MdWarning,
    MdNotifications, MdClose
} from 'react-icons/md';
import API from '../axiosConfig';
import './GymDashboard.css';

const FREE_MEMBER_LIMIT = 5;

const GymDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(false); // True if Pro
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

            // Fetch members list
            const membersRes = await API.get('/api/gym/members/');
            setMembers(membersRes.data);

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

    const isPremium = paymentStatus;
    const memberCount = members.length;

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
                        <MdPersonAdd /> Add Member
                        {!isPremium && memberCount >= FREE_MEMBER_LIMIT && <MdLock size={14} style={{ marginLeft: 'auto', color: 'var(--warning)' }} />}
                    </button>
                    <button className={activeTab === 'members' ? 'active' : ''} onClick={() => setActiveTab('members')}>
                        <MdPeople /> Members List
                    </button>
                    <button className={activeTab === 'fees' ? 'active' : ''} onClick={() => setActiveTab('fees')}>
                        <MdPayments /> Fees & Dues
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <MdSettings /> Profile
                    </button>
                </nav>

                {!isPremium ? (
                    <div className="sidebar-upgrade-card">
                        <div className="upgrade-header">
                            <MdStar className="lock-icon" />
                            <span>Free Plan</span>
                        </div>
                        <div className="limit-bar">
                            <div className="limit-progress" style={{ width: `${Math.min((memberCount / FREE_MEMBER_LIMIT) * 100, 100)}%` }}></div>
                        </div>
                        <p className="limit-text">{memberCount}/{FREE_MEMBER_LIMIT} Members Used</p>

                        <button onClick={handleUpgradeClick}>
                            Upgrade to Pro (₹399)
                        </button>
                    </div>
                ) : (
                    <div className="sidebar-plan-info">
                        <p className="plan-label">Plan Active</p>
                        <div className="plan-badge-sidebar">{planType}</div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="gym-main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

                <div className="tab-content-scrollable" style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
                    {activeTab === 'overview' && (
                        <OverviewTab
                            stats={stats}
                            isPremium={isPremium}
                            onUpgrade={handleUpgradeClick}
                        />
                    )}
                    {activeTab === 'add-member' && (
                        <AddMemberTab
                            onMemberAdded={fetchDashboardData}
                            isPremium={isPremium}
                            memberCount={memberCount}
                            onUpgrade={handleUpgradeClick}
                        />
                    )}
                    {activeTab === 'members' && (
                        <MembersTable
                            members={members}
                            onDeleteRefresh={fetchDashboardData}
                            isPremium={isPremium}
                        />
                    )}
                    {activeTab === 'fees' && (
                        <FeesTab
                            members={members}
                            isPremium={isPremium}
                            onUpgrade={handleUpgradeClick}
                        />
                    )}
                    {activeTab === 'profile' && <ProfileTab gymName={gymName} />}
                </div>
            </div>
        </div>
    );
};

/* --- SUB COMPONENTS --- */

const FeatureLockOverlay = ({ title, description, onUpgrade }) => (
    <div className="lock-overlay">
        <motion.div
            className="lock-message-box"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
        >
            <div className="lock-icon-circle">
                <MdLock />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <button className="upgrade-btn-small" onClick={onUpgrade}>
                Upgrade to Pro (₹399)
            </button>
        </motion.div>
    </div>
);

const OverviewTab = ({ stats, isPremium, onUpgrade }) => (
    <div className="dashboard-overview animate-fade-in">
        <header className="page-header">
            <h1>Workspace Overview</h1>
            <p>Welcome back, here's what's happening today.</p>
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
                    <span className="label">Dues Pending</span>
                    <span className="value">{stats?.pending_members || 0}</span>
                </div>
            </div>
        </div>

        {!isPremium && (
            <div className="promo-banner card-premium" style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div className="promo-text" style={{ flex: 1, minWidth: '300px' }}>
                    <h3 style={{ color: 'white', marginBottom: '8px' }}>Unlock Limitless Growth 🚀</h3>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                        You're currently on the <strong>Free Plan</strong> (Limit: {FREE_MEMBER_LIMIT} members).
                        Upgrade to <strong>Pro</strong> for unlimited members, AI Voice Assistant, and Priority Support.
                    </p>
                </div>
                <button
                    onClick={onUpgrade}
                    style={{
                        background: 'white',
                        color: '#4f46e5',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '30px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Upgrade to Pro - ₹399/mo <MdNavigateNext />
                </button>
            </div>
        )}
    </div>
);

const AddMemberTab = ({ onMemberAdded, isPremium, memberCount, onUpgrade }) => {
    const [formData, setFormData] = useState({
        name: '', mobile: '', join_date: '', fees_status: 'PENDING', fees_due_date: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Lock condition: Free plan AND limit reached
    const isLocked = !isPremium && memberCount >= FREE_MEMBER_LIMIT;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post('/api/gym/members/', formData);
            alert("Member added successfully!");
            setFormData({ name: '', mobile: '', join_date: '', fees_status: 'PENDING', fees_due_date: '' });
            onMemberAdded();
        } catch (err) {
            alert("Error adding member.");
        } finally {
            setSubmitting(false);
        }
    };

    if (isLocked) {
        return (
            <div className="add-member-container blur-section-container">
                <header className="page-header">
                    <h1>Add New Member</h1>
                    <p>Register a new member (Free Limit: {FREE_MEMBER_LIMIT})</p>
                </header>
                <div className="gym-form blur-content">
                    {/* Dummy Form for blurred effect */}
                    <div className="form-row">
                        <div className="input-group"><label>Full Name</label><input type="text" /></div>
                        <div className="input-group"><label>Mobile Number</label><input type="text" /></div>
                    </div>
                </div>
                <FeatureLockOverlay
                    title="Member Limit Reached 🔒"
                    description={`You have reached the limit of ${FREE_MEMBER_LIMIT} members on the Free Plan.Upgrade to Pro for UNLIMITED additions.`}
                    onUpgrade={onUpgrade}
                />
            </div>
        );
    }

    return (
        <div className="add-member-container animate-fade-in">
            <header className="page-header">
                <h1>Add New Member</h1>
                <p>Register a new member to your gym {!isPremium && <span style={{ color: 'var(--warning)', fontWeight: '600' }}>({memberCount}/{FREE_MEMBER_LIMIT} used)</span>}</p>
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

const MembersTable = ({ members, onDeleteRefresh, isPremium }) => {

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to remove this member?")) {
            try {
                // Assuming backend supports DELETE /api/gym/members/{id}/
                // Using axiosConfig API
                await API.delete(`/api/gym/members/${id}/`);
                alert("Member removed successfully.");
                onDeleteRefresh();
            } catch (err) {
                console.error(err);
                alert("Failed to delete member.");
            }
        }
    };

    return (
        <div className="members-list-container animate-fade-in">
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
                            <th>Action</th>
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
                                <td>
                                    <button
                                        onClick={() => handleDelete(m.id)}
                                        className="btn-icon-delete"
                                        title="Delete Member"
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#ef4444',
                                            border: 'none',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <MdDelete />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {members.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No members found. Add one!</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Fees tab remains accessible for visibility, but perhaps detailed reporting is premium?
// User said: "fees & revenue tracking" in plans is locked. 
// But in the dashboard, let's keep it open for the basic view (the cards) as per "Limited Dashboard Access".
const FeesTab = ({ members, isPremium, onUpgrade }) => {
    return (
        <div className="fees-management animate-fade-in">
            <header className="page-header">
                <h1>Fees Status</h1>
                <p>Track payments and pending dues</p>
            </header>
            <div className="fees-grid">
                {members.map(m => (
                    <div className="card-premium" key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ marginBottom: '5px' }}>{m.name}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Due: {m.fees_due_date}</p>
                        </div>
                        <span className={`status-badge ${m.fees_status.toLowerCase()}`}>{m.fees_status}</span>
                    </div>
                ))}
            </div>
            {!isPremium && members.length > 0 && (
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MdWarning color="#f59e0b" size={24} />
                    <div>
                        <h4 style={{ color: '#f59e0b', margin: 0, fontSize: '0.95rem' }}>Automated Reminders Disabled</h4>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Upgrade to Pro to automatically send WhatsApp reminders for pending fees.</p>
                    </div>
                    <button style={{ marginLeft: 'auto', background: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }} onClick={onUpgrade}>Unlock</button>
                </div>
            )}
        </div>
    );
};

const ProfileTab = ({ gymName }) => (
    <div className="gym-profile-tab animate-fade-in">
        <header className="page-header">
            <h1>Gym Profile</h1>
            <p>Manage your gym details</p>
        </header>
        <div className="card-premium" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gym Name</span>
                <span style={{ fontWeight: '600' }}>{gymName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Active</span>
            </div>
        </div>
    </div>
);

export default GymDashboard;

