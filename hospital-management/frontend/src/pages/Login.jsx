// pages/Login.jsx - Login screen

import React, { useState } from "react";
import { login } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left decorative panel */}
      <div style={styles.leftPanel}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>🏥</div>
          <h1 style={styles.logoText}>MediCare HMS</h1>
          <p style={styles.logoSub}>Hospital Management System</p>
        </div>
        <div style={styles.features}>
          {["Patient Records", "Doctor Schedules", "Appointments", "Inventory", "Employee Management"].map((f) => (
            <div key={f} style={styles.featureItem}>
              <span style={styles.featureDot}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right login form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="admin@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "15px", marginTop: "8px" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={styles.demoHint}>
            <strong>Demo credentials:</strong><br />
            Admin: admin@hospital.com / admin123<br />
            Staff: reception@hospital.com / staff123
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg, #0d1b2a 0%, #1a3356 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "60px",
    color: "white",
  },
  logoArea: { marginBottom: "48px" },
  logoIcon: { fontSize: "52px", marginBottom: "12px" },
  logoText: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "38px",
    color: "white",
    margin: "0 0 6px 0",
  },
  logoSub: { color: "#a8b8cb", fontSize: "16px" },
  features: { display: "flex", flexDirection: "column", gap: "14px" },
  featureItem: { color: "#a8b8cb", fontSize: "15px", display: "flex", alignItems: "center", gap: "10px" },
  featureDot: { color: "#00c896", fontWeight: "bold", fontSize: "16px" },
  rightPanel: {
    width: "500px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f4f8",
    padding: "40px",
  },
  formCard: {
    background: "white",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "28px",
    color: "#1a2332",
    marginBottom: "6px",
  },
  subtitle: { color: "#64748b", fontSize: "14px", marginBottom: "28px" },
  errorBox: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "20px",
  },
  demoHint: {
    marginTop: "24px",
    padding: "14px",
    background: "#e8f2ff",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#1d4ed8",
    lineHeight: "1.8",
  },
};
