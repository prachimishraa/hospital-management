// App.jsx - Main app with routing and authentication

import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Employees from "./pages/Employees";
import Inventory from "./pages/Inventory";
import SystemUsers from "./pages/SystemUsers";

export default function App() {
  // Store logged in user in state (simple auth without JWT)
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("hms_user") || "null")
  );

  // Save user to localStorage when they log in
  const handleLogin = (userData) => {
    localStorage.setItem("hms_user", JSON.stringify(userData));
    setUser(userData);
  };

  // Clear user on logout
  const handleLogout = () => {
    localStorage.removeItem("hms_user");
    setUser(null);
  };

  // Show login page if not logged in
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/inventory" element={<Inventory />} />
            {user.role === "admin" && (
              <Route path="/users" element={<SystemUsers />} />
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
