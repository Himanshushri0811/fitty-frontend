import React, { useEffect, useState } from 'react';
import { Search, Loader2, Trash2, Shield, UserX, UserCheck, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import API from '../axiosConfig';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get('/api/accounts/admin/users/');
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action, value = null) => {
        if (!window.confirm(`Are you sure you want to ${action.replace('_', ' ')}?`)) return;

        try {
            const payload = { action };
            if (value) payload.role = value;

            await API.put(`/api/accounts/admin/users/${id}/`, payload);
            fetchUsers(); // Refresh data
        } catch (err) {
            alert("Action failed: " + (err.response?.data?.error || err.message));
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter Logic
    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort Logic
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination Logic
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
    const paginatedUsers = sortedUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    if (loading) return <div className="loading-state"><Loader2 className="spin" size={40} /> Loading Users...</div>;

    return (
        <div className="user-mgmt-container">
            <div className="mgmt-toolbar">
                <div className="search-box">
                    <Search size={18} style={{ opacity: 0.5 }} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="filter-group" style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="ALL">All Roles</option>
                            <option value="USER">Users</option>
                            <option value="GYM_OWNER">Gym Owners</option>
                            <option value="ADMIN">Admins</option>
                        </select>
                    </div>
                    <div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="ALL">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Blocked">Blocked</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>User {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>Joined {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('last_login')} style={{ cursor: 'pointer' }}>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.length > 0 ? paginatedUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-cell">
                                        <div className="avatar-circle">{user.name?.[0] || user.email?.[0] || 'U'}</div>
                                        <div>
                                            <div className="user-name">{user.name || 'No Name'}</div>
                                            <div className="user-email">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span>
                                </td>
                                <td>{user.created_at}</td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.last_login}</td>
                                <td>
                                    <div className="action-buttons">
                                        {user.role !== 'ADMIN' && (
                                            <>
                                                <button
                                                    className="icon-btn"
                                                    title={user.role === 'GYM_OWNER' ? "Demote to User" : "Promote to Gym Owner"}
                                                    onClick={() => handleAction(user.id, 'change_role', user.role === 'GYM_OWNER' ? 'USER' : 'GYM_OWNER')}
                                                >
                                                    <Shield size={16} />
                                                </button>
                                                <button
                                                    className={`icon-btn ${user.status === 'Blocked' ? 'blocked' : ''}`}
                                                    title={user.status === 'Active' ? 'Block User' : 'Unblock User'}
                                                    onClick={() => handleAction(user.id, 'toggle_status')}
                                                    style={{ color: user.status === 'Blocked' ? 'var(--danger)' : '' }}
                                                >
                                                    {user.status === 'Active' ? <UserX size={16} /> : <UserCheck size={16} />}
                                                </button>
                                                <button
                                                    className="icon-btn delete"
                                                    title="Delete User"
                                                    onClick={() => handleAction(user.id, 'delete')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="empty-state">No users found matching filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '15px', alignItems: 'center' }}>
                    <button
                        className="icon-btn"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        style={{ opacity: page === 1 ? 0.5 : 1 }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        className="icon-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        style={{ opacity: page === totalPages ? 0.5 : 1 }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
