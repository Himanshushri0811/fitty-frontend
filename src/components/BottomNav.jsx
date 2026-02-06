import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Utensils, User, LayoutGrid, Zap, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
    const { isAuthenticated, user } = useAuth();

    // Don't show if not logged in or on Admin
    if (!isAuthenticated) return null;
    if (user?.role === 'ADMIN') return null;

    const navItems = [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/workout', label: 'Workout', icon: Dumbbell },
        { path: '/fitty', label: 'Fitty', icon: Zap },
        { path: '/diet', label: 'Diet', icon: Utensils },
        { path: '/explore', label: 'Explore', icon: Compass },
    ];

    // Gym Owner can have different items
    const gymNavItems = [
        { path: '/gym-dashboard', label: 'Home', icon: Home },
        { path: '/gym-plans', label: 'Plans', icon: LayoutGrid },
        { path: '/gym-settings', label: 'Settings', icon: User },
    ];

    const items = user?.role === 'GYM_OWNER' ? gymNavItems : navItems;

    return (
        <nav className="bottom-nav glass-panel">
            {items.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                >
                    <item.icon size={24} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
