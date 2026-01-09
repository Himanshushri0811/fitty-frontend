import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './axiosConfig';
import './Profile.css';

// ---- MOCK DATA (Fallback) ----
const MOCK_PROFILE = {
  username: "FitWarrior",
  email: "user@example.com",
  bio: "Consistency is key! 🏋️‍♂️",
  profile_pic: null,
  age: 25,
  gender: "male",
  height: 175,
  weight: 70,
  goal: "Muscle Gain",
  fitness_level: "Intermediate",
  workouts_completed: 42,
  calories_burned: 12500,
  current_streak: 5,
  achievements: 3
};

const MOCK_ACTIVITY = [
  { id: 1, type: 'workout', title: 'Chest Day Completed', time: '2 hours ago' },
  { id: 2, type: 'diet', title: 'Logged Lunch: 600 kcal', time: '5 hours ago' },
  { id: 3, type: 'achievement', title: 'New Badge: 5 Day Streak!', time: 'Yesterday' },
  { id: 4, type: 'workout', title: 'Leg Day', time: '2 days ago' },
];

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [profileData, setProfileData] = useState({ ...MOCK_PROFILE, username: "Loading..." });
  const [socialProfile, setSocialProfile] = useState(null);
  const [followingList, setFollowingList] = useState([]);
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
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
      const res = await API.get('/api/social/profiles/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSocialProfile(res.data);
    } catch (err) {
      console.error("Social profile fetch error:", err);
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

      // Ensure absolute URL for profile pic
      if (data.profile_pic && !data.profile_pic.startsWith('http')) {
        data.profile_pic = `${API.defaults.baseURL}${data.profile_pic}`;
      }

      setProfileData(data);
      setActivityLog(MOCK_ACTIVITY); // Fallback activity for visual filler
      setLoading(false);
    } catch (err) {
      console.error("Fetch profile error:", err);
      // If unauthorized, redirect to login
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
    ['age', 'height', 'weight', 'workouts_completed', 'calories_burned', 'current_streak'].forEach(field => {
      if (cleanData[field] === "") cleanData[field] = null;
    });
    if (cleanData.gender) cleanData.gender = cleanData.gender.toLowerCase();

    // Only send fields that the backend expects for update
    const updateData = {
      bio: cleanData.bio,
      age: cleanData.age,
      gender: cleanData.gender,
      height: cleanData.height,
      weight: cleanData.weight,
      goal: cleanData.goal,
      fitness_level: cleanData.fitness_level
    };

    try {
      const res = await API.put('/api/accounts/profile/', updateData);

      setProfileData(prev => ({ ...prev, ...res.data }));
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Awesome! Your profile is updated.' });
      setTimeout(() => setMessage(null), 3000);

    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      // Show specific error if available
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to update.';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // optimistic UI update
      const objectUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, profile_pic: objectUrl }));

      try {
        const formData = new FormData();
        formData.append('profile_pic', file);

        const res = await API.post('/api/accounts/profile/upload-pic/', formData);

        let serverUrl = res.data.profile_pic;
        if (serverUrl && !serverUrl.startsWith('http')) {
          serverUrl = `${API.defaults.baseURL}${serverUrl}`;
        }

        setProfileData(prev => ({ ...prev, profile_pic: serverUrl }));
        setMessage({ type: 'success', text: 'Profile picture updated!' });
        setTimeout(() => setMessage(null), 3000);

      } catch (err) {
        console.error("Upload failed", err);
        setMessage({ type: 'error', text: 'Failed to upload image.' });
      }
    }
  };

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const navigateTo = (path) => navigate(path);

  // --- Render ---

  if (!isLoggedIn && !loading) {
    return (
      <div className="profile-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="login-prompt" style={{ textAlign: 'center' }}>
          <h2>Login Required</h2>
          <p>Please login to view your profile statistics.</p>
          <button
            className="save-btn"
            style={{ maxWidth: '200px' }}
            onClick={() => navigate('/auth?tab=login')}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">

      {/* Header */}
      <div className="profile-header animate-fade-in">
        <div className="profile-avatar-wrapper">
          <img
            src={profileData.profile_pic || "https://i.pravatar.cc/150?img=12"}
            alt="Avatar"
            className="profile-avatar"
          />
          {isEditing && (
            <label className="avatar-upload-label">
              📷
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

        <div className="profile-info">
          <h1>{profileData.username || "User"}</h1>
          <span className="profile-email">{profileData.email}</span>
          <p className="profile-bio">{profileData.bio || "No bio yet."}</p>
        </div>

        <div className="header-actions">
          {socialProfile && (
            <div className="social-stats-mini">
              <div className="stat-clickable" onClick={() => navigate(`/profile/${socialProfile.username}/followers`)}>
                <strong>{socialProfile.followers_count}</strong> Followers
              </div>
              <div className="stat-clickable" onClick={() => navigate(`/profile/${socialProfile.username}/following`)}>
                <strong>{socialProfile.following_count}</strong> Following
              </div>
            </div>
          )}
          <button
            className={`edit-mode-btn ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile ✏️'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {['Overview', 'Fitness', 'Activity', 'Community', 'Settings'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}

      {message && (
        <div style={{
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? 'rgba(0,255,153,0.1)' : 'rgba(255,100,100,0.1)',
          color: message.type === 'success' ? '#00ff99' : '#ff6666',
          border: `1px solid ${message.type === 'success' ? '#00ff99' : '#ff6666'}`
        }}>
          {message.text}
        </div>
      )}

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="animate-slide-up">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{profileData.workouts_completed}</span>
              <span className="stat-label">Workouts</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{(profileData.calories_burned / 1000).toFixed(1)}k</span>
              <span className="stat-label">Kcal Burned</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{profileData.current_streak} 🔥</span>
              <span className="stat-label">Day Streak</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{profileData.achievements_count || 0}</span>
              <span className="stat-label">Achievements</span>
            </div>
          </div>

          {/* Personal Details Form (Read/Edit) */}
          <h3 style={{ marginBottom: '1.5rem', color: '#00ff99' }}>Personal Details</h3>
          <form className="profile-form-grid" onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Display Name</label>
              <input
                className="form-input"
                name="username"
                value={profileData.username}
                disabled
                title="Username cannot be changed"
              />
            </div>
            <div className="form-group">
              <label>Goal</label>
              <select
                className="form-input"
                name="goal"
                value={profileData.goal}
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                <option>Fat Loss</option>
                <option>Muscle Gain</option>
                <option>Maintenance</option>
                <option>Flexibility</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fitness Level</label>
              <select
                className="form-input"
                name="fitness_level"
                value={profileData.fitness_level}
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Elite">Elite</option>
              </select>
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                className="form-input"
                name="age"
                type="number"
                value={profileData.age}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                className="form-input"
                name="gender"
                value={profileData.gender}
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input
                className="form-input"
                name="height"
                type="number"
                value={profileData.height}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                className="form-input"
                name="weight"
                type="number"
                value={profileData.weight}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Bio</label>
              <textarea
                className="form-input"
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows="3"
                style={{ resize: 'vertical' }}
              />
            </div>

            {isEditing && (
              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="save-btn">Save Changes</button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* TAB: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="animate-slide-up">
          <h3 style={{ marginBottom: '1.5rem' }}>Recent History</h3>
          <div className="activity-list">
            {activityLog.map(act => (
              <div key={act.id} className={`activity-item ${act.type}`}>
                <div className="act-info">
                  <div className="act-title">{act.title}</div>
                  <div className="act-time">{act.time}</div>
                </div>
                <div className="act-icon">
                  {act.type === 'workout' && '💪'}
                  {act.type === 'diet' && '🥗'}
                  {act.type === 'achievement' && '🏆'}
                </div>
              </div>
            ))}
            <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>End of history</p>
          </div>
        </div>
      )}

      {/* TAB: FITNESS (Quick Actions) */}
      {activeTab === 'fitness' && (
        <div className="animate-slide-up">
          <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
          <div className="quick-actions-grid">
            <div className="action-card" onClick={() => navigateTo('/workout')}>
              <span className="action-icon">🏋️</span>
              <span>New Workout</span>
            </div>
            <div className="action-card" onClick={() => navigateTo('/diet')}>
              <span className="action-icon">🥑</span>
              <span>Log Meal</span>
            </div>
            <div className="action-card" onClick={() => navigateTo('/posture')}>
              <span className="action-icon">🧘</span>
              <span>Posture Check</span>
            </div>
            <div className="action-card" onClick={() => navigateTo('/health-tracking')}>
              <span className="action-icon">📊</span>
              <span>Health Stats</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: COMMUNITY */}
      {activeTab === 'community' && (
        <div className="animate-slide-up">
          <h3 style={{ marginBottom: '1.5rem', color: '#667eea' }}>People You Follow</h3>
          {loadingSocial ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : followingList.length === 0 ? (
            <div className="empty-community" style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
              <p style={{ color: '#64748b' }}>You aren't following anyone yet.</p>
              <button onClick={() => navigate('/explore')} className="save-btn" style={{ maxWidth: '200px', marginTop: '10px' }}>Discover People</button>
            </div>
          ) : (
            <div className="following-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              {followingList.map(user => (
                <div key={user.id} className="user-mini-card" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 15px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  borderRadius: '12px',
                  border: '1px solid rgba(100, 116, 139, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate(`/profile/${user.username}`)}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #667eea' }}>
                      {user.profile_picture ? (
                        <img src={user.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={user.username} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#667eea', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0' }}>@{user.username}</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{user.full_name || 'FitMitra User'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/messages?user=${user.id}`)}
                    style={{
                      background: 'rgba(102, 126, 234, 0.1)',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      color: '#a5b4fc',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: SETTINGS (Placeholder) */}
      {activeTab === 'settings' && (
        <div className="animate-slide-up" style={{ textAlign: 'center', padding: '40px', background: '#1a1a1f', borderRadius: '16px' }}>
          <h3>Account Settings</h3>
          <p style={{ color: '#aaa', marginBottom: '20px' }}>Manage your subscription, notifications, and privacy.</p>
          <button className="save-btn" style={{ background: '#333', color: '#fff' }}>Logout (Coming Soon)</button>
        </div>
      )}

    </div>
  );
};

export default Profile;