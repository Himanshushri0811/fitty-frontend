import React, { useState, useEffect } from 'react';
import API from '../axiosConfig';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await API.get('/api/admin-panel/stats/');
                setData(response.data);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (!data) return <div>Failed to load data.</div>;

    const { stats, recent_logins, recent_actions } = data;

    return (
        <div>
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Platform Overview</h1>
                    <p>Real-time statistics and recent activity.</p>
                </div>
                <button
                    className="admin-btn"
                    style={{ background: '#ef4444', padding: '10px 20px' }}
                    onClick={() => {
                        if (window.confirm("Logout from Admin Panel?")) {
                            localStorage.clear();
                            window.location.href = '/';
                        }
                    }}
                >
                    Logout
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="label">Total Users</span>
                    <span className="value">{stats.total_users}</span>
                    <span className="trend">+12% from last month</span>
                </div>
                <div className="stat-card">
                    <span className="label">Total Gyms</span>
                    <span className="value">{stats.total_gyms}</span>
                </div>
                <div className="stat-card">
                    <span className="label">New Users Today</span>
                    <span className="value">{stats.new_users_today}</span>
                    <span className="trend">Daily Growth</span>
                </div>
                <div className="stat-card">
                    <span className="label">Active Users Today</span>
                    <span className="value">{stats.active_users}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="admin-card">
                    <h3>Recent Admin Actions</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Admin</th>
                                <th>Action</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent_actions.map(action => (
                                <tr key={action.id}>
                                    <td>{action.admin_username}</td>
                                    <td>{action.action_type} - {action.target_model}</td>
                                    <td>{new Date(action.timestamp).toLocaleTimeString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="admin-card">
                    <h3>Recent Logins</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent_logins.map(log => (
                                <tr key={log.id}>
                                    <td>{log.username}</td>
                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
