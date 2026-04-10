// database.js - SQLite database using sql.js (pure JavaScript, no compilation needed)
//
// sql.js is a WebAssembly port of SQLite — works on ALL platforms
// without needing Visual Studio, XCode, or any C++ build tools.
//
// HOW IT WORKS:
// - We export a "proxy" object that routes all db.prepare() calls to the real db
// - The real db is set up async using initDatabase() called from server.js
// - Routes use `const db = require('../database')` and work exactly as before

const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "hospital.db");

// Holds the real db wrapper once async init is done
let _db = null;

// ─── PROXY ────────────────────────────────────────────────────────────────────
// Routes import this proxy and call db.prepare() on it.
// The proxy forwards every call to _db once it has been initialized.
const dbProxy = new Proxy(
  {},
  {
    get(_, prop) {
      if (!_db) throw new Error("Database not initialized yet.");
      return _db[prop];
    },
  }
);

// ─── INIT ─────────────────────────────────────────────────────────────────────
// Called once in server.js before app.listen()
async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing .db file from disk, or create a fresh one
  let sqlDb;
  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    sqlDb = new SQL.Database(fileBuffer);
    console.log("📂 Loaded existing database");
  } else {
    sqlDb = new SQL.Database();
    console.log("🆕 Creating new database");
  }

  // Persist db to disk after every write
  function save() {
    const data = sqlDb.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  }

  // ─── WRAPPER ────────────────────────────────────────────────────────────────
  // Wraps sql.js to look like better-sqlite3's synchronous API.
  // Routes call db.prepare(sql).get(), .all(), .run() — same as before.
  _db = {
    exec(sql) {
      sqlDb.exec(sql);
      save();
    },

    pragma(pragmaStr) {
      sqlDb.run("PRAGMA " + pragmaStr);
    },

    prepare(sql) {
      return {
        // Write query — returns { lastInsertRowid }
        run(...args) {
          const params = flattenParams(args);
          sqlDb.run(sql, params);
          save();
          const result = sqlDb.exec("SELECT last_insert_rowid() as id");
          const lastInsertRowid = result[0]?.values[0][0] ?? null;
          return { lastInsertRowid, changes: 1 };
        },

        // Read single row — returns object or undefined
        get(...args) {
          const params = flattenParams(args);
          const stmt = sqlDb.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const row = convertRow(stmt.getAsObject());
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        },

        // Read all rows — returns array of objects
        all(...args) {
          const params = flattenParams(args);
          const rows = [];
          const stmt = sqlDb.prepare(sql);
          stmt.bind(params);
          while (stmt.step()) {
            rows.push(convertRow(stmt.getAsObject()));
          }
          stmt.free();
          return rows;
        },
      };
    },
  };

  // ─── CREATE TABLES ──────────────────────────────────────────────────────────
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      blood_group TEXT,
      medical_history TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialization TEXT,
      phone TEXT,
      email TEXT,
      available_days TEXT,
      available_time TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      doctor_id INTEGER,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'Scheduled',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      department TEXT,
      phone TEXT,
      email TEXT,
      salary REAL,
      join_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      category TEXT,
      quantity INTEGER DEFAULT 0,
      unit TEXT,
      min_quantity INTEGER DEFAULT 10,
      supplier TEXT,
      price REAL,
      last_updated TEXT DEFAULT (datetime('now'))
    );
  `);

  // ─── SEED DEMO DATA ─────────────────────────────────────────────────────────
  const userCount = _db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  if (userCount === 0) {
    _db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
      .run("Admin User", "admin@hospital.com", "admin123", "admin");
    _db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
      .run("Dr. Reception", "reception@hospital.com", "staff123", "staff");
  }

  const doctorCount = _db.prepare("SELECT COUNT(*) as count FROM doctors").get().count;
  if (doctorCount === 0) {
    const ins = _db.prepare(
      "INSERT INTO doctors (name, specialization, phone, email, available_days, available_time) VALUES (?, ?, ?, ?, ?, ?)"
    );
    ins.run("Dr. Priya Sharma", "Cardiologist", "9876543210", "priya@hospital.com", "Mon, Wed, Fri", "9:00 AM - 5:00 PM");
    ins.run("Dr. Rohan Mehta", "Neurologist", "9876543211", "rohan@hospital.com", "Tue, Thu, Sat", "10:00 AM - 6:00 PM");
    ins.run("Dr. Anjali Singh", "Pediatrician", "9876543212", "anjali@hospital.com", "Mon, Tue, Wed, Thu", "8:00 AM - 4:00 PM");
    ins.run("Dr. Vikram Nair", "Orthopedics", "9876543213", "vikram@hospital.com", "Wed, Fri", "11:00 AM - 7:00 PM");
  }

  const patientCount = _db.prepare("SELECT COUNT(*) as count FROM patients").get().count;
  if (patientCount === 0) {
    const ins = _db.prepare(
      "INSERT INTO patients (name, age, gender, phone, email, address, blood_group, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    ins.run("Rahul Gupta", 34, "Male", "9811234567", "rahul@gmail.com", "Sector 5, Delhi", "O+", "Hypertension");
    ins.run("Sunita Verma", 45, "Female", "9821234567", "sunita@gmail.com", "Rohini, Delhi", "B+", "Diabetes Type 2");
    ins.run("Arjun Patel", 22, "Male", "9831234567", "arjun@gmail.com", "Noida, UP", "A-", "None");
  }

  const inventoryCount = _db.prepare("SELECT COUNT(*) as count FROM inventory").get().count;
  if (inventoryCount === 0) {
    const ins = _db.prepare(
      "INSERT INTO inventory (item_name, category, quantity, unit, min_quantity, supplier, price) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    ins.run("Paracetamol 500mg", "Medicine", 500, "Tablets", 100, "MedSupply Co.", 2.5);
    ins.run("Surgical Gloves", "Equipment", 20, "Boxes", 50, "SafeGlove Ltd.", 150);
    ins.run("Syringes 5ml", "Equipment", 200, "Pieces", 100, "MedSupply Co.", 8);
    ins.run("Bandages", "Supplies", 300, "Rolls", 50, "HealthStore", 25);
    ins.run("Antiseptic Solution", "Medicine", 45, "Bottles", 20, "PharmaPlus", 120);
  }

  const employeeCount = _db.prepare("SELECT COUNT(*) as count FROM employees").get().count;
  if (employeeCount === 0) {
    const ins = _db.prepare(
      "INSERT INTO employees (name, role, department, phone, email, salary, join_date) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    ins.run("Meena Kumari", "Head Nurse", "ICU", "9851234567", "meena@hospital.com", 55000, "2022-03-15");
    ins.run("Suresh Rajan", "Lab Technician", "Pathology", "9861234567", "suresh@hospital.com", 42000, "2021-07-01");
    ins.run("Kavya Iyer", "Receptionist", "Front Desk", "9871234567", "kavya@hospital.com", 35000, "2023-01-10");
  }

  console.log("✅ Database ready with tables and demo data!");
  return _db;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Handles both .run(a, b, c) and .run([a, b, c]) style calls
function flattenParams(args) {
  if (args.length === 0) return [];
  if (args.length === 1 && Array.isArray(args[0])) return args[0];
  return args.map((v) => (v === undefined ? null : v));
}

// sql.js returns COUNT(*) as BigInt — convert to Number so JSON works
function convertRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = typeof v === "bigint" ? Number(v) : v;
  }
  return out;
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
module.exports = dbProxy;
module.exports.initDatabase = initDatabase;
