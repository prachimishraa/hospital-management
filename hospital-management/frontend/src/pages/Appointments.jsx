// pages/Appointments.jsx - Book and manage appointments

import React, { useState, useEffect } from "react";
import {
  getAppointments, bookAppointment, updateAppointmentStatus,
  deleteAppointment, getPatients, getDoctors,
} from "../api";
import Toast from "../components/Toast";

const emptyForm = {
  patient_id: "", doctor_id: "", date: "", time: "", notes: "",
};

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM",
  "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
  "04:30 PM", "05:00 PM",
];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [apptRes, patRes, docRes] = await Promise.all([
        getAppointments(),
        getPatients(),
        getDoctors(),
      ]);
      setAppointments(apptRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bookAppointment(form);
      showToast("Appointment booked successfully!");
      setShowModal(false);
      setForm(emptyForm);
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Booking failed", "error");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      showToast(`Status updated to "${status}"`);
      loadAll();
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await deleteAppointment(id);
      showToast("Appointment deleted");
      loadAll();
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Filter appointments
  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = {
    Scheduled: "badge-blue",
    Completed: "badge-green",
    Cancelled: "badge-red",
  };

  if (loading) return <div style={{ padding: "20px", color: "#64748b" }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p>{appointments.length} total appointments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          📅 Book Appointment
        </button>
      </div>

      <div className="card">
        {/* Search and filter bar */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="🔍  Search patient or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "9px 14px",
              border: "1.5px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "13px",
              fontFamily: "inherit",
              outline: "none",
              width: "260px",
            }}
          />
          {["All", "Scheduled", "Completed", "Cancelled"].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${filterStatus === s ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
          <span style={{ marginLeft: "auto", color: "#64748b", fontSize: "13px" }}>
            {filtered.length} appointment{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📅</div>
            <p>No appointments found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((appt, i) => (
                  <tr key={appt.id}>
                    <td style={{ color: "#64748b" }}>{i + 1}</td>
                    <td><strong>{appt.patient_name}</strong></td>
                    <td>{appt.doctor_name}</td>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: "11px" }}>
                        {appt.specialization || "—"}
                      </span>
                    </td>
                    <td>{appt.date}</td>
                    <td>{appt.time}</td>
                    <td>
                      <span className={`badge ${statusBadge[appt.status]}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {appt.status === "Scheduled" && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleStatusChange(appt.id, "Completed")}
                            >✓</button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleStatusChange(appt.id, "Cancelled")}
                            >✕</button>
                          </>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(appt.id)}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>📅 Book Appointment</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Patient *</label>
                <select name="patient_id" value={form.patient_id} onChange={handleChange} required>
                  <option value="">— Choose a patient —</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} {p.phone ? `(${p.phone})` : ""}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Select Doctor *</label>
                <select name="doctor_id" value={form.doctor_id} onChange={handleChange} required>
                  <option value="">— Choose a doctor —</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.specialization ? `— ${d.specialization}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show selected doctor's availability hint */}
              {form.doctor_id && (() => {
                const doc = doctors.find((d) => String(d.id) === String(form.doctor_id));
                return doc ? (
                  <div style={{
                    background: "#e8f2ff", borderRadius: "8px", padding: "10px 14px",
                    fontSize: "12px", color: "#1d4ed8", marginBottom: "16px"
                  }}>
                    ℹ️ Available: <strong>{doc.available_days || "Not specified"}</strong> ·
                    <strong> {doc.available_time || "Not specified"}</strong>
                  </div>
                ) : null;
              })()}

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Time Slot *</label>
                  <select name="time" value={form.time} onChange={handleChange} required>
                    <option value="">— Pick a time slot —</option>
                    {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Reason for visit, symptoms, etc."
                  style={{ resize: "vertical" }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">📅 Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
