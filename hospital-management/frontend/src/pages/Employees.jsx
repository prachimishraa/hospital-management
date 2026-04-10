// pages/Employees.jsx - Employee management

import React, { useState, useEffect } from "react";
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from "../api";
import Toast from "../components/Toast";

const DEPARTMENTS = [
  "ICU", "Emergency", "Cardiology", "Neurology", "Pediatrics",
  "Orthopedics", "Radiology", "Pathology", "Pharmacy", "Front Desk",
  "Administration", "Maintenance",
];

const emptyForm = {
  name: "", role: "", department: "", phone: "", email: "", salary: "", join_date: "",
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch {
      showToast("Failed to load employees", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  const openAddModal = () => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setForm({ ...emp });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, form);
        showToast("Employee updated successfully!");
      } else {
        await addEmployee(form);
        showToast("Employee added successfully!");
      }
      setShowModal(false);
      loadEmployees();
    } catch (err) {
      showToast(err.response?.data?.error || "Something went wrong", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove employee "${name}"?`)) return;
    try {
      await deleteEmployee(id);
      showToast("Employee removed");
      loadEmployees();
    } catch {
      showToast("Failed to delete employee", "error");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.department && e.department.toLowerCase().includes(search.toLowerCase())) ||
      (e.role && e.role.toLowerCase().includes(search.toLowerCase()))
  );

  // Department color map for variety
  const deptColors = {
    ICU: "badge-red", Emergency: "badge-red", Cardiology: "badge-blue",
    Neurology: "badge-purple", Pediatrics: "badge-yellow", Pharmacy: "badge-teal",
    Pathology: "badge-teal", "Front Desk": "badge-green",
  };

  if (loading) return <div style={{ padding: "20px", color: "#64748b" }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>{employees.length} staff members</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          ➕ Add Employee
        </button>
      </div>

      <div className="card">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍  Search by name, role or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">👥</div>
            <p>No employees found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Salary (₹)</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => (
                  <tr key={emp.id}>
                    <td style={{ color: "#64748b" }}>{i + 1}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "8px",
                          background: "linear-gradient(135deg, #0a84ff, #7c3aed)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white", fontWeight: "700", fontSize: "12px", flexShrink: 0,
                        }}>
                          {emp.name[0]}
                        </div>
                        <div>
                          <strong>{emp.name}</strong>
                          {emp.email && <div style={{ fontSize: "12px", color: "#64748b" }}>{emp.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{emp.role || "—"}</td>
                    <td>
                      {emp.department ? (
                        <span className={`badge ${deptColors[emp.department] || "badge-blue"}`}>
                          {emp.department}
                        </span>
                      ) : "—"}
                    </td>
                    <td>{emp.phone || "—"}</td>
                    <td style={{ fontWeight: "600" }}>
                      {emp.salary ? `₹${Number(emp.salary).toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td>{emp.join_date || "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(emp)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id, emp.name)}>🗑️</button>
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
              <h2>{editingEmployee ? "Edit Employee" : "Add New Employee"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Employee name" />
                </div>
                <div className="form-group">
                  <label>Role / Designation</label>
                  <input name="role" value={form.role} onChange={handleChange} placeholder="e.g. Head Nurse" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select name="department" value={form.department} onChange={handleChange}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
                </div>
                <div className="form-group">
                  <label>Salary (₹)</label>
                  <input name="salary" type="number" value={form.salary} onChange={handleChange} placeholder="Monthly salary" />
                </div>
              </div>
              <div className="form-group">
                <label>Join Date</label>
                <input name="join_date" type="date" value={form.join_date} onChange={handleChange} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? "Save Changes" : "Add Employee"}
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
