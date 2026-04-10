# 🏥 MediCare - Hospital Management System

A full-stack Hospital Management System built with **React**, **Node.js**, and **SQLite**.

Built by: Prachi Mishra | B.Tech IT, Amity University UP

---

## 📁 Project Structure

```
hospital-management/
├── backend/                  ← Node.js + Express API
│   ├── routes/
│   │   ├── auth.js           ← Login + system users
│   │   ├── patients.js       ← Patient CRUD
│   │   ├── doctors.js        ← Doctor CRUD + schedules
│   │   ├── appointments.js   ← Booking + management
│   │   ├── employees.js      ← Employee CRUD
│   │   └── inventory.js      ← Stock management
│   ├── database.js           ← SQLite setup + seed data
│   ├── server.js             ← Express server entry point
│   └── package.json
│
└── frontend/                 ← React + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Patients.jsx
    │   │   ├── Doctors.jsx
    │   │   ├── Appointments.jsx
    │   │   ├── Employees.jsx
    │   │   ├── Inventory.jsx
    │   │   └── SystemUsers.jsx
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   └── Toast.jsx
    │   ├── api.js             ← All API calls
    │   ├── App.jsx            ← Routes + auth
    │   ├── main.jsx           ← Entry point
    │   └── index.css          ← Global styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 How to Run

### Step 1 — Open the project in VS Code

```
File → Open Folder → hospital-management/
```

### Step 2 — Start the Backend

Open a **new terminal** in VS Code:

```bash
cd backend
npm install
node server.js
```

You should see:
```
✅ Database ready with tables and demo data!
🏥 Hospital Management Server running on http://localhost:5000
```

### Step 3 — Start the Frontend

Open **another terminal** in VS Code:

```bash
cd frontend
npm install
npm run dev
```

Then visit: **http://localhost:3000**

---

## 🔑 Demo Login Credentials

| Role  | Email                         | Password   |
|-------|-------------------------------|------------|
| Admin | admin@hospital.com            | admin123   |
| Staff | reception@hospital.com        | staff123   |

> Admin can access "System Users" page to add/remove login accounts.

---

## ✨ Features

| Module              | What it does                                          |
|---------------------|-------------------------------------------------------|
| 📊 Dashboard         | Stats overview: patients, doctors, appointments, stock |
| 🧑‍⚕️ Patients         | Register, search, edit, delete patients               |
| 👨‍⚕️ Doctors          | Add doctors, view their appointment schedule          |
| 📅 Appointments      | Book appointments, filter by status, mark complete    |
| 👥 Employees         | Manage hospital staff, roles, departments             |
| 📦 Inventory         | Track stock, low stock alerts, restock management     |
| 🔒 System Users      | Admin-only: manage login accounts                     |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router v6, Axios, Vite
- **Backend:** Node.js, Express.js
- **Database:** SQLite (via better-sqlite3 — no MySQL setup needed!)
- **Styling:** Pure CSS with CSS variables

---

## 📝 Notes

- The SQLite database file (`hospital.db`) is auto-created in the `backend/` folder on first run
- All tables and sample data are seeded automatically
- No `.env` file needed — just install and run!
- In a real production app, you'd add JWT tokens and hash passwords (bcrypt)

---

## 🧩 REST API Endpoints

| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| POST   | /api/auth/login                  | Login                    |
| GET    | /api/stats                       | Dashboard stats           |
| GET    | /api/patients                    | List all patients         |
| POST   | /api/patients                    | Add patient               |
| PUT    | /api/patients/:id                | Update patient            |
| DELETE | /api/patients/:id                | Delete patient            |
| GET    | /api/doctors                     | List all doctors          |
| GET    | /api/doctors/:id                 | Doctor + appointments     |
| POST   | /api/appointments                | Book appointment          |
| PUT    | /api/appointments/:id/status     | Update status             |
| GET    | /api/inventory                   | List inventory            |
| GET    | /api/employees                   | List employees            |
