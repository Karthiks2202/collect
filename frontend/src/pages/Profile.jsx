import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useToast } from "../context/ToastContext";
import StatsCards from "../components/StatsCards";
import GenrePreferences from "../components/GenrePreferences";
import "./Profile.css";

// Generate initials-based avatar color from username
function getAvatarColor(name = "") {
  const colors = [
    "#4f8ef7", "#f7564f", "#4ff79e", "#f7c44f",
    "#af4ff7", "#f74faf", "#4ff7f0", "#f7904f",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");
}

function formatMemberSince(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function Profile() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fileInputRef = useRef(null);

  // ── Profile state ────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatar, setAvatar] = useState(null);

  // ── Stats state ──────────────────────────────────────────────────
  const [stats, setStats] = useState(null);

  // ── Password state ───────────────────────────────────────────────
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // ── Active tab ───────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("stats"); // stats | genres | password

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setProfileLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        API.get("/profile/"),
        API.get("/profile/stats"),
      ]);
      setProfile(profileRes.data);
      setEditUsername(profileRes.data.username || "");
      setEditEmail(profileRes.data.email || "");
      setStats(statsRes.data);
      if (profileRes.data.id) {
        const saved = localStorage.getItem(`avatar_user_${profileRes.data.id}`);
        if (saved) {
          setAvatar(saved);
        }
      }
    } catch (err) {
      showToast("Failed to load profile data", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "warning");
      return;
    }
    if (file.size > 1024 * 1024) {
      showToast("Image must be smaller than 1MB", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setAvatar(dataUrl);
      if (profile?.id) {
        localStorage.setItem(`avatar_user_${profile.id}`, dataUrl);
      }
      showToast("Avatar updated successfully!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = (e) => {
    e.stopPropagation();
    setAvatar(null);
    if (profile?.id) {
      localStorage.removeItem(`avatar_user_${profile.id}`);
    }
    showToast("Avatar removed", "info");
  };


  // ── Update Profile ────────────────────────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editUsername.trim()) {
      showToast("Username cannot be empty", "warning");
      return;
    }
    if (!editEmail.trim()) {
      showToast("Email cannot be empty", "warning");
      return;
    }

    try {
      setProfileSaving(true);
      const res = await API.put("/profile/", {
        username: editUsername.trim(),
        email: editEmail.trim(),
      });
      setProfile((prev) => ({
        ...prev,
        username: res.data.username,
        email: res.data.email,
      }));
      setEditMode(false);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to update profile";
      showToast(detail, "error");
    } finally {
      setProfileSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditUsername(profile?.username || "");
    setEditEmail(profile?.email || "");
    setEditMode(false);
  };

  // ── Change Password ───────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields", "warning");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New password and confirm password do not match", "error");
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await API.put("/profile/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      showToast(res.data.message || "Password changed successfully!", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to change password";
      showToast(detail, "error");
    } finally {
      setPasswordSaving(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showToast("Logged out successfully. See you soon!", "info");
    setTimeout(() => navigate("/login"), 800);
  };

  // ── Loading skeleton ──────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="profile-page">
        <div className="profile-header profile-header--skeleton">
          <div className="avatar-skeleton" />
          <div className="info-skeleton">
            <div className="skeleton-line skeleton-line--lg" />
            <div className="skeleton-line skeleton-line--md" />
            <div className="skeleton-line skeleton-line--sm" />
          </div>
        </div>
      </div>
    );
  }

  const avatarColor = getAvatarColor(profile?.username || "");
  const initials = getInitials(profile?.username || profile?.email || "?");
  const memberSince = formatMemberSince(profile?.created_at);

  return (
    <div className="profile-page">

      {/* ═══════════════════════════════════════════
          PROFILE HEADER
      ═══════════════════════════════════════════ */}
      <section className="profile-header">
        {/* Avatar */}
        <div
          className="avatar-circle-container"
          onClick={() => fileInputRef.current?.click()}
          title="Click to upload/change avatar"
        >
          <div
            className="avatar-circle"
            style={{
              background: avatar
                ? `url(${avatar}) center/cover no-repeat`
                : `radial-gradient(circle at 30% 30%, ${avatarColor}cc, ${avatarColor}44)`,
              borderColor: avatarColor,
            }}
          >
            {!avatar && <span className="avatar-initials">{initials}</span>}
            <div className="avatar-overlay">
              <span className="camera-icon">📷</span>
              <span className="overlay-text">Upload</span>
            </div>
          </div>
          {avatar && (
            <button
              type="button"
              className="avatar-remove-btn"
              onClick={handleRemoveAvatar}
              title="Remove avatar"
            >
              ✕
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>


        {/* Info / Edit Area */}
        <div className="profile-info">
          {editMode ? (
            <form className="profile-edit-form" onSubmit={handleUpdateProfile}>
              <div className="profile-field-group">
                <label className="field-label" htmlFor="edit-username">Username</label>
                <input
                  id="edit-username"
                  className="profile-input"
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="profile-field-group">
                <label className="field-label" htmlFor="edit-email">Email</label>
                <input
                  id="edit-email"
                  className="profile-input"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className="profile-edit-actions">
                <button
                  id="save-profile-btn"
                  type="submit"
                  className="btn btn--primary"
                  disabled={profileSaving}
                >
                  {profileSaving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={cancelEdit}
                  disabled={profileSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="profile-username">{profile?.username}</h1>
              <p className="profile-email">{profile?.email}</p>
              {memberSince && (
                <p className="profile-member-since">
                  <span className="member-since-icon">🗓</span>
                  Member since {memberSince}
                </p>
              )}
              <button
                id="edit-profile-btn"
                className="btn btn--outline btn--sm"
                onClick={() => setEditMode(true)}
              >
                ✎ Edit Profile
              </button>
            </>
          )}
        </div>

        {/* Logout button top-right */}
        <button
          id="logout-btn"
          className="btn btn--danger btn--logout"
          onClick={handleLogout}
        >
          ⏻ Logout
        </button>
      </section>

      {/* ═══════════════════════════════════════════
          STATS CARDS
      ═══════════════════════════════════════════ */}
      <section className="profile-section">
        <h2 className="section-title">Your Activity</h2>
        <StatsCards stats={stats} />
      </section>

      {/* ═══════════════════════════════════════════
          TABS: Genres | Password
      ═══════════════════════════════════════════ */}
      <section className="profile-section">
        <div className="profile-tabs" role="tablist">
          <button
            id="tab-genres"
            role="tab"
            aria-selected={activeTab === "genres"}
            className={`profile-tab ${activeTab === "genres" ? "profile-tab--active" : ""}`}
            onClick={() => setActiveTab("genres")}
          >
            🎭 Genre Preferences
          </button>
          <button
            id="tab-password"
            role="tab"
            aria-selected={activeTab === "password"}
            className={`profile-tab ${activeTab === "password" ? "profile-tab--active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            🔒 Change Password
          </button>
        </div>

        {/* ── Genre Preferences tab ── */}
        {activeTab === "genres" && (
          <div className="tab-panel" role="tabpanel">
            <GenrePreferences />
          </div>
        )}

        {/* ── Change Password tab ── */}
        {activeTab === "password" && (
          <div className="tab-panel" role="tabpanel">
            <form
              id="change-password-form"
              className="password-form"
              onSubmit={handleChangePassword}
            >
              <h2 className="section-title">Change Password</h2>

              <div className="profile-field-group">
                <label className="field-label" htmlFor="old-password">
                  Current Password
                </label>
                <div className="password-input-wrap">
                  <input
                    id="old-password"
                    className="profile-input"
                    type={showOld ? "text" : "password"}
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowOld((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showOld ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div className="profile-field-group">
                <label className="field-label" htmlFor="new-password">
                  New Password
                  <span className="field-hint"> (min. 6 characters)</span>
                </label>
                <div className="password-input-wrap">
                  <input
                    id="new-password"
                    className="profile-input"
                    type={showNew ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowNew((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showNew ? "🙈" : "👁"}
                  </button>
                </div>
                {/* Inline strength hint */}
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <p className="field-error">Password must be at least 6 characters</p>
                )}
              </div>

              <div className="profile-field-group">
                <label className="field-label" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <div className="password-input-wrap">
                  <input
                    id="confirm-password"
                    className="profile-input"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
                {/* Inline mismatch hint */}
                {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                  <p className="field-error">Passwords do not match</p>
                )}
              </div>

              <button
                id="submit-password-btn"
                type="submit"
                className="btn btn--primary"
                disabled={passwordSaving}
              >
                {passwordSaving ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}

export default Profile;