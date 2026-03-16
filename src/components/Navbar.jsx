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
  FaInfoCircle,
  FaSignInAlt,
} from 'react-icons/fa';
import FittyVoiceAssistant from './Fitty/FittyVoiceAssistant';
import { MdContactMail } from 'react-icons/md';
import { RiDashboardFill, RiRobot2Line } from 'react-icons/ri';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import API from './axiosConfig';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { isDarkMode, toggleTheme } = useTheme();

  // Using Auth Context
  const { isAuthenticated: isLoggedIn, user: userData, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isBuddyOpen, setIsBuddyOpen] = useState(false);
  const [showFittyPopup, setShowFittyPopup] = useState(false);

  // Auto-hide welcome message on scroll or timeout
  useEffect(() => {
    let timeout;
    if (showWelcome) {
      timeout = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (window.scrollY > 50) {
        setShowWelcome(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [showWelcome]);

  useEffect(() => {
    // Gym Owner Notification Logic
    if (isLoggedIn && userData?.role === 'GYM_OWNER') {
      const fetchGymNotifs = async () => {
        try {
          const membersRes = await API.get('/api/gym/members/');
          const pending = membersRes.data.filter(m => m.fees_status === 'PENDING');
          const newNotifs = pending.map(m => ({
            id: m.id,
            type: 'warning',
            title: 'Fees Pending',
            message: `${m.name}'s fees are due on ${m.fees_due_date}`,
            date: m.fees_due_date
          }));
          setNotifications(newNotifs);
        } catch (err) {
          console.error("Failed to fetch gym notifications", err);
        }
      };

      // Delay fetch slightly to ensure token is ready
      const timeout = setTimeout(fetchGymNotifs, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isLoggedIn, userData]);

  // Fitty Welcome Popup Logic
  useEffect(() => {
    if (isLoggedIn) {
      // Check if already shown in this session
      const hasSeenPopup = sessionStorage.getItem('fitty_popup_shown');
      if (!hasSeenPopup) {
        const timer = setTimeout(() => {
          setShowFittyPopup(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoggedIn]);

  const closeFittyPopup = () => {
    setShowFittyPopup(false);
    sessionStorage.setItem('fitty_popup_shown', 'true');
  };


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
      logout();
      navigate('/login');
    }
  };

  // Navigation items based on role
  const getNavItems = () => {
    if (!isLoggedIn) {
      return [
        { path: '/', label: 'Home', icon: <FaHome /> },
        // { path: '/#features', label: 'Features', icon: <FaStar /> }, // Assuming hash link or page
        { path: '/contact', label: 'Contact', icon: <MdContactMail /> },
      ];
    }

    if (userData?.role === 'GYM_OWNER') {
      return [
        { path: '/gym-dashboard', label: 'Dashboard', icon: <RiDashboardFill /> },
        { path: '/gym-members', label: 'Members', icon: <FaUser /> },
        { path: '/fitty', label: 'Fitty AI', icon: <RiRobot2Line /> },
      ];
    }

    // Default USER Role
    return [
      { path: '/dashboard', label: 'Dashboard', icon: <RiDashboardFill /> },
      { path: '/workout', label: 'Workout', icon: <FaDumbbell /> },
      { path: '/diet', label: 'Diet', icon: <FaUtensils /> },
      { path: '/mission-control', label: 'Missions', icon: <FaFire /> },
      { path: '/fitty', label: 'Fitty AI', icon: <RiRobot2Line /> },
    ];
  };

  const navItems = getNavItems();

  // User dropdown items
  const getUserMenuItems = () => {
    const baseItems = [
      { path: '/profile', label: 'My Profile', icon: <FaUser /> },
      { path: '/settings', label: 'Settings', icon: <FaCog /> },
    ];

    if (userData?.role === 'USER') {
      baseItems.unshift(
        { path: '/dashboard', label: 'Dashboard', icon: <RiDashboardFill /> },
        { path: '/messages', label: 'Messages', icon: <MdContactMail /> }
      );
    } else if (userData?.role === 'GYM_OWNER') {
      baseItems.unshift({ path: '/gym-dashboard', label: 'Dashboard', icon: <RiDashboardFill /> });
    }

    if (userData?.is_staff || userData?.is_superuser) {
      baseItems.push({ path: '/admin/dashboard', label: 'Admin Panel', icon: <RiDashboardFill /> });
    }

    return baseItems;
  };

  const userMenuItems = getUserMenuItems();

  // Premium badge for pro users
  const isPremiumUser = userData?.subscription === 'premium';

  // Hide navbar on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
      >
        <div className="nav-container">
          {/* Brand Logic: FitMitra vs. Gym Name */}
          <Link
            to={isLoggedIn ? (userData?.role === 'GYM_OWNER' ? '/gym-dashboard' : '/dashboard') : '/'}
            className="brand-link"
          >
            {isLoggedIn && userData?.role === 'GYM_OWNER' && userData?.gym_name ? (
              <motion.div
                className="gym-brand-display"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                {/* Gym Logo / Icon could go here, defaulting to FaFire for now or a different icon */}
                <div className="logo-icon-circle" style={{ background: '#a855f7' }}>
                  <FaDumbbell style={{ color: 'white', fontSize: '1rem' }} />
                </div>
                <span className="logo-text" style={{ fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px', display: 'block' }}>
                  {userData.gym_name}
                </span>
              </motion.div>
            ) : (
              <motion.div
                className="logo-brand-composed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="logo-icon-circle">
                  <FaFire />
                </div>
                <span className="logo-text">Fit<span className="logo-text-accent">Mitra</span></span>
              </motion.div>
            )}
          </Link>

          {/* Desktop Navigation - Hidden for Gym Owner as per requirement to rely on Dashboard links */}
          {(!isLoggedIn || userData?.role !== 'GYM_OWNER') && (
            <div className="nav-links">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  className="nav-item-wrapper"
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
              {/* Login Link for Guests */}
              {!isLoggedIn && (
                <Link to="/auth?tab=login" className="nav-link special-link highlight">
                  <FaSignInAlt className="nav-icon" /> Login
                </Link>
              )}
            </div>
          )}

          {/* Navbar Actions Area */}
          <div className="nav-actions">
            {/* Theme Toggle */}
            <motion.button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
            {isDarkMode ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon" />}
            </motion.button>

            {/* Fitty AI Siri-style Trigger */}
            {isLoggedIn && (
              <div style={{ position: 'relative' }}>
                <motion.button
                  className="fitty-siri-trigger"
                  onClick={() => setIsBuddyOpen(true)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  title="Talk to Fitty AI"
                >
                  <div className="siri-sphere">
                    <div className="siri-layer layer-1"></div>
                    <div className="siri-layer layer-2"></div>
                    <div className="siri-layer layer-3"></div>
                  </div>
                </motion.button>

                {/* Fitty Contextual Welcome Popup */}
                <AnimatePresence>
                  {showFittyPopup && (
                    <motion.div 
                      className="fitty-context-popup"
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    >
                      <div className="fitty-context-arrow"></div>
                      <div className="fitty-context-content">
                        <p>Namaste, I am Fitty! 🤖<br/>Workout, diet, ya motivation—main har chiz mein aapki madat kar sakta hu!</p>
                        <button className="fitty-gotit-btn" onClick={closeFittyPopup}>
                          Got it!
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Gym Owner Specific Actions */}
            {isLoggedIn && userData?.role === 'GYM_OWNER' && (
              <>
                {/* Upgrade Button if not premium */}
                {!isPremiumUser && (
                  <motion.button
                    className="upgrade-btn-nav"
                    onClick={() => navigate('/gym-plans')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaCrown size={14} /> <span className="upgrade-text">Upgrade</span>
                  </motion.button>
                )}

                {/* Gym Notifications */}
                <div style={{ position: 'relative' }}>
                  <motion.button
                    className="notification-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  >
                    <FaBell />
                    {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
                  </motion.button>

                  <AnimatePresence>
                    {showNotifDropdown && (
                      <motion.div
                        className="notification-dropdown"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      >
                        <div className="notif-header">
                          <h4>Notifications</h4>
                          <button onClick={() => setShowNotifDropdown(false)}><FaTimes /></button>
                        </div>
                        <div className="notif-body">
                          {notifications.length === 0 ? (
                            <div className="no-notif">No new messages</div>
                          ) : (
                            notifications.map((n, i) => (
                              <div key={i} className="notif-item">
                                <div className="notif-icon warning"><FaInfoCircle /></div>
                                <div className="notif-content">
                                  <strong>{n.title}</strong>
                                  <p>{n.message}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Simple Gym Owner Profile Dropdown */}
                <div className="user-section" ref={dropdownRef}>
                  <motion.div
                    className="user-profile-trigger"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="user-avatar-container">
                      <div className="user-avatar-compact gym-owner-avatar">
                        {userData?.name?.charAt(0) || 'G'}
                      </div>
                    </div>
                    <FaChevronDown className={`dropdown-arrow-compact ${dropdownOpen ? 'rotate' : ''}`} />
                  </motion.div>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div className="user-dropdown" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="dropdown-header">
                          <div className="dropdown-user-info">
                            <p className="d-name">{userData.name}</p>
                            <p className="d-email">Owner</p>
                          </div>
                        </div>
                        <div className="dropdown-items">
                          <Link to="/gym-settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                            <FaCog /> <span>Gym Settings</span>
                          </Link>
                          <button className="dropdown-item logout" onClick={handleLogout}>
                            <FaSignOutAlt /> <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Normal User (Athlete) Dropdown */}
            {isLoggedIn && userData?.role !== 'GYM_OWNER' && (
              <div className="user-section" ref={dropdownRef}>
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
                  </div>
                  <FaChevronDown className={`dropdown-arrow-compact ${dropdownOpen ? 'rotate' : ''}`} />
                </motion.div>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="user-dropdown"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    >
                      <div className="dropdown-header">
                        <div className="dropdown-user-info" style={{ textAlign: 'center' }}>
                          <p className="d-name" style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome, Champ 🏆</p>
                        </div>
                      </div>
                      <div className="dropdown-items">
                        {userMenuItems.map(item => (
                          <Link key={item.path} to={item.path} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                            {item.icon} <span>{item.label}</span>
                          </Link>
                        ))}
                        <button className="dropdown-item logout" onClick={handleLogout}>
                          <FaSignOutAlt /> <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Toggle */}
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

      {/* Mobile Menu Drawer */}
      {/* NEW Mobile Side Drawer (Right Slide-In) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              className="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              className="mobile-side-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="drawer-header">
                {/* Logo inside Drawer */}
                <div className="logo-brand-composed" onClick={() => setMobileMenuOpen(false)}>
                  <div className="logo-icon-circle">
                    <FaFire />
                  </div>
                  <span className="logo-text">Fit<span className="logo-text-accent">Mitra</span></span>
                </div>

                <button className="drawer-close-btn" onClick={() => setMobileMenuOpen(false)}>
                  <FaTimes />
                </button>
              </div>

              <div className="drawer-content">
                {/* Dynamic Nav Items */}
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`drawer-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="drawer-icon">{item.icon}</span> {item.label}
                  </Link>
                ))}

                {!isLoggedIn ? (
                  <Link to="/auth?tab=login" className="drawer-btn login" onClick={() => setMobileMenuOpen(false)}>
                    <FaSignInAlt /> Login
                  </Link>
                ) : (
                  <button className="drawer-btn logout" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
                    <FaSignOutAlt /> Logout
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <FittyVoiceAssistant isOpen={isBuddyOpen} onClose={() => setIsBuddyOpen(false)} />
    </>
  );
};

export default Navbar;