// routes/auth.js - Login and user management routes

const express = require("express");
const router = express.Router();
const db = require("../database");

// POST /api/auth/login - Login user
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE email = ? AND password = ?")
    .get(email, password);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // In a real app you'd use JWT tokens here
  res.json({
    message: "Login successful",
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/users - Get all system users
router.get("/users", (req, res) => {
  const users = db
    .prepare("SELECT id, name, email, role, created_at FROM users")
    .all();
  res.json(users);
});

// POST /api/auth/users - Add new system user
router.post("/users", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  try {
    const result = db
      .prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
      .run(name, email, password, role || "staff");

    res.status(201).json({ message: "User created", id: result.lastInsertRowid });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE /api/auth/users/:id - Delete a user
router.delete("/users/:id", (req, res) => {
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ message: "User deleted" });
});

module.exports = router;
