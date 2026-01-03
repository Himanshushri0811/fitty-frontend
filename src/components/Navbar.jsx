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
  FaHeartbeat,
  FaRunning,
  FaTrophy,
  FaCog,
  FaBell
} from 'react-icons/fa';
import { GiMuscleUp } from 'react-icons/gi';
import { MdFitnessCenter, MdContactMail } from 'react-icons/md';
import { RiDashboardFill } from 'react-icons/ri';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check auth status
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user'));
    setIsLoggedIn(!!token);
    setUserData(user);
  }, [location]);

  // Close dropdown when clicking outside
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
      localStorage.clear();
      setIsLoggedIn(false);
      setUserData(null);
      navigate('/');
      window.location.reload();
    }
  };

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/workout', label: 'Workout', icon: <FaDumbbell /> },
    { path: '/diet', label: 'Diet', icon: <FaUtensils /> },
    { path: '/nutrition', label: 'Nutrition', icon: <GiMuscleUp /> },
    { path: '/posture', label: 'Posture', icon: <MdFitnessCenter /> },
    { path: '/health-tracking', label: 'Health', icon: <FaHeartbeat /> },
    { path: '/explore', label: 'Explore', icon: <FaFire /> },
    { path: '/contact', label: 'Contact', icon: <MdContactMail /> },
  ];

  // User dropdown items
  const userMenuItems = [
    { path: '/profile', label: 'My Profile', icon: <FaUser /> },
    { path: '/dashboard', label: 'Dashboard', icon: <RiDashboardFill /> },
    { path: '/workout', label: 'My Workouts', icon: <FaDumbbell /> },
    { path: '/diet', label: 'Meal Plans', icon: <FaUtensils /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> },
  ];

  // Premium badge for pro users
  const isPremiumUser = userData?.subscription === 'premium';

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="nav-container">
          {/* Brand Logo */}
          <motion.div
            className="brand-section"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="brand-link">
              <div className="brand-logo">
                <span className="logo-icon">💪</span>
                <div className="logo-text">
                  <h1 className="brand-title">FitMitra</h1>
                  <p className="brand-tagline">AI Fitness</p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="nav-links">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                className="nav-item-wrapper"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {location.pathname === item.path && (
                    <motion.div
                      className="nav-indicator"
                      layoutId="nav-indicator"
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="nav-actions">
            {/* Notifications - only for logged in users */}
            {isLoggedIn && (
              <motion.button
                className="notification-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaBell />
                <span className="notification-badge">3</span>
              </motion.button>
            )}

            {/* User Section */}
            <div className="user-section" ref={dropdownRef}>
              {isLoggedIn ? (
                <>
                  <motion.div
                    className="user-profile-trigger"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="user-avatar-container">
                      <div className="user-avatar-compact">
                        {userData?.profilePic ? (
                          <img src={userData.profilePic} alt={userData.name} />
                        ) : (
                          <div className="avatar-placeholder-compact">
                            {userData?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      {isPremiumUser && (
                        <div className="status-indicator online"></div>
                      )}
                    </div>

                    <span className="user-name-compact">
                      {userData?.name?.split(' ')[0] || 'User'}
                    </span>

                    <FaChevronDown className={`dropdown-arrow-compact ${dropdownOpen ? 'rotate' : ''}`} />
                  </motion.div>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        className="user-dropdown"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="dropdown-header">
                          <div className="dropdown-user">
                            <div className="dropdown-avatar">
                              {userData?.profilePic ? (
                                <img src={userData.profilePic} alt={userData.name} />
                              ) : (
                                <div className="avatar-placeholder">
                                  {userData?.name?.charAt(0) || 'U'}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="dropdown-name">{userData?.name || 'User'}</div>
                              <div className="dropdown-email">{userData?.email || 'user@example.com'}</div>
                            </div>
                          </div>
                          {!isPremiumUser && (
                            <button
                              className="upgrade-btn"
                              onClick={() => navigate('/premium')}
                            >
                              <FaCrown /> Upgrade to Pro
                            </button>
                          )}
                        </div>

                        <div className="dropdown-items">
                          {userMenuItems.map(item => (
                            <Link
                              key={item.path}
                              to={item.path}
                              className="dropdown-item"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <span className="dropdown-icon">{item.icon}</span>
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>

                        <div className="dropdown-footer">
                          <button
                            className="logout-btn"
                            onClick={handleLogout}
                          >
                            <FaSignOutAlt /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="auth-buttons">
                  <motion.button
                    className="btn-login"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/auth?tab=login')}
                  >
                    Login
                  </motion.button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              className="mobile-toggle"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(true)}
            >
              <FaBars />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Mobile Header */}
              <div className="mobile-header">
                <div className="mobile-brand">
                  <span className="mobile-logo">💪</span>
                  <div>
                    <h3>FitMitra</h3>
                    <p>AI Fitness Companion</p>
                  </div>
                </div>
                <button
                  className="mobile-close"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Mobile User Info */}
              <div className="mobile-user-section">
                {isLoggedIn ? (
                  <>
                    <div className="mobile-user-avatar">
                      {userData?.profilePic ? (
                        <img src={userData.profilePic} alt={userData.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {userData?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="mobile-user-info">
                      <div className="mobile-user-name">{userData?.name || 'User'}</div>
                      <div className="mobile-user-email">{userData?.email || 'Premium Member'}</div>
                      {isPremiumUser && (
                        <div className="mobile-premium-badge">
                          <FaCrown /> Premium
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="mobile-guest">
                    <h4>Welcome to FitMitra!</h4>
                    <p>Login to access all features</p>
                  </div>
                )}
              </div>

              {/* Mobile Navigation */}
              <div className="mobile-nav-items">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mobile-nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {location.pathname === item.path && (
                      <div className="mobile-nav-indicator" />
                    )}
                  </Link>
                ))}
              </div>

              {/* Mobile Quick Actions */}
              <div className="mobile-quick-actions">
                <button
                  className="quick-action-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/workout');
                  }}
                >
                  <FaRunning /> Start Workout
                </button>
                <button
                  className="quick-action-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/diet');
                  }}
                >
                  <FaUtensils /> Plan Meal
                </button>
              </div>

              {/* Mobile Auth Section */}
              <div className="mobile-auth-section">
                {isLoggedIn ? (
                  <div className="mobile-user-actions">
                    {userMenuItems.map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="mobile-user-item"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mobile-user-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    <button className="mobile-logout" onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth?tab=login"
                    className="mobile-login-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>

              {/* Mobile Footer */}
              <div className="mobile-footer">
                <div className="mobile-links">
                  <Link to="/privacy">Privacy</Link>
                  <Link to="/terms">Terms</Link>
                  <Link to="/contact">Help</Link>
                </div>
                <p className="mobile-copyright">© 2024 FitMitra. All rights reserved.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;