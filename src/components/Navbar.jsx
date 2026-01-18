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
  FaRunning,
  FaCog,
  FaBell,
  FaSun,
  FaMoon,
  FaRobot,
  FaInfoCircle,
  FaSignInAlt,
  FaUserPlus
} from 'react-icons/fa';
import { MdContactMail } from 'react-icons/md';
import { RiDashboardFill } from 'react-icons/ri';
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
    if (isLoggedIn && userData?.profile?.role === 'GYM_OWNER') {
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

  // Voice Greeting Effect (Runs once after login)
  useEffect(() => {
    if (isLoggedIn) {
      const shouldGreet = localStorage.getItem('fitty_greeting_needed');

      if (shouldGreet === 'true') {
        const timer = setTimeout(() => {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any previous speech

            const text = "Hi, I am Fitty. How can I help you today?";

            const speak = () => {
              const utterance = new SpeechSynthesisUtterance(text);
              const voices = window.speechSynthesis.getVoices();
              // Try to pick a pleasant voice
              const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
              if (preferredVoice) utterance.voice = preferredVoice;

              utterance.rate = 1.0;
              utterance.pitch = 1.0;
              window.speechSynthesis.speak(utterance);

              // Remove flag so it doesn't replay on refresh
              localStorage.removeItem('fitty_greeting_needed');
            };

            if (window.speechSynthesis.getVoices().length > 0) {
              speak();
            } else {
              window.speechSynthesis.onvoiceschanged = () => {
                speak();
                window.speechSynthesis.onvoiceschanged = null;
              };
            }
          }
        }, 1500); // 1.5s delay to allow page transition

        return () => clearTimeout(timer);
      }
    }
  }, [isLoggedIn]);


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
      navigate('/');
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

    if (userData?.profile?.role === 'GYM_OWNER') {
      return [
        { path: '/gym-dashboard', label: 'Dashboard', icon: <RiDashboardFill /> },
        { path: '/profile', label: 'Profile', icon: <FaUser /> },
        { path: '/gym-members', label: 'Members', icon: <FaUser /> }, // Added for gym owner context
      ];
    }

    // Default USER Role
    return [
      { path: '/dashboard', label: 'Dashboard', icon: <RiDashboardFill /> },
      { path: '/workout', label: 'Workout', icon: <FaDumbbell /> },
      { path: '/diet', label: 'Diet', icon: <FaUtensils /> },
      { path: '/explore', label: 'Explore', icon: <FaFire /> },
      { path: '/voice-assistant', label: 'Assistant', icon: <FaRobot /> },
    ];
  };

  const navItems = getNavItems();

  // User dropdown items
  const getUserMenuItems = () => {
    const baseItems = [
      { path: '/profile', label: 'My Profile', icon: <FaUser /> },
      { path: '/settings', label: 'Settings', icon: <FaCog /> },
    ];

    if (userData?.profile?.role === 'USER') {
      baseItems.unshift(
        { path: '/dashboard', label: 'Dashboard', icon: <RiDashboardFill /> },
        { path: '/messages', label: 'Messages', icon: <MdContactMail /> }
      );
    } else if (userData?.profile?.role === 'GYM_OWNER') {
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
          {/* Brand Logo */}
          <Link to={isLoggedIn ? (userData?.profile?.role === 'GYM_OWNER' ? '/gym-dashboard' : '/dashboard') : '/'} className="brand-link">
            <motion.div
              className="brand-logo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src="/fittyIcon.png" alt="FitMitra Logo" className="logo-image" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
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

            {/* Added Login link ONLY for non-logged-in users in Desktop view */}
            {!isLoggedIn && (
              <>
                <Link to="/auth?tab=login" className="nav-link special-link highlight">
                  <FaSignInAlt className="nav-icon" /> Login
                </Link>
              </>
            )}
          </div>

          {/* Welcome Message (Below Navbar for mobile, inline for desktop if space permits, but using absolute usually looks cleaner) */}
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                className="welcome-message-container"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <span className="welcome-text">
                  {isLoggedIn ? `Welcome, ${userData?.name?.split(' ')[0] || 'User'}` : 'Welcome to FitMitra'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>


          {/* Right Side Actions */}
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

            {/* Gym Owner Upgrade Button */}
            {isLoggedIn && userData?.profile?.role === 'GYM_OWNER' && !isPremiumUser && (
              <motion.button
                className="upgrade-btn-nav"
                onClick={() => navigate('/gym-plans')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaCrown size={14} /> <span className="upgrade-text">Upgrade</span>
              </motion.button>
            )}

            {/* Notifications */}
            {isLoggedIn && (
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
                          <div className="no-notif">No new notifications</div>
                        ) : (
                          notifications.map((n, i) => (
                            <div key={i} className="notif-item">
                              <div className="notif-icon"><FaBell /></div>
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
            )}

            {/* User Section (Logged In) */}
            {isLoggedIn ? (
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
                        <div className="dropdown-user-info">
                          <p className="d-name">{userData?.name || 'User'}</p>
                          <p className="d-email">{userData?.email}</p>
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
            ) : (
              // Only show this on desktop; mobile has its own menu
              <div className="desktop-auth-buttons">
                {/* Auth buttons are in nav-links now */}
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
              <div className="mobile-header">
                <div className="mobile-brand">
                  <img src="/fittyIcon.png" alt="Logo" className="mobile-logo-img" />
                </div>
                <button className="mobile-close" onClick={() => setMobileMenuOpen(false)}>
                  <FaTimes />
                </button>
              </div>

              <div className="mobile-content">
                {isLoggedIn && (
                  <div className="mobile-user-profile">
                    <div className="mobile-avatar">
                      {userData?.profilePic ? (
                        <img src={userData.profilePic} alt="User" />
                      ) : (
                        <div className="mobile-avatar-placeholder">
                          {userData?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="mobile-user-details">
                      <h4>{userData?.name || 'User'}</h4>
                      <p>{userData?.email}</p>
                    </div>
                  </div>
                )}

                <div className="mobile-links-list">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`mobile-link-item ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}

                  {!isLoggedIn && (
                    <>
                      {/* Only Login, NO Signup */}
                      <Link to="/auth?tab=login" className="mobile-link-item highlight" onClick={() => setMobileMenuOpen(false)}>
                        <span className="icon"><FaSignInAlt /></span> Login
                      </Link>
                    </>
                  )}

                  {isLoggedIn && (
                    <button className="mobile-link-item logout" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
                      <span className="icon"><FaSignOutAlt /></span> Logout
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;