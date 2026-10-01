import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaDumbbell,
  FaUtensils,
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaCrown,
  FaFire,
  FaCog,
  FaBell,
  FaSun,
  FaMoon,
  FaSignInAlt,
} from 'react-icons/fa';
import { MdContactMail, MdOutlineDashboard } from 'react-icons/md';
import { RiRobot2Line } from 'react-icons/ri';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import API from './axiosConfig';
import './Navbar.css';

const Navbar = ({ showSplash }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { isDarkMode, toggleTheme } = useTheme();

  const { isAuthenticated: isLoggedIn, user: userData, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLoggedIn && userData?.role === 'GYM_OWNER') {
      const fetchGymNotifs = async () => {
        try {
          const membersRes = await API.get('/api/gym/members/');
          const pending = membersRes.data.filter(m => m.fees_status === 'PENDING');
          const newNotifs = pending.map(m => ({
            id: m.id,
            title: 'Fees Pending',
            message: `${m.name}'s fees are due`,
          }));
          setNotifications(newNotifs);
        } catch (err) {
          console.error("Failed to fetch gym notifications", err);
        }
      };
      const timeout = setTimeout(fetchGymNotifs, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isLoggedIn, userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const getNavItems = () => {
    if (!isLoggedIn) {
      return [
        { path: '/', label: 'Home', icon: <FaHome /> },
        { path: '/contact', label: 'Contact', icon: <MdContactMail /> },
      ];
    }
    if (userData?.role === 'GYM_OWNER') {
      return [
        { path: '/gym-dashboard', label: 'Dashboard', icon: <MdOutlineDashboard /> },
        { path: '/gym-members', label: 'Members', icon: <FaUser /> },
        { path: '/fitty', label: 'Fitty AI', icon: <RiRobot2Line /> },
      ];
    }
    return [
      { path: '/dashboard', label: 'Dashboard', icon: <MdOutlineDashboard /> },
      { path: '/workout', label: 'Workout', icon: <FaDumbbell /> },
      { path: '/diet', label: 'Diet', icon: <FaUtensils /> },
      { path: '/mission-control', label: 'Missions', icon: <FaFire /> },
      { path: '/fitty', label: 'Fitty AI', icon: <RiRobot2Line /> },
    ];
  };

  const navItems = getNavItems();
  const isPremiumUser = userData?.subscription === 'premium';

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        
        {/* Brand */}
        <Link 
          to={isLoggedIn ? (userData?.role === 'GYM_OWNER' ? '/gym-dashboard' : '/dashboard') : '/'} 
          className="brand-link"
        >
          {isLoggedIn && userData?.role === 'GYM_OWNER' && userData?.gym_name ? (
            <div className="logo-brand-composed">
              {!showSplash ? (
                <motion.img 
                  layoutId="fitty-brand-icon" 
                  src="/fitty-icon.svg" 
                  alt="Fitty Icon" 
                  style={{ width: '32px', height: '32px', zIndex: 10000, position: 'relative' }} 
                  transition={{ layout: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
                />
              ) : (
                <div style={{ width: '32px', height: '32px' }} />
              )}
              <span className="logo-text">{userData.gym_name}</span>
            </div>
          ) : (
            <div className="logo-brand-composed">
              {!showSplash ? (
                <motion.img 
                  layoutId="fitty-brand-icon" 
                  src="/fitty-icon.svg" 
                  alt="Fitty Icon" 
                  style={{ width: '32px', height: '32px', zIndex: 10000, position: 'relative' }}
                  transition={{ layout: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
                />
              ) : (
                <div style={{ width: '32px', height: '32px' }} />
              )}
              <span className="logo-text">Fitty</span>
            </div>
          )}
        </Link>

        {/* Links */}
        <div className="nav-links">
          {navItems.map((item) => (
            <div key={item.path} className="nav-item-wrapper">
              <Link 
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon} {item.label}
              </Link>
            </div>
          ))}
          {!isLoggedIn && (
            <Link to="/auth?tab=login" className="special-link highlight">
              Log in
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="nav-actions">
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>

          {isLoggedIn && (
            <>
              {userData?.role === 'GYM_OWNER' && !isPremiumUser && (
                <button className="theme-toggle-btn" onClick={() => navigate('/gym-plans')} title="Upgrade to Premium">
                  <FaCrown />
                </button>
              )}

              <button className="notification-btn" aria-label="Notifications">
                <FaBell />
                {notifications.length > 0 && <span className="notification-badge" />}
              </button>

              <div className="user-section" ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  className="user-profile-trigger"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="user-avatar-compact">
                    {userData?.profilePic ? (
                      <img src={userData.profilePic} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="avatar-placeholder-compact">
                        {userData?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <FaChevronDown className={`dropdown-arrow-compact ${dropdownOpen ? 'rotate' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      className="user-dropdown"
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                      <div className="dropdown-header">
                        <div className="dropdown-user-info">
                          <p className="d-name">{userData?.name || 'User'}</p>
                          <p className="d-email" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {userData?.role === 'GYM_OWNER' ? 'Gym Owner' : 'Athlete'}
                          </p>
                        </div>
                      </div>
                      <div className="dropdown-items">
                        <Link to={userData?.role === 'GYM_OWNER' ? "/gym-settings" : "/profile"} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <FaUser /> <span>Profile</span>
                        </Link>
                        <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <FaCog /> <span>Settings</span>
                        </Link>
                        {/* Thin divider */}
                        <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0', opacity: 0.5 }} />
                        <button className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                          <FaSignOutAlt /> <span>Log out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* Mobile menu logic mapped out here if necessary but skipping detailed drawer to match bottom nav setup... */}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;