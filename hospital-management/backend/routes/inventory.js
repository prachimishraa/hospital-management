// routes/inventory.js - Stock and inventory management routes

const express = require("express");
const router = express.Router();
const db = require("../database");

// GET /api/inventory - Get all inventory items
router.get("/", (req, res) => {
  const items = db.prepare("SELECT * FROM inventory ORDER BY item_name").all();
  res.json(items);
});

// POST /api/inventory - Add new item
router.post("/", (req, res) => {
  const { item_name, category, quantity, unit, min_quantity, supplier, price } = req.body;

  if (!item_name) return res.status(400).json({ error: "Item name is required" });

  const result = db
    .prepare(
      "INSERT INTO inventory (item_name, category, quantity, unit, min_quantity, supplier, price) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(item_name, category, quantity || 0, unit, min_quantity || 10, supplier, price);

  res.status(201).json({ message: "Item added", id: result.lastInsertRowid });
});

// PUT /api/inventory/:id - Update item
router.put("/:id", (req, res) => {
  const { item_name, category, quantity, unit, min_quantity, supplier, price } = req.body;

  db.prepare(
    `UPDATE inventory SET item_name=?, category=?, quantity=?, unit=?, min_quantity=?, supplier=?, price=?,
     last_updated=datetime('now') WHERE id=?`
  ).run(item_name, category, quantity, unit, min_quantity, supplier, price, req.params.id);

  res.json({ message: "Item updated" });
});

// DELETE /api/inventory/:id - Delete item
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM inventory WHERE id = ?").run(req.params.id);
  res.json({ message: "Item deleted" });
});

module.exports = router;
