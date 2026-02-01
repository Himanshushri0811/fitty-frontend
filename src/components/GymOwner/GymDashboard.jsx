import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdPerson, MdPersonAdd, MdAttachMoney, MdTrendingUp,
    MdEdit, MdCheckCircle, MdSearch, MdFilterList,
    MdClose, MdWarning, MdNotifications, MdDelete
} from 'react-icons/md';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import API from '../axiosConfig';
import './GymDashboard.css';

const GymDashboard = () => {
    const [stats, setStats] = useState({
        total_members: 0,
        paid_members: 0,
        pending_members: 0,
        monthly_revenue: 0
    });
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gymName, setGymName] = useState('My Gym');
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PAID, PENDING

    // Mock Revenue Data (until backend history is ready)
    const revenueData = [
        { name: 'Jan', revenue: 4000 },
        { name: 'Feb', revenue: 3000 },
        { name: 'Mar', revenue: 2000 },
        { name: 'Apr', revenue: 2780 },
        { name: 'May', revenue: 1890 },
        { name: 'Jun', revenue: 2390 },
        { name: 'Jul', revenue: 3490 },
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const overviewRes = await API.get('/api/gym/dashboard/overview/');
            const data = overviewRes.data;

            // Map backend metrics to frontend state
            if (data.metrics) {
                setStats({
                    total_members: data.metrics.total_members,
                    paid_members: data.metrics.active_paid,
                    pending_members: data.metrics.total_members - data.metrics.active_paid,
                    monthly_revenue: data.metrics.revenue
                });
            } else if (data.stats) {
                // Fallback if structure is different
                setStats(data.stats);
            }

            if (data.gym_details) setGymName(data.gym_details.name);
            else if (data.gym_name) setGymName(data.gym_name);

            const membersRes = await API.get('/api/gym/members/');
            setMembers(membersRes.data);
        } catch (err) {
            console.error("Error fetching dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async (id) => {
        if (!window.confirm("Are you sure you want to delete this member?")) return;

        try {
            await API.delete(`/api/gym/members/?id=${id}`);
            setMembers(prev => prev.filter(m => m.id !== id));
            // Update stats locally or refetch
            setStats(prev => ({
                ...prev,
                total_members: prev.total_members - 1
            }));
            alert("Member deleted.");
        } catch (err) {
            console.error(err);
            alert("Failed to delete member.");
        }
    };

    const handleEditMember = (member) => {
        // Open modal with member data
        setEditMemberData(member);
        setShowAddMemberModal(true);
    };

    const handleSaveMember = async (formData) => {
        try {
            if (editMemberData) {
                // Edit Mode
                await API.put('/api/gym/members/', { ...formData, id: editMemberData.id });
                alert("Member updated successfully!");
            } else {
                // Add Mode
                await API.post('/api/gym/members/', formData);
                alert("Member added successfully!");
            }
            setShowAddMemberModal(false);
            setEditMemberData(null);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert("Failed to save member.");
        }
    };

    const handleSendReminders = async () => {
        try {
            const res = await API.post('/api/gym/notifications/', { action: 'remind_fees' });
            alert(res.data.message);
        } catch (err) {
            console.error(err);
            alert("Failed to send reminders.");
        }
    };

    // State for editing
    const [editMemberData, setEditMemberData] = useState(null);

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || m.fees_status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="gym-dashboard-container">
            {/* Background Glow */}
            <div className="gym-bg-effect" />

            {/* Dashboard Header */}
            <div className="dashboard-header animate-fade-in">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back to {gymName}</p>
                </div>
                <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.9rem' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* 1. TOP STATS CARDS */}
            <div className="stats-grid animate-slide-up">
                <StatCard
                    title="Total Members"
                    value={stats.total_members}
                    icon={<MdPerson />}
                    color="purple"
                    trend="+5% this month"
                />
                <StatCard
                    title="Active Members"
                    value={stats.paid_members}
                    icon={<MdCheckCircle />}
                    color="green"
                    trend="Steady"
                />
                <StatCard
                    title="Pending Fees"
                    value={stats.pending_members}
                    icon={<MdWarning />}
                    color="orange"
                    trend="Action needed"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`Rs. ${stats.monthly_revenue}`}
                    icon={<MdAttachMoney />}
                    color="blue"
                    trend="+12% vs last month"
                />
            </div>

            {/* 2. QUICK ACTIONS */}
            <div className="quick-actions-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="quick-actions-title">Quick Actions</h3>
                <div className="quick-actions-grid">
                    <button className="action-btn primary" onClick={() => { setEditMemberData(null); setShowAddMemberModal(true); }}>
                        <MdPersonAdd size={20} /> Add New Member
                    </button>
                    <button className="action-btn" onClick={handleSendReminders}>
                        <MdNotifications size={20} /> Send Fee Notice
                    </button>
                    {/* Add more placeholder actions as needed */}
                </div>
            </div>

            {/* 3. MAIN GRID (Table + Analytics) */}
            <div className="dashboard-main-grid animate-slide-up" style={{ animationDelay: '0.2s' }}>

                {/* Members List Section */}
                <div className="dashboard-section-card members-section">
                    <div className="section-title">
                        <h3>Members Overview</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ position: 'relative' }}>
                                <MdSearch style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--gym-text-muted)', fontSize: '1.1rem' }} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="gym-input"
                                    style={{
                                        paddingLeft: '38px',
                                        width: '180px',
                                        paddingTop: '10px',
                                        paddingBottom: '10px'
                                    }}
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="gym-input"
                                style={{
                                    width: 'auto',
                                    paddingTop: '10px',
                                    paddingBottom: '10px'
                                }}
                            >
                                <option value="ALL">All Status</option>
                                <option value="PAID">Paid</option>
                                <option value="PENDING">Pending</option>
                            </select>
                        </div>
                    </div>

                    <div className="members-table-wrapper">
                        <table className="gym-table">
                            <thead>
                                <tr>
                                    <th>Member Name</th>
                                    <th>Mobile</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.slice(0, 8).map(m => ( // Limit to 8 for view
                                    <tr key={m.id}>
                                        <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="member-avatar">
                                                {m.name.charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{m.name}</span>
                                        </td>
                                        <td>{m.mobile}</td>
                                        <td>
                                            <span className={`status-badge ${m.fees_status === 'PAID' ? 'paid' : 'pending'}`}>
                                                {m.fees_status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td>{m.fees_due_date || '-'}</td>
                                        <td>
                                            <button
                                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginRight: '10px' }}
                                                title="Edit"
                                                onClick={() => handleEditMember(m)}
                                            >
                                                <MdEdit />
                                            </button>
                                            <button
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                                title="Delete"
                                                onClick={() => handleDeleteMember(m.id)}
                                            >
                                                <MdDelete />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredMembers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>No members found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Side: Revenue & Capacity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Revenue Chart */}
                    <div className="dashboard-section-card">
                        <div className="section-title">
                            <h3>Revenue Analytics</h3>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                        {revenueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === revenueData.length - 1 ? '#a855f7' : '#475569'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Member Modal */}
            <AnimatePresence>
                {showAddMemberModal && (
                    <AddMemberModal
                        onClose={() => setShowAddMemberModal(false)}
                        onSave={handleSaveMember}
                        initialData={editMemberData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

/* --- Sub Components --- */

const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`stat-card ${color}`}>
        <div className="stat-top">
            <div className="stat-icon-wrapper">
                {icon}
            </div>
            {trend && <span className={`stat-trend ${trend.includes('+') ? 'positive' : ''}`}>{trend}</span>}
        </div>
        <div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{title}</div>
        </div>
    </div>
);

const AddMemberModal = ({ onClose, onSave, initialData }) => {
    // Basic form state
    const [formData, setFormData] = useState({
        name: '', mobile: '', fees_status: 'PAID', fees_due_date: new Date().toISOString().split('T')[0], join_date: new Date().toISOString().split('T')[0], gender: 'Male'
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '', mobile: '', fees_status: 'PAID', fees_due_date: new Date().toISOString().split('T')[0], join_date: new Date().toISOString().split('T')[0], gender: 'Male'
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="gym-modal-overlay" onClick={onClose}>
            <motion.div className="gym-modal" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{initialData ? 'Edit Member' : 'Add New Member'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><MdClose size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="gym-form-group">
                        <label>Full Name</label>
                        <input className="gym-input" type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="gym-form-group">
                        <label>Mobile Number</label>
                        <input className="gym-input" type="text" required value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="gym-form-group" style={{ flex: 1 }}>
                            <label>Status</label>
                            <select className="gym-input" value={formData.fees_status} onChange={e => setFormData({ ...formData, fees_status: e.target.value })}>
                                <option value="PAID">Paid</option>
                                <option value="PENDING">Pending</option>
                            </select>
                        </div>
                        <div className="gym-form-group" style={{ flex: 1 }}>
                            <label>Due Date</label>
                            <input className="gym-input" type="date" value={formData.fees_due_date} onChange={e => setFormData({ ...formData, fees_due_date: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" className="action-btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                        {initialData ? 'Update Member' : 'Register Member'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default GymDashboard;
