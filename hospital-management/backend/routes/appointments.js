// routes/appointments.js - Appointment management routes

const express = require("express");
const router = express.Router();
const db = require("../database");

// GET /api/appointments - Get all appointments with patient & doctor names
router.get("/", (req, res) => {
  const appointments = db
    .prepare(
      `SELECT a.*, p.name as patient_name, d.name as doctor_name, d.specialization
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       ORDER BY a.date DESC, a.time`
    )
    .all();
  res.json(appointments);
});

// GET /api/appointments/:id - Get single appointment
router.get("/:id", (req, res) => {
  const appointment = db
    .prepare(
      `SELECT a.*, p.name as patient_name, d.name as doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`
    )
    .get(req.params.id);

  if (!appointment) return res.status(404).json({ error: "Appointment not found" });
  res.json(appointment);
});

// POST /api/appointments - Book new appointment
router.post("/", (req, res) => {
  const { patient_id, doctor_id, date, time, notes } = req.body;

  if (!patient_id || !doctor_id || !date || !time) {
    return res.status(400).json({ error: "Patient, doctor, date and time are required" });
  }

  // Check if doctor already has an appointment at that time
  const conflict = db
    .prepare(
      "SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'Cancelled'"
    )
    .get(doctor_id, date, time);

  if (conflict) {
    return res.status(400).json({ error: "Doctor already has an appointment at this time" });
  }

  const result = db
    .prepare(
      "INSERT INTO appointments (patient_id, doctor_id, date, time, notes) VALUES (?, ?, ?, ?, ?)"
    )
    .run(patient_id, doctor_id, date, time, notes);

  res.status(201).json({ message: "Appointment booked!", id: result.lastInsertRowid });
});

// PUT /api/appointments/:id/status - Update appointment status
router.put("/:id/status", (req, res) => {
  const { status } = req.body;

  const validStatuses = ["Scheduled", "Completed", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ message: "Status updated" });
});

// DELETE /api/appointments/:id - Delete appointment
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM appointments WHERE id = ?").run(req.params.id);
  res.json({ message: "Appointment deleted" });
});

module.exports = router;
