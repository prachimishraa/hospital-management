// pages/Patients.jsx - Patient management with add/edit/delete

import React, { useState, useEffect } from "react";
import { getPatients, addPatient, updatePatient, deletePatient } from "../api";
import Toast from "../components/Toast";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const emptyForm = {
  name: "", age: "", gender: "", phone: "", email: "",
  address: "", blood_group: "", medical_history: "",
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, []);

  // Filter patients when search changes
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      patients.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.phone && p.phone.includes(q)) ||
          (p.blood_group && p.blood_group.toLowerCase().includes(q))
      )
    );
  }, [search, patients]);

  const loadPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data);
    } catch {
      showToast("Failed to load patients", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => setToast({ message, type });

  const openAddModal = () => {
    setEditingPatient(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setForm({ ...patient });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, form);
        showToast("Patient updated successfully!");
      } else {
        await addPatient(form);
        showToast("Patient registered successfully!");
      }
      setShowModal(false);
      loadPatients();
    } catch (err) {
      showToast(err.response?.data?.error || "Something went wrong", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete patient "${name}"? This cannot be undone.`)) return;
    try {
      await deletePatient(id);
      showToast("Patient removed");
      loadPatients();
    } catch {
      showToast("Failed to delete patient", "error");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div style={{ padding: "20px", color: "#64748b" }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>{patients.length} registered patients</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          ➕ Register Patient
        </button>
      </div>

      <div className="card">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍  Search by name, phone or blood group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span style={{ color: "#64748b", fontSize: "13px" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🧑‍⚕️</div>
            <p>No patients found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Age / Gender</th>
                  <th>Phone</th>
                  <th>Blood Group</th>
                  <th>Medical History</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: "#64748b" }}>{i + 1}</td>
                    <td>
                      <strong>{p.name}</strong>
                      {p.email && <div style={{ fontSize: "12px", color: "#64748b" }}>{p.email}</div>}
                    </td>
                    <td>{p.age ? `${p.age} yrs` : "—"} / {p.gender || "—"}</td>
                    <td>{p.phone || "—"}</td>
                    <td>
                      {p.blood_group ? (
                        <span className="badge badge-red">{p.blood_group}</span>
                      ) : "—"}
                    </td>
                    <td style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.medical_history || "None"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(p)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              <h2>{editingPatient ? "Edit Patient" : "Register New Patient"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Patient's full name" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Mobile number" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="Age in years" min="0" max="150" />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Blood Group</label>
                  <select name="blood_group" value={form.blood_group} onChange={handleChange}>
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((bg) => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Home address" />
              </div>
              <div className="form-group">
                <label>Medical History</label>
                <textarea
                  name="medical_history"
                  value={form.medical_history}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Known conditions, allergies, etc."
                  style={{ resize: "vertical" }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingPatient ? "Save Changes" : "Register Patient"}
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
