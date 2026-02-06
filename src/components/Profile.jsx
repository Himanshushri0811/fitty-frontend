import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Settings, Users, Activity, Dumbbell, LayoutGrid } from "lucide-react";
import "./Profile.css";

// Tabs
import OverviewTab from "./ProfileTabs/OverviewTab";
import FitnessTab from "./ProfileTabs/FitnessTab";
import ActivityTab from "./ProfileTabs/ActivityTab";
import CommunityTab from "./ProfileTabs/CommunityTab";
import SettingsTab from "./ProfileTabs/SettingsTab";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "" });

  const startEditing = () => {
    setEditForm({ name: user?.name || "", bio: user?.bio || "" });
    setIsEditing(true);
  };

  const saveProfile = () => {
    // Optimistic update
    updateProfile({ ...user, name: editForm.name, bio: editForm.bio });
    setIsEditing(false);
    // TODO: persist to backend
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "fitness", label: "Fitness", icon: Dumbbell },
    { id: "activity", label: "History", icon: Activity },
    { id: "community", label: "Community", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleAvatarChange = (e) => {
    // Mock functionality for avatar upload hook
    const file = e.target.files[0];
    if (file) {
      // Create local URL for preview
      const url = URL.createObjectURL(file);
      updateProfile({ ...user, profile_picture: url });
      // TODO: Upload to backend
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateProfile({ ...user, cover_picture: url });
    }
  };

  return (
    <div className="profile-container animate-enter">
      {/* 1. Header Section */}
      <div className="profile-header-wrapper">
        <div className="profile-cover">
          {user?.cover_picture ? (
            <img src={user.cover_picture} alt="Cover" className="cover-image" />
          ) : (
            <div className="cover-gradient" />
          )}
          <div className="cover-overlay"></div>

          <label className="edit-cover-btn">
            <Camera size={20} /> Edit Cover
            <input type="file" hidden onChange={handleCoverChange} accept="image/*" />
          </label>
        </div>

        <div className="profile-info-section">
          <div className="profile-avatar-wrapper">
            <img
              src={user?.profile_picture || "https://ui-avatars.com/api/?name=" + (user?.name || "User") + "&background=6366f1&color=fff"}
              alt="Profile"
              className="profile-avatar"
            />
            <label className="edit-avatar-btn">
              <Camera size={18} />
              <input type="file" hidden onChange={handleAvatarChange} accept="image/*" />
            </label>
          </div>

          <div className="profile-text">
            {isEditing ? (
              <div className="edit-profile-form">
                <input
                  className="edit-name-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Your Name"
                />
                <textarea
                  className="edit-bio-input"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={2}
                />
                <div className="edit-actions">
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button className="save-btn" onClick={saveProfile}>Save</button>
                </div>
              </div>
            ) : (
              <>
                <div className="name-row">
                  <h1 className="profile-name">{user?.name || "Athlete"}</h1>
                  <button className="edit-profile-btn" onClick={startEditing}>
                    <Settings size={16} /> Edit
                  </button>
                </div>
                <p className="profile-bio">{user?.bio || "Fitness Enthusiast"}</p>
              </>
            )}

            <div className="profile-stats-row">
              <div className="stat-pill">
                <strong>{user?.followers_count || 0}</strong>
                <span>Followers</span>
              </div>
              <div className="stat-pill">
                <strong>{user?.following_count || 0}</strong>
                <span>Following</span>
              </div>
              <div className="stat-pill">
                <strong>{user?.streak || 0}</strong>
                <span>Day Streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Container for Content */}
      <div className="page-container" style={{ paddingTop: '0' }}>
        {/* Navigation Tabs */}
        <nav className="profile-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  className="active-indicator"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="profile-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && <OverviewTab />}
              {activeTab === "fitness" && <FitnessTab />}
              {activeTab === "activity" && <ActivityTab />}
              {activeTab === "community" && <CommunityTab />}
              {activeTab === "settings" && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;