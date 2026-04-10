// pages/Doctors.jsx - Doctor management with schedule view

import React, { useState, useEffect } from "react";
import { getDoctors, getDoctorById, addDoctor, updateDoctor, deleteDoctor } from "../api";
import Toast from "../components/Toast";

const SPECIALIZATIONS = [
  "Cardiologist", "Neurologist", "Pediatrician", "Orthopedics",
  "Dermatologist", "Gynecologist", "ENT Specialist", "General Physician",
  "Oncologist", "Psychiatrist", "Ophthalmologist", "Radiologist",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const emptyForm = {
  name: "", specialization: "", phone: "", email: "",
  available_days: "", available_time: "",
};

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedDoctor, setSelectedDoctor] = useState(null); // For schedule view
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    try {
      const res = await getDoctors();
      setDoctors(res.data);
    } catch {
      showToast("Failed to load doctors", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  const openAddModal = () => {
    setEditingDoctor(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (doc) => {
    setEditingDoctor(doc);
    setForm({ ...doc });
    setShowModal(true);
  };

  const viewSchedule = async (id) => {
    try {
      const res = await getDoctorById(id);
      setSelectedDoctor(res.data);
    } catch {
      showToast("Failed to load schedule", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, form);
        showToast("Doctor updated successfully!");
      } else {
        await addDoctor(form);
        showToast("Doctor added successfully!");
      }
      setShowModal(false);
      loadDoctors();
    } catch (err) {
      showToast(err.response?.data?.error || "Something went wrong", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove Dr. ${name} from the system?`)) return;
    try {
      await deleteDoctor(id);
      showToast("Doctor removed");
      loadDoctors();
    } catch {
      showToast("Failed to delete doctor", "error");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization && d.specialization.toLowerCase().includes(search.toLowerCase()))
  );

  const statusColors = {
    Scheduled: "badge-blue",
    Completed: "badge-green",
    Cancelled: "badge-red",
  };

  if (loading) return <div style={{ padding: "20px", color: "#64748b" }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Doctors</h1>
          <p>{doctors.length} doctors on staff</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          ➕ Add Doctor
        </button>
      </div>

      <div className="card">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍  Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">👨‍⚕️</div>
            <p>No doctors found.</p>
          </div>
        ) : (
          <div style={styles.doctorGrid}>
            {filtered.map((doc) => (
              <div key={doc.id} style={styles.doctorCard}>
                <div style={styles.doctorAvatar}>
                  {doc.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div style={styles.doctorInfo}>
                  <strong style={{ fontSize: "15px" }}>{doc.name}</strong>
                  <span className="badge badge-purple" style={{ marginTop: "4px", alignSelf: "flex-start" }}>
                    {doc.specialization || "General"}
                  </span>
                  {doc.phone && <div style={styles.docDetail}>📞 {doc.phone}</div>}
                  {doc.available_days && <div style={styles.docDetail}>📅 {doc.available_days}</div>}
                  {doc.available_time && <div style={styles.docDetail}>⏰ {doc.available_time}</div>}
                </div>
                <div style={styles.doctorActions}>
                  <button className="btn btn-ghost btn-sm" onClick={() => viewSchedule(doc.id)}>
                    📋 Schedule
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(doc)}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc.id, doc.name)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Doctor Schedule Modal */}
      {selectedDoctor && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedDoctor(null)}>
          <div className="modal" style={{ width: "620px" }}>
            <div className="modal-header">
              <h2>📋 {selectedDoctor.name}'s Schedule</h2>
              <button className="modal-close" onClick={() => setSelectedDoctor(null)}>×</button>
            </div>

            <div style={styles.scheduleInfo}>
              <div><strong>Specialization:</strong> {selectedDoctor.specialization}</div>
              <div><strong>Available Days:</strong> {selectedDoctor.available_days || "Not set"}</div>
              <div><strong>Working Hours:</strong> {selectedDoctor.available_time || "Not set"}</div>
            </div>

            <h3 style={{ fontSize: "14px", margin: "20px 0 10px", color: "#64748b" }}>
              UPCOMING APPOINTMENTS ({selectedDoctor.appointments?.length || 0})
            </h3>

            {!selectedDoctor.appointments?.length ? (
              <div className="empty-state" style={{ padding: "30px" }}>
                <p>No appointments scheduled.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDoctor.appointments.map((appt) => (
                      <tr key={appt.id}>
                        <td>{appt.patient_name}</td>
                        <td>{appt.date}</td>
                        <td>{appt.time}</td>
                        <td>
                          <span className={`badge ${statusColors[appt.status] || "badge-blue"}`}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedDoctor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Doctor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Dr. Full Name" />
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <select name="specialization" value={form.specialization} onChange={handleChange}>
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
                </div>
              </div>
              <div className="form-group">
                <label>Available Days (e.g. Mon, Wed, Fri)</label>
                <input name="available_days" value={form.available_days} onChange={handleChange} placeholder="Mon, Tue, Wed" />
              </div>
              <div className="form-group">
                <label>Available Time (e.g. 9:00 AM - 5:00 PM)</label>
                <input name="available_time" value={form.available_time} onChange={handleChange} placeholder="9:00 AM - 5:00 PM" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingDoctor ? "Save Changes" : "Add Doctor"}
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
  doctorGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  doctorCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  doctorAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #7c3aed, #0a84ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "700",
    fontSize: "15px",
    flexShrink: 0,
  },
  doctorInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  docDetail: { fontSize: "12px", color: "#64748b" },
  doctorActions: {
    display: "flex",
    gap: "6px",
    flexShrink: 0,
  },
  scheduleInfo: {
    background: "#f0f4f8",
    borderRadius: "8px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "13px",
    color: "#1a2332",
  },
};
