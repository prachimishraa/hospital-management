// pages/Inventory.jsx - Stock and inventory management

import React, { useState, useEffect } from "react";
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from "../api";
import Toast from "../components/Toast";

const CATEGORIES = ["Medicine", "Equipment", "Supplies", "Consumables", "Lab Reagents", "PPE"];

const emptyForm = {
  item_name: "", category: "", quantity: "", unit: "",
  min_quantity: "", supplier: "", price: "",
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInventory(); }, []);

  const loadInventory = async () => {
    try {
      const res = await getInventory();
      setItems(res.data);
    } catch {
      showToast("Failed to load inventory", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  const openAddModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({ ...item });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, form);
        showToast("Item updated successfully!");
      } else {
        await addInventoryItem(form);
        showToast("Item added to inventory!");
      }
      setShowModal(false);
      loadInventory();
    } catch (err) {
      showToast(err.response?.data?.error || "Something went wrong", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from inventory?`)) return;
    try {
      await deleteInventoryItem(id);
      showToast("Item removed");
      loadInventory();
    } catch {
      showToast("Failed to delete item", "error");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const filtered = items.filter((item) => {
    const matchSearch = item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = filterCategory === "All" || item.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const lowStockCount = items.filter((i) => i.quantity <= i.min_quantity).length;

  const getStockStatus = (item) => {
    if (item.quantity === 0) return { label: "Out of Stock", cls: "badge-red" };
    if (item.quantity <= item.min_quantity) return { label: "Low Stock", cls: "badge-yellow" };
    return { label: "In Stock", cls: "badge-green" };
  };

  if (loading) return <div style={{ padding: "20px", color: "#64748b" }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>{items.length} items · {lowStockCount > 0 && <span style={{ color: "#ff9f0a" }}>⚠️ {lowStockCount} low stock alert{lowStockCount !== 1 ? "s" : ""}</span>}</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          ➕ Add Item
        </button>
      </div>

      {/* Low stock alert banner */}
      {lowStockCount > 0 && (
        <div style={styles.alertBanner}>
          ⚠️ <strong>{lowStockCount} item{lowStockCount !== 1 ? "s" : ""}</strong> {lowStockCount !== 1 ? "are" : "is"} running low or out of stock. Please restock soon.
        </div>
      )}

      <div className="card">
        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="🔍  Search items or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "9px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px",
              fontSize: "13px", fontFamily: "inherit", outline: "none", width: "240px",
            }}
          />
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${filterCategory === cat ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <p>No inventory items found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Min. Qty</th>
                  <th>Unit</th>
                  <th>Supplier</th>
                  <th>Price (₹)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const stock = getStockStatus(item);
                  return (
                    <tr key={item.id} style={item.quantity <= item.min_quantity ? { background: "#fffbeb" } : {}}>
                      <td style={{ color: "#64748b" }}>{i + 1}</td>
                      <td><strong>{item.item_name}</strong></td>
                      <td>
                        <span className="badge badge-blue" style={{ fontSize: "11px" }}>
                          {item.category || "—"}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: "700",
                          color: item.quantity === 0 ? "#b91c1c" : item.quantity <= item.min_quantity ? "#a16207" : "#15803d"
                        }}>
                          {item.quantity}
                        </span>
                      </td>
                      <td style={{ color: "#64748b" }}>{item.min_quantity}</td>
                      <td>{item.unit || "—"}</td>
                      <td>{item.supplier || "—"}</td>
                      <td>{item.price ? `₹${Number(item.price).toLocaleString("en-IN")}` : "—"}</td>
                      <td>
                        <span className={`badge ${stock.cls}`}>{stock.label}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(item)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id, item.item_name)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingItem ? "Edit Item" : "Add Inventory Item"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input name="item_name" value={form.item_name} onChange={handleChange} required placeholder="e.g. Paracetamol 500mg" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input name="quantity" type="number" value={form.quantity} onChange={handleChange} min="0" placeholder="Current stock" />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input name="unit" value={form.unit} onChange={handleChange} placeholder="e.g. Tablets, Bottles" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Quantity (Alert threshold)</label>
                  <input name="min_quantity" type="number" value={form.min_quantity} onChange={handleChange} min="0" placeholder="Alert when below this" />
                </div>
                <div className="form-group">
                  <label>Price per Unit (₹)</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} min="0" step="0.01" placeholder="Unit price" />
                </div>
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier name" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? "Save Changes" : "Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

const styles = {
  alertBanner: {
    background: "#fef9c3",
    border: "1px solid #fde68a",
    borderRadius: "10px",
    padding: "12px 18px",
    fontSize: "13px",
    color: "#92400e",
    marginBottom: "20px",
  },
};
