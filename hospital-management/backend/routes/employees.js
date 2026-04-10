// routes/employees.js - Employee management routes

const express = require("express");
const router = express.Router();
const db = require("../database");

// GET /api/employees - Get all employees
router.get("/", (req, res) => {
  const employees = db.prepare("SELECT * FROM employees ORDER BY name").all();
  res.json(employees);
});

// POST /api/employees - Add new employee
router.post("/", (req, res) => {
  const { name, role, department, phone, email, salary, join_date } = req.body;

  if (!name) return res.status(400).json({ error: "Employee name is required" });

  const result = db
    .prepare(
      "INSERT INTO employees (name, role, department, phone, email, salary, join_date) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(name, role, department, phone, email, salary, join_date);

  res.status(201).json({ message: "Employee added", id: result.lastInsertRowid });
});

// PUT /api/employees/:id - Update employee
router.put("/:id", (req, res) => {
  const { name, role, department, phone, email, salary, join_date } = req.body;

  db.prepare(
    "UPDATE employees SET name=?, role=?, department=?, phone=?, email=?, salary=?, join_date=? WHERE id=?"
  ).run(name, role, department, phone, email, salary, join_date, req.params.id);

  res.json({ message: "Employee updated" });
});

// DELETE /api/employees/:id - Delete employee
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM employees WHERE id = ?").run(req.params.id);
  res.json({ message: "Employee deleted" });
});

module.exports = router;
