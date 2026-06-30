import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Send as form data (required by OAuth2PasswordBearer)
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      // ✅ Use shared API instance (no hardcoded URL)
      const response = await API.post("/auth/login", formData);

      // Save token and user
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect to main app
      window.location.href = "/";

    } catch (err) {
      const detail = err.response?.data?.detail || "Invalid credentials";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h1>Login</h1>

        {error && (
          <p style={{ color: "#e03333", fontSize: "14px", margin: 0, textAlign: "center" }}>
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;