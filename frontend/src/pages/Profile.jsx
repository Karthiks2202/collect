import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // ✅ Use shared API instance (token attached automatically)
      const response = await API.get("/profile/");
      setEmail(response.data.email);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const updateProfile = async () => {
    setProfileError("");
    try {
      const response = await API.put("/profile/", { email });
      alert(response.data.message || "Profile updated");
    } catch (error) {
      const detail = error.response?.data?.detail || "Update failed";
      setProfileError(detail);
    }
  };

  const changePassword = async () => {
    setPasswordError("");
    try {
      const response = await API.put("/profile/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      alert(response.data.message || "Password changed");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      const detail = error.response?.data?.detail || "Password change failed";
      setPasswordError(detail);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-card">
        <h3>Email</h3>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {profileError && (
          <p style={{ color: "#e03333", fontSize: "13px" }}>{profileError}</p>
        )}
        <button onClick={updateProfile}>Update Profile</button>
      </div>

      <div className="profile-card">
        <h3>Change Password</h3>
        <input
          type="password"
          placeholder="Current Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {passwordError && (
          <p style={{ color: "#e03333", fontSize: "13px" }}>{passwordError}</p>
        )}
        <button onClick={changePassword}>Change Password</button>
      </div>

      <div className="profile-card">
        <h3>Account</h3>
        <button
          onClick={logout}
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;