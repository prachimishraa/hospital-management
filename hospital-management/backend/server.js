// server.js - Main Express server for Hospital Management System

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── IMPORT ROUTES ────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patients");
const doctorRoutes = require("./routes/doctors");
const appointmentRoutes = require("./routes/appointments");
const employeeRoutes = require("./routes/employees");
const inventoryRoutes = require("./routes/inventory");

// ─── USE ROUTES ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/inventory", inventoryRoutes);

// ─── DASHBOARD STATS ROUTE ────────────────────────────────────────────────────
const db = require("./database");

app.get("/api/stats", (req, res) => {
  try {
    const totalPatients = db.prepare("SELECT COUNT(*) as count FROM patients").get().count;
    const totalDoctors = db.prepare("SELECT COUNT(*) as count FROM doctors").get().count;
    const totalEmployees = db.prepare("SELECT COUNT(*) as count FROM employees").get().count;
    const totalAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments").get().count;
    const todayAppointments = db
      .prepare("SELECT COUNT(*) as count FROM appointments WHERE date = date('now')")
      .get().count;
    const lowStock = db
      .prepare("SELECT COUNT(*) as count FROM inventory WHERE quantity <= min_quantity")
      .get().count;

    res.json({ totalPatients, totalDoctors, totalEmployees, totalAppointments, todayAppointments, lowStock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
// We need to wait for sql.js to finish async initialization before listening.
// This is the only change from the original — everything else stays the same.
async function startServer() {
  try {
    const { initDatabase } = require("./database");
    await initDatabase(); // sets up tables and seed data

    app.listen(PORT, () => {
      console.log(`🏥 Hospital Management Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();
