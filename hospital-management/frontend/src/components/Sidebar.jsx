// components/Sidebar.jsx - Navigation sidebar

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

// Navigation links with icons
const navItems = [
  { path: "/", icon: "📊", label: "Dashboard" },
  { path: "/patients", icon: "🧑‍⚕️", label: "Patients" },
  { path: "/doctors", icon: "👨‍⚕️", label: "Doctors" },
  { path: "/appointments", icon: "📅", label: "Appointments" },
  { path: "/employees", icon: "👥", label: "Employees" },
  { path: "/inventory", icon: "📦", label: "Inventory" },
  { path: "/users", icon: "🔒", label: "System Users", adminOnly: true },
];

export default function Sidebar({ user, onLogout }) {
  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <span style={styles.logoIcon}>🏥</span>
        <div>
          <div style={styles.logoName}>MediCare</div>
          <div style={styles.logoSub}>HMS</div>
        </div>
      </div>

      {/* User info */}
      <div style={styles.userCard}>
        <div style={styles.avatar}>{user.name[0].toUpperCase()}</div>
        <div>
          <div style={styles.userName}>{user.name}</div>
          <div style={styles.userRole}>{user.role}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navLabel}>MAIN MENU</div>
        {navItems
          .filter((item) => !item.adminOnly || user.role === "admin")
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
      </nav>

      {/* Logout button at bottom */}
      <button onClick={onLogout} style={styles.logoutBtn}>
        🚪 Logout
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    background: "#0d1b2a",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    overflow: "hidden",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 8px 24px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "16px",
  },
  logoIcon: { fontSize: "28px" },
  logoName: { color: "white", fontWeight: "700", fontSize: "16px", lineHeight: 1 },
  logoSub: { color: "#a8b8cb", fontSize: "10px", letterSpacing: "0.1em" },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "10px",
    marginBottom: "24px",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0a84ff, #00c896)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },
  userName: { color: "white", fontSize: "13px", fontWeight: "600", lineHeight: 1.3 },
  userRole: { color: "#a8b8cb", fontSize: "11px", textTransform: "capitalize" },
  nav: { flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
  navLabel: {
    color: "#4a6080",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    padding: "0 12px 8px 12px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    color: "#a8b8cb",
    textDecoration: "none",
    fontSize: "13.5px",
    fontWeight: "500",
    transition: "all 0.15s",
  },
  navItemActive: {
    background: "rgba(10, 132, 255, 0.18)",
    color: "#60b0ff",
  },
  navIcon: { fontSize: "16px", width: "20px", textAlign: "center" },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "transparent",
    border: "none",
    color: "#a8b8cb",
    fontSize: "13px",
    cursor: "pointer",
    marginTop: "8px",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
};
