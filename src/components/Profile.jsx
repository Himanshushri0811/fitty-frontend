import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Pencil, Loader2, Check, X, AlertTriangle, RefreshCw } from "lucide-react";
import { fetchProfile, saveProfile, uploadImage } from "./profileApi";
import "./Profile.css";

import OverviewTab from "./ProfileTabs/OverviewTab";
import FitnessTab from "./ProfileTabs/FitnessTab";
import ActivityTab from "./ProfileTabs/ActivityTab";
import CommunityTab from "./ProfileTabs/CommunityTab";
import SettingsTab from "./ProfileTabs/SettingsTab";

const TABS = [
  { id: "overview", label: "Overview", Component: OverviewTab },
  { id: "fitness", label: "Fitness", Component: FitnessTab },
  { id: "activity", label: "History", Component: ActivityTab },
  { id: "community", label: "Community", Component: CommunityTab },
  { id: "settings", label: "Settings", Component: SettingsTab },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;
const NAME_MAX = 50;
const BIO_MAX = 200;

// Backend `profile_pic` bhejta hai, purane code me `profile_picture` tha: dono chalenge.
const normalize = (p) =>
  p
    ? {
      ...p,
      avatar: p.profile_pic || p.profile_picture || "",
      cover: p.cover_pic || p.cover_picture || "",
    }
    : null;

const initialsOf = (name) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

const RING_R = 80;
const RING_C = 2 * Math.PI * RING_R;

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "" });

  const [preview, setPreview] = useState({ profile_pic: null, cover_pic: null });
  const [uploading, setUploading] = useState({ profile_pic: false, cover_pic: false });
  const [brokenImg, setBrokenImg] = useState({ avatar: false, cover: false });

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((type, message) => {
    clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Header navbar/context ko bhi sync rakho (dono key naming ke saath)
  const syncAuth = useCallback(
    (data) => {
      try {
        updateProfile?.({
          ...user,
          name: data.name,
          bio: data.bio,
          profile_pic: data.profile_pic,
          profile_picture: data.profile_pic,
          cover_pic: data.cover_pic,
          cover_picture: data.cover_pic,
        });
      } catch {
        /* context sync best-effort hai */
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateProfile, user]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchProfile();
      setProfile(normalize(data));
      setBrokenImg({ avatar: false, cover: false });
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Server data aane tak context ke user se header dikhao, flicker nahi hoga
  const data = useMemo(() => profile || normalize(user), [profile, user]);

  const displayName = data?.name || data?.username || "Athlete";
  const avatarSrc = preview.profile_pic || (!brokenImg.avatar && data?.avatar) || "";
  const coverSrc = preview.cover_pic || (!brokenImg.cover && data?.cover) || "";

  /* ---------- image upload ---------- */
  const handleImage = async (kind, e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast("error", "Use a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      showToast("error", "Image is larger than 5 MB. Choose a smaller one.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview((p) => ({ ...p, [kind]: localUrl }));
    setUploading((u) => ({ ...u, [kind]: true }));

    try {
      const res = await uploadImage(kind, file);
      const next = { ...profile, profile_pic: res.profile_pic, cover_pic: res.cover_pic };
      setProfile(normalize(next));
      setBrokenImg({ avatar: false, cover: false });
      syncAuth({ name: data?.name, bio: data?.bio, profile_pic: res.profile_pic, cover_pic: res.cover_pic });
      showToast("success", kind === "cover_pic" ? "Cover photo updated." : "Profile photo updated.");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      URL.revokeObjectURL(localUrl);
      setPreview((p) => ({ ...p, [kind]: null }));
      setUploading((u) => ({ ...u, [kind]: false }));
    }
  };

  /* ---------- edit name / bio ---------- */
  const startEditing = () => {
    setForm({ name: data?.name || "", bio: data?.bio || "" });
    setIsEditing(true);
  };

  const cancelEditing = () => setIsEditing(false);

  const dirty =
    isEditing && (form.name.trim() !== (data?.name || "") || form.bio.trim() !== (data?.bio || ""));
  const canSave = dirty && form.name.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const updated = normalize(await saveProfile({ name: form.name.trim(), bio: form.bio.trim() }));
      setProfile(updated);
      syncAuth(updated);
      setIsEditing(false);
      showToast("success", "Profile saved.");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const onFormKey = (e) => {
    if (e.key === "Escape") cancelEditing();
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
  };

  /* ---------- tabs keyboard nav ---------- */
  const onTabKey = (e, idx) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = (idx + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    setActiveTab(TABS[next].id);
    document.getElementById(`pf-tab-${TABS[next].id}`)?.focus();
  };

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.Component;

  /* ---------- stats ---------- */
  const streak = Number(data?.streak ?? data?.current_streak ?? 0);
  const stats = [
    { label: "Day streak", value: streak },
    { label: "Workouts", value: data?.workouts_completed ?? 0 },
    { label: "Followers", value: data?.followers_count ?? 0 },
    { label: "Following", value: data?.following_count ?? 0 },
  ];
  const ringOffset = RING_C * (1 - Math.min(streak, 7) / 7);

  if (loading && !data) {
    return (
      <div className="pf-root" aria-busy="true">
        <div className="pf-cover pf-skel" />
        <div className="pf-info">
          <div className="pf-avatar-wrap">
            <div className="pf-skel pf-skel-circle" />
          </div>
          <div className="pf-identity">
            <div className="pf-skel pf-skel-line" style={{ width: 220, height: 32 }} />
            <div className="pf-skel pf-skel-line" style={{ width: 320, marginTop: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pf-root">
      {/* ===== Cover ===== */}
      <div className="pf-cover">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            className="pf-cover-img"
            onError={() => setBrokenImg((b) => ({ ...b, cover: true }))}
          />
        ) : (
          <div className="pf-cover-fallback" />
        )}
        <div className="pf-cover-fade" />
        {uploading.cover_pic && (
          <div className="pf-busy" role="status">
            <Loader2 className="pf-spin" size={18} /> Uploading cover
          </div>
        )}
        <label className="pf-cover-btn">
          <Camera size={16} />
          <span>{coverSrc ? "Change cover" : "Add cover"}</span>
          <input
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading.cover_pic}
            onChange={(e) => handleImage("cover_pic", e)}
          />
        </label>
      </div>

      {/* ===== Identity ===== */}
      <div className="pf-info">
        <div className="pf-avatar-wrap">
          <svg className="pf-ring" viewBox="0 0 176 176" aria-hidden="true">
            <circle className="pf-ring-track" cx="88" cy="88" r={RING_R} />
            <circle
              className="pf-ring-fill"
              cx="88"
              cy="88"
              r={RING_R}
              strokeDasharray={RING_C}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <div className="pf-avatar" title={`${Math.min(streak, 7)} of 7 days active this streak`}>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={`${displayName}'s profile`}
                onError={() => setBrokenImg((b) => ({ ...b, avatar: true }))}
              />
            ) : (
              <span className="pf-initials">{initialsOf(displayName)}</span>
            )}
            {uploading.profile_pic && (
              <div className="pf-avatar-busy" role="status" aria-label="Uploading photo">
                <Loader2 className="pf-spin" size={26} />
              </div>
            )}
          </div>
          <label className="pf-avatar-btn" aria-label="Change profile photo">
            <Camera size={16} />
            <input
              type="file"
              hidden
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading.profile_pic}
              onChange={(e) => handleImage("profile_pic", e)}
            />
          </label>
        </div>

        <div className="pf-identity">
          {isEditing ? (
            <div className="pf-form" onKeyDown={onFormKey}>
              <label className="pf-field">
                <span>Name</span>
                <input
                  autoFocus
                  value={form.name}
                  maxLength={NAME_MAX}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
              </label>
              <label className="pf-field">
                <span>Bio</span>
                <textarea
                  rows={3}
                  value={form.bio}
                  maxLength={BIO_MAX}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="What are you training for?"
                />
                <small>{form.bio.length}/{BIO_MAX}</small>
              </label>
              <div className="pf-actions">
                <button type="button" className="pf-btn pf-btn-ghost" onClick={cancelEditing} disabled={saving}>
                  <X size={16} /> Cancel
                </button>
                <button type="button" className="pf-btn pf-btn-primary" onClick={handleSave} disabled={!canSave}>
                  {saving ? <Loader2 className="pf-spin" size={16} /> : <Check size={16} />}
                  {saving ? "Saving" : "Save changes"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="pf-name-row">
                <h1 className="pf-name">{displayName}</h1>
                <button type="button" className="pf-btn pf-btn-ghost pf-btn-sm" onClick={startEditing}>
                  <Pencil size={14} /> Edit profile
                </button>
              </div>
              {data?.username && <p className="pf-handle">@{data.username}</p>}
              <p className="pf-bio">{data?.bio || "Add a short bio so people know what you're training for."}</p>
            </>
          )}
        </div>
      </div>

      {loadError && (
        <div className="pf-banner" role="alert">
          <AlertTriangle size={18} />
          <span>{loadError}</span>
          <button type="button" className="pf-btn pf-btn-ghost pf-btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? "pf-spin" : ""} /> Retry
          </button>
        </div>
      )}

      {/* ===== Stats ===== */}
      <dl className="pf-stats">
        {stats.map((s) => (
          <div className="pf-stat" key={s.label}>
            <dd>{s.value}</dd>
            <dt>{s.label}</dt>
          </div>
        ))}
      </dl>

      {/* ===== Tabs ===== */}
      <div className="page-container" style={{ paddingTop: 0 }}>
        <div className="pf-tabs-bar">
          <div className="pf-tabs" role="tablist" aria-label="Profile sections">
            {TABS.map((tab, idx) => (
              <button
                key={tab.id}
                id={`pf-tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={activeTab === tab.id}
                aria-controls="pf-panel"
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={`pf-tab ${activeTab === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => onTabKey(e, idx)}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.span
                    className="pf-tab-line"
                    layoutId="pf-tab-line"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="pf-panel" id="pf-panel" role="tabpanel" aria-labelledby={`pf-tab-${activeTab}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {ActiveComponent && <ActiveComponent profile={profile} reloadProfile={load} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ===== Toast ===== */}
      <div className="pf-toast-region" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.message}
              className={`pf-toast pf-toast-${toast.type}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
            >
              {toast.type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;