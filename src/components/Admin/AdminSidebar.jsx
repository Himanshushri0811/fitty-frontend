import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaChartLine, FaUsers, FaDumbbell, FaHistory, FaSignOutAlt, FaRobot } from 'react-icons/fa';

const AdminSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("Logout from Admin Panel?")) {
            localStorage.clear();
            navigate('/');
            window.location.reload();
        }
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-logo">
                <h2>FitMitra Admin</h2>
            </div>

            <nav className="admin-nav">
                <NavLink to="/admin/dashboard" className={({ active }) => active ? 'admin-nav-item active' : 'admin-nav-item'}>
                    <FaChartLine /> Dashboard
                </NavLink>
                <NavLink to="/admin/users" className={({ active }) => active ? 'admin-nav-item active' : 'admin-nav-item'}>
                    <FaUsers /> Users
                </NavLink>
                <NavLink to="/admin/gyms" className={({ active }) => active ? 'admin-nav-item active' : 'admin-nav-item'}>
                    <FaDumbbell /> Gyms
                </NavLink>
                <NavLink to="/admin/logs" className={({ active }) => active ? 'admin-nav-item active' : 'admin-nav-item'}>
                    <FaHistory /> Activity Logs
                </NavLink>
                <NavLink to="/admin/exercises" className={({ active }) => active ? 'admin-nav-item active' : 'admin-nav-item'}>
                    <FaRobot /> AI Exercises
                </NavLink>
            </nav>

            <div className="admin-logout" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
            </div>

        </aside>
    );
};

export default AdminSidebar;
