import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera, FaEdit, FaUserEdit, FaDumbbell, FaFire, FaTrophy, FaCalendarCheck } from 'react-icons/fa';
import API from './axiosConfig';
import './Profile.css';

// ---- MOCK DATA (Fallback) ----
const MOCK_PROFILE = {
  username: "FitWarrior",
  name: "Fit Warrior",
  email: "user@example.com",
  bio: "Consistency is key! 🏋️‍♂️",
  profile_pic: null,
  age: 25,
  gender: "male",
  height: 175,
  weight: 70,
  goal: "Muscle Gain",
  fitness_level: "Intermediate",
  workouts_completed: 0,
  calories_burned: 0,
  current_streak: 0,
  achievements_count: 0
};

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [profileData, setProfileData] = useState({ ...MOCK_PROFILE });
  const [socialProfile, setSocialProfile] = useState(null);
  const [followingList, setFollowingList] = useState([]);
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [activityLog, setActivityLog] = useState([]); // Can be fetched later
  const [message, setMessage] = useState(null);

  // --- Init ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);
    fetchProfile();
    fetchSocialProfile();
  }, []);

  const fetchSocialProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // Wrap in try-catch to avoid blocking if social app isn't fully ready
      const res = await API.get('/api/social/profiles/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSocialProfile(res.data);
    } catch (err) {
      // console.warn("Social profile not found/error:", err);
    }
  };

  const fetchFollowingList = async () => {
    if (!socialProfile) return;
    try {
      setLoadingSocial(true);
      const token = localStorage.getItem('access_token');
      const res = await API.get(`/api/social/profiles/${socialProfile.username}/following/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowingList(res.data.results.map(f => f.following));
    } catch (err) {
      console.error("Error fetching following list:", err);
    } finally {
      setLoadingSocial(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'community') {
      fetchFollowingList();
    }
  }, [activeTab, socialProfile]);

  // --- API Calls ---
  const fetchProfile = async () => {
    try {
      const res = await API.get('/api/accounts/profile/');
      const data = res.data;

      // Ensure absolute URL for profile pic and cover pic
      if (data.profile_pic && !data.profile_pic.startsWith('http')) {
        data.profile_pic = `${API.defaults.baseURL}${data.profile_pic}`;
      }
      if (data.cover_pic && !data.cover_pic.startsWith('http')) {
        data.cover_pic = `${API.defaults.baseURL}${data.cover_pic}`;
      }

      setProfileData(prev => ({ ...prev, ...data }));
      setLoading(false);
    } catch (err) {
      console.error("Fetch profile error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        setIsLoggedIn(false);
      }
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: 'info', text: 'Saving...' });

    // Sanitize data
    const cleanData = { ...profileData };
    ['age', 'height', 'weight'].forEach(field => {
      if (cleanData[field] === "") cleanData[field] = null;
    });
    if (cleanData.gender) cleanData.gender = cleanData.gender.toLowerCase();

    // Fields to send
    const updateData = {
      name: cleanData.name, // Added Name support
      bio: cleanData.bio,
      age: cleanData.age,
      gender: cleanData.gender,
      height: cleanData.height,
      weight: cleanData.weight,
      goal: cleanData.goal,
      fitness_level: cleanData.fitness_level
    };

    try {
      // Assuming PUT endpoint supports partial updates or handles these fields
      const res = await API.put('/api/accounts/profile/', updateData);

      setProfileData(prev => ({ ...prev, ...res.data }));
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);

    } catch (err) {
      console.error("Update failed:", err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    }
  };

  const handleFileChange = async (e, type = 'profile') => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);

      if (type === 'cover') {
        setProfileData(prev => ({ ...prev, cover_pic: objectUrl }));
      } else {
        setProfileData(prev => ({ ...prev, profile_pic: objectUrl }));
      }

      try {
        const formData = new FormData();
        formData.append(type === 'cover' ? 'cover_pic' : 'profile_pic', file);

        const res = await API.post('/api/accounts/profile/upload-pic/', formData);

        let serverUrl = type === 'cover' ? res.data.cover_pic : res.data.profile_pic;
        if (serverUrl && !serverUrl.startsWith('http')) {
          serverUrl = `${API.defaults.baseURL}${serverUrl}`;
        }

        setProfileData(prev => ({
          ...prev,
          [type === 'cover' ? 'cover_pic' : 'profile_pic']: serverUrl
        }));

        setMessage({ type: 'success', text: `${type === 'cover' ? 'Cover' : 'Profile'} picture updated!` });
        setTimeout(() => setMessage(null), 3000);

      } catch (err) {
        console.error("Upload failed", err);
        setMessage({ type: 'error', text: 'Failed to upload image.' });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // --- Render ---

  if (!isLoggedIn && !loading) {
    return (
      <div className="profile-container flex-center">
        <div className="login-prompt">
          <h2>Access Denied</h2>
          <p>Please login to view your profile.</p>
          <button className="btn-primary" onClick={() => navigate('/auth?tab=login')}>
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="profile-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 1. Profile Header Card */}
      <motion.div className="profile-header glass-panel" variants={itemVariants}>
        {/* Cover Image Area */}
        <div className="profile-cover-area" style={{
          backgroundImage: `url(${profileData.cover_pic || ''})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '200px',
          position: 'relative'
        }}>
          {!profileData.cover_pic && <div className="default-cover-gradient" style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', opacity: 0.8 }}></div>}

          {isEditing && (
            <label className="cover-edit-btn">
              <FaCamera style={{ marginRight: '8px' }} /> Change Cover
              <input
                type="file"
                ref={coverInputRef}
                onChange={(e) => handleFileChange(e, 'cover')}
                hidden
                accept="image/*"
              />
            </label>
          )}
        </div>

        <div className="profile-content-wrapper">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              <img
                src={profileData.profile_pic || "/assets/default_avatar.png"} // Ensure this path exists or use a URL
                onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + (profileData.name || "User") + "&background=random"; }}
                alt="Profile"
                className="profile-avatar-img"
              />
              {isEditing && (
                <label className="avatar-edit-overlay">
                  <FaCamera />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    hidden
                    accept="image/*"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="profile-identity">
            <div className="id-top">
              <h1 className="user-fullname">{profileData.name || profileData.username || "FitMitra User"}</h1>
              {socialProfile && <span className="user-badge">@{socialProfile.username}</span>}
              {!socialProfile && <span className="user-badge">@{profileData.username}</span>}
            </div>

            <p className="user-email">{profileData.email}</p>
            <p className="user-bio">{profileData.bio || "No bio added yet. Tell us about your journey!"}</p>

            <div className="profile-stats-mini">
              {socialProfile && (
                <>
                  <div className="mini-stat" onClick={() => navigate(`/profile/${socialProfile.username}/followers`)}>
                    <strong>{socialProfile.followers_count}</strong> Followers
                  </div>
                  <div className="mini-stat" onClick={() => navigate(`/profile/${socialProfile.username}/following`)}>
                    <strong>{socialProfile.following_count}</strong> Following
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="profile-actions">
            <button
              className={`btn-edit ${isEditing ? 'active' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Edit' : <><FaUserEdit /> Edit Profile</>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Navigation Tabs */}
      <motion.div className="profile-tabs-wrapper" variants={itemVariants}>
        {['Overview', 'Fitness', 'Activity', 'Community', 'Settings'].map(tab => (
          <button
            key={tab}
            className={`tab-item ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
            {activeTab === tab.toLowerCase() && <motion.div className="tab-indicator" layoutId="profileTab" />}
          </button>
        ))}
      </motion.div>

      {/* 3. Main Content Area */}
      <div className="profile-body">
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              className={`message-toast ${message.type}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {message.text}
            </motion.div>
          )}

          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="overview-layout"
            >
              {/* Stats Row */}
              <div className="stats-row">
                <div className="stat-box">
                  <div className="icon-wrapper"><FaDumbbell /></div>
                  <div className="stat-info">
                    <h3>{profileData.workouts_completed || 0}</h3>
                    <span>Workouts</span>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="icon-wrapper fire"><FaFire /></div>
                  <div className="stat-info">
                    {/* Fixed NaN issue */}
                    <h3>{((profileData.calories_burned || 0) / 1000).toFixed(1)}k</h3>
                    <span>Kcal Burned</span>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="icon-wrapper"><FaCalendarCheck /></div>
                  <div className="stat-info">
                    <h3>{profileData.current_streak || 0}</h3>
                    <span>Day Streak</span>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="icon-wrapper gold"><FaTrophy /></div>
                  <div className="stat-info">
                    <h3>{profileData.achievements_count || 0}</h3>
                    <span>Achievements</span>
                  </div>
                </div>
              </div>

              {/* Details Form */}
              <div className="details-section glass-panel">
                <div className="section-header">
                  <h3>Personal Details</h3>
                  {isEditing && <span className="edit-hinit">Editing Enabled</span>}
                </div>

                <form className="details-form" onSubmit={handleUpdateProfile}>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Your Full Name"
                      />
                    </div>
                    <div className="input-group">
                      <label>Username</label>
                      <input type="text" value={"@" + profileData.username} disabled className="dimmed" />
                    </div>
                  </div>

                  <div className="form-row three-col">
                    <div className="input-group">
                      <label>Age</label>
                      <input type="number" name="age" value={profileData.age || ""} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="input-group">
                      <label>Gender</label>
                      <select name="gender" value={profileData.gender || ""} onChange={handleInputChange} disabled={!isEditing}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Fitness Level</label>
                      <select name="fitness_level" value={profileData.fitness_level || "Beginner"} onChange={handleInputChange} disabled={!isEditing}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Elite">Elite</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row three-col">
                    <div className="input-group">
                      <label>Height (cm)</label>
                      <input type="number" name="height" value={profileData.height || ""} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="input-group">
                      <label>Weight (kg)</label>
                      <input type="number" name="weight" value={profileData.weight || ""} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="input-group">
                      <label>Goal</label>
                      <select name="goal" value={profileData.goal || ""} onChange={handleInputChange} disabled={!isEditing}>
                        <option>Fat Loss</option>
                        <option>Muscle Gain</option>
                        <option>Maintenance</option>
                        <option>Flexibility</option>
                        <option>Endurance</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group full-width">
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      rows="3"
                      value={profileData.bio || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Share a bit about yourself..."
                    ></textarea>
                  </div>

                  {isEditing && (
                    <div className="form-actions">
                      <button type="submit" className="btn-save">Save Changes</button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          )}

          {/* Placeholder for other tabs (To keep it concise, just structural) */}
          {activeTab !== 'overview' && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="tab-placeholder glass-panel"
            >
              <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
              <p>Features for this section are coming soon!</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Profile;