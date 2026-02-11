import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Video,
    LogOut,
    LayoutDashboard,
    Menu,
    X,
    Sun,
    Moon,
    Settings
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';
import UserManagement from './UserManagement';
import VideoManagement from './VideoManagement';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            logout();
            // AuthContext handles redirect to '/'
        }
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const renderContent = () => {
        switch (activeTab) {
            case 'users': return <UserManagement />;
            case 'videos': return <VideoManagement />;
            case 'dashboard': return <div className="empty-state"><h3>Dashboard Overview Coming Soon</h3></div>;
            case 'settings': return <div className="empty-state"><h3>Settings Coming Soon</h3></div>;
            default: return <UserManagement />;
        }
    };

    return (
        <div className="admin-container">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="admin-overlay" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-logo">
                    <h2>Fit<span>Mitra</span></h2>
                    {isSidebarOpen && <button className="menu-toggle" onClick={toggleSidebar}><X /></button>}
                </div>

                <nav className="admin-nav">
                    <button
                        className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
                    >
                        <Users size={20} /> User Management
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'videos' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('videos'); setIsSidebarOpen(false); }}
                    >
                        <Video size={20} /> Workout Videos
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                    >
                        <LayoutDashboard size={20} /> Analytics
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                    >
                        <Settings size={20} /> Settings
                    </button>
                </nav>

                <div className="admin-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <button className="menu-toggle" onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                        <h3>
                            {activeTab === 'users' && 'User Management'}
                            {activeTab === 'videos' && 'Workout Video Library'}
                            {activeTab === 'dashboard' && 'Admin Dashboard'}
                            {activeTab === 'settings' && 'System Settings'}
                        </h3>
                    </div>

                    <div className="admin-profile">
                        <button className="theme-btn" onClick={toggleTheme} title="Toggle Theme">
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <div className="avatar-circle" style={{ width: 40, height: 40, background: 'var(--primary)', color: 'white' }}>
                            A
                        </div>
                    </div>
                </header>

                <div className="content-body">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
