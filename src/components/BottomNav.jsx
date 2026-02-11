import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Utensils, User, LayoutGrid, Zap, Compass, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
    const { isAuthenticated, user } = useAuth();

    // Only hide on Admin role, show for Guest
    if (isAuthenticated && user?.role === 'ADMIN') return null;

    const navItems = [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/workout', label: 'Workout', icon: Dumbbell },
        { path: '/fitty', label: 'Fitty', icon: Zap },
        { path: '/diet', label: 'Diet', icon: Utensils },
        { path: '/explore', label: 'Explore', icon: Compass },
    ];

    // Gym Owner items
    const gymNavItems = [
        { path: '/gym-dashboard', label: 'Home', icon: Home },
        { path: '/gym-plans', label: 'Plans', icon: LayoutGrid },
        { path: '/gym-settings', label: 'Settings', icon: User },
    ];

    // Guest items (Landing Page)
    const guestNavItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/explore', label: 'Explore', icon: Compass },
        { path: '/contact', label: 'Contact', icon: Mail },
        { path: '/auth', label: 'Login', icon: LogIn },
    ];

    // Determine which items to show
    let items = guestNavItems;
    if (isAuthenticated) {
        items = user?.role === 'GYM_OWNER' ? gymNavItems : navItems;
    }

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
