import React, { useState, useEffect } from 'react';
import API from '../axiosConfig';
import { FaTrash, FaBan, FaCheckCircle } from 'react-icons/fa';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await API.get('/api/admin-panel/users/');
            setUsers(response.data.results || response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (user) => {
        try {
            await API.patch(`/api/admin-panel/users/${user.id}/`, { is_active: !user.is_active });
            fetchUsers();
            alert(`User ${user.is_active ? 'blocked' : 'unblocked'} successfully.`);
        } catch (error) {
            alert("Error updating user status.");
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            await API.delete(`/api/admin-panel/users/${userId}/`);
            fetchUsers();
            alert("User deleted successfully.");
        } catch (error) {
            alert("Error deleting user.");
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>User Management</h1>
                <p>Manage registered users and their account statuses.</p>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Joined</th>
                            <th>Status</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.first_name} {user.last_name || user.username}</td>
                                <td>{user.email}</td>
                                <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                                <td>
                                    <span className={`badge ${user.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                        {user.is_active ? 'Active' : 'Blocked'}
                                    </span>
                                </td>
                                <td>{user.is_staff ? 'Admin' : 'User'}</td>
                                <td>
                                    <button className="action-btn" onClick={() => handleToggleStatus(user)}>
                                        {user.is_active ? <FaBan title="Block" /> : <FaCheckCircle style={{ color: 'var(--success)' }} title="Unblock" />}
                                    </button>
                                    <button className="action-btn delete" onClick={() => handleDelete(user.id)}>
                                        <FaTrash title="Delete" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
