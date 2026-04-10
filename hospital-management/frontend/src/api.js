// api.js - All API calls to the backend in one place

import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL });

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const getUsers = () => api.get("/auth/users");
export const addUser = (data) => api.post("/auth/users", data);
export const deleteUser = (id) => api.delete(`/auth/users/${id}`);

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export const getStats = () => api.get("/stats");

// ── PATIENTS ──────────────────────────────────────────────────────────────────
export const getPatients = () => api.get("/patients");
export const addPatient = (data) => api.post("/patients", data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);

// ── DOCTORS ───────────────────────────────────────────────────────────────────
export const getDoctors = () => api.get("/doctors");
export const getDoctorById = (id) => api.get(`/doctors/${id}`);
export const addDoctor = (data) => api.post("/doctors", data);
export const updateDoctor = (id, data) => api.put(`/doctors/${id}`, data);
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);

// ── APPOINTMENTS ──────────────────────────────────────────────────────────────
export const getAppointments = () => api.get("/appointments");
export const bookAppointment = (data) => api.post("/appointments", data);
export const updateAppointmentStatus = (id, status) =>
  api.put(`/appointments/${id}/status`, { status });
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);

// ── EMPLOYEES ─────────────────────────────────────────────────────────────────
export const getEmployees = () => api.get("/employees");
export const addEmployee = (data) => api.post("/employees", data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// ── INVENTORY ─────────────────────────────────────────────────────────────────
export const getInventory = () => api.get("/inventory");
export const addInventoryItem = (data) => api.post("/inventory", data);
export const updateInventoryItem = (id, data) => api.put(`/inventory/${id}`, data);
export const deleteInventoryItem = (id) => api.delete(`/inventory/${id}`);
