// pages/SystemUsers.jsx - Manage system login users (admin only)

import React, { useState, useEffect } from "react";
import { getUsers, addUser, deleteUser } from "../api";
import Toast from "../components/Toast";

const emptyForm = { name: "", email: "", password: "", role: "staff" };

export default function SystemUsers() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addUser(form);
      showToast("User created successfully!");
      setShowModal(false);
      setForm(emptyForm);
      loadUsers();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to create user", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      await deleteUser(id);
      showToast("User deleted");
      loadUsers();
    } catch {
      showToast("Failed to delete user", "error");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div style={{ padding: "20px", color: "#64748b" }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>System Users</h1>
          <p>Manage who can log into this system</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Add User
        </button>
      </div>

      {/* Access warning */}
      <div style={{
        background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "10px",
        padding: "12px 18px", fontSize: "13px", color: "#b91c1c", marginBottom: "20px"
      }}>
        🔒 <strong>Admin Only.</strong> Only admins can see and manage system login accounts.
      </div>

      <div className="card">
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔒</div>
            <p>No users found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: "#64748b" }}>{i + 1}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === "admin" ? "badge-red" : "badge-blue"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: "#64748b", fontSize: "12px" }}>{u.created_at?.split("T")[0]}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u.id, u.name)}
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ width: "420px" }}>
            <div className="modal-header">
              <h2>Create System User</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="User's full name" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Login email" />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Set a password" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
