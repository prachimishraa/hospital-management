// routes/patients.js - Patient management routes

const express = require("express");
const router = express.Router();
const db = require("../database");

// GET /api/patients - Get all patients
router.get("/", (req, res) => {
  const patients = db.prepare("SELECT * FROM patients ORDER BY created_at DESC").all();
  res.json(patients);
});

// GET /api/patients/:id - Get single patient
router.get("/:id", (req, res) => {
  const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json(patient);
});

// POST /api/patients - Add new patient
router.post("/", (req, res) => {
  const { name, age, gender, phone, email, address, blood_group, medical_history } = req.body;

  if (!name) return res.status(400).json({ error: "Patient name is required" });

  const result = db
    .prepare(
      `INSERT INTO patients (name, age, gender, phone, email, address, blood_group, medical_history)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(name, age, gender, phone, email, address, blood_group, medical_history);

  res.status(201).json({ message: "Patient added", id: result.lastInsertRowid });
});

// PUT /api/patients/:id - Update patient
router.put("/:id", (req, res) => {
  const { name, age, gender, phone, email, address, blood_group, medical_history } = req.body;

  db.prepare(
    `UPDATE patients SET name=?, age=?, gender=?, phone=?, email=?, address=?, blood_group=?, medical_history=?
     WHERE id=?`
  ).run(name, age, gender, phone, email, address, blood_group, medical_history, req.params.id);

  res.json({ message: "Patient updated" });
});

// DELETE /api/patients/:id - Delete patient
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM patients WHERE id = ?").run(req.params.id);
  res.json({ message: "Patient deleted" });
});

module.exports = router;
