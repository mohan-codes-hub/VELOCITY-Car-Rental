
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const API_URL = "http://localhost:5000/api/auth";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      navigate("/admin");
    } catch (error) {
      setError(error.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <Link to="/" className="login-back">
        ← BACK TO WEBSITE
      </Link>

      <div className="admin-login-card">
        <h1>VELOCITY</h1>
        <span className="login-subtitle">ADMINISTRATION PORTAL</span>

        <div className="login-divider"></div>

        <h2>Welcome Back</h2>
        <p>Sign in to access your dashboard</p>

        <form onSubmit={handleLogin}>
          <label>USERNAME</label>
          <input
            type="text"
            placeholder="Enter admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>PASSWORD</label>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "SIGNING IN..." : "SIGN IN →"}
          </button>
        </form>

        <div className="login-security">
          SECURE ADMIN ACCESS
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
