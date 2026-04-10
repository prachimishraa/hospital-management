// routes/doctors.js - Doctor management routes

const express = require("express");
const router = express.Router();
const db = require("../database");

// GET /api/doctors - Get all doctors
router.get("/", (req, res) => {
  const doctors = db.prepare("SELECT * FROM doctors ORDER BY name").all();
  res.json(doctors);
});

// GET /api/doctors/:id - Get single doctor with their appointments
router.get("/:id", (req, res) => {
  const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(req.params.id);
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });

  // Also get this doctor's appointments
  const appointments = db
    .prepare(
      `SELECT a.*, p.name as patient_name FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = ? ORDER BY a.date, a.time`
    )
    .all(req.params.id);

  res.json({ ...doctor, appointments });
});

// POST /api/doctors - Add new doctor
router.post("/", (req, res) => {
  const { name, specialization, phone, email, available_days, available_time } = req.body;

  if (!name) return res.status(400).json({ error: "Doctor name is required" });

  const result = db
    .prepare(
      `INSERT INTO doctors (name, specialization, phone, email, available_days, available_time)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(name, specialization, phone, email, available_days, available_time);

  res.status(201).json({ message: "Doctor added", id: result.lastInsertRowid });
});

// PUT /api/doctors/:id - Update doctor
router.put("/:id", (req, res) => {
  const { name, specialization, phone, email, available_days, available_time } = req.body;

  db.prepare(
    `UPDATE doctors SET name=?, specialization=?, phone=?, email=?, available_days=?, available_time=?
     WHERE id=?`
  ).run(name, specialization, phone, email, available_days, available_time, req.params.id);

  res.json({ message: "Doctor updated" });
});

// DELETE /api/doctors/:id - Delete doctor
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM doctors WHERE id = ?").run(req.params.id);
  res.json({ message: "Doctor deleted" });
});

module.exports = router;
