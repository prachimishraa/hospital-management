// pages/Dashboard.jsx - Overview dashboard with stats

import React, { useState, useEffect } from "react";
import { getStats } from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "40px", color: "#64748b" }}>Loading dashboard...</div>;

  const statCards = [
    { label: "Total Patients", value: stats?.totalPatients, icon: "🧑‍⚕️", color: "#0a84ff", bg: "#e8f2ff" },
    { label: "Total Doctors", value: stats?.totalDoctors, icon: "👨‍⚕️", color: "#00c896", bg: "#dcfce7" },
    { label: "Employees", value: stats?.totalEmployees, icon: "👥", color: "#7c3aed", bg: "#ede9fe" },
    { label: "Total Appointments", value: stats?.totalAppointments, icon: "📅", color: "#ff9f0a", bg: "#fef9c3" },
    { label: "Today's Appointments", value: stats?.todayAppointments, icon: "📋", color: "#ff453a", bg: "#fee2e2" },
    { label: "Low Stock Alerts", value: stats?.lowStock, icon: "⚠️", color: "#f97316", bg: "#ffedd5" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Hospital overview and quick stats</p>
        </div>
        <div style={{ color: "#64748b", fontSize: "13px" }}>
          📅 {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((card) => (
          <div key={card.label} className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <div style={{ ...styles.statValue, color: card.color }}>{card.value ?? 0}</div>
              <div style={styles.statLabel}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div style={styles.infoGrid}>
        <div className="card">
          <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Quick Actions</h3>
          <div style={styles.quickActions}>
            {[
              { label: "Register Patient", link: "/patients", icon: "➕" },
              { label: "Book Appointment", link: "/appointments", icon: "📅" },
              { label: "Add Employee", link: "/employees", icon: "👤" },
              { label: "Update Stock", link: "/inventory", icon: "📦" },
            ].map((action) => (
              <a key={action.label} href={action.link} style={styles.quickBtn}>
                <span>{action.icon}</span>
                {action.label}
              </a>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>System Info</h3>
          <div style={styles.infoList}>
            <div style={styles.infoItem}>
              <span style={styles.infoKey}>System</span>
              <span style={styles.infoVal}>MediCare HMS v1.0</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoKey}>Backend</span>
              <span style={styles.infoVal}>Node.js + Express</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoKey}>Database</span>
              <span style={styles.infoVal}>SQLite (better-sqlite3)</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoKey}>Frontend</span>
              <span style={styles.infoVal}>React + Vite</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoKey}>Status</span>
              <span className="badge badge-green">● Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  statIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  },
  statValue: {
    fontSize: "30px",
    fontWeight: "700",
    lineHeight: 1,
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "500",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  quickActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  quickBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 14px",
    background: "#f0f4f8",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#1a2332",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background 0.15s",
    border: "1px solid #e2e8f0",
  },
  infoList: { display: "flex", flexDirection: "column", gap: "12px" },
  infoItem: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  infoKey: { fontSize: "13px", color: "#64748b" },
  infoVal: { fontSize: "13px", fontWeight: "600", color: "#1a2332" },
};
