const BASE = "/api";

// ── Helper ──────────────────────────────────────────
async function request(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ── Mock data for frontend-only mode ────────────────
// Remove these and use real API calls once backend is running

const MOCK_EMPLOYEES = [
  { id: 1, name: "Rajesh Kumar",  department: "Engineering", email: "rajesh@company.com",  phone: "9876543210", avatar: "👨‍💻", active: true },
  { id: 2, name: "Priya Sharma",  department: "HR & Admin",  email: "priya@company.com",   phone: "9876543211", avatar: "👩‍💼", active: true },
  { id: 3, name: "Anil Verma",    department: "Sales",       email: "anil@company.com",    phone: "9876543212", avatar: "👨‍💼", active: true },
  { id: 4, name: "Sunita Patel",  department: "Finance",     email: "sunita@company.com",  phone: "9876543213", avatar: "👩‍💻", active: true },
  { id: 5, name: "Vikram Singh",  department: "Operations",  email: "vikram@company.com",  phone: "9876543214", avatar: "👨‍🔧", active: true },
  { id: 6, name: "Meera Nair",    department: "Marketing",   email: "meera@company.com",   phone: "9876543215", avatar: "👩‍🎨", active: false },
];

let mockIdCounter = 10;
const pad = (n) => String(n).padStart(2, "0");
const fmtTime = (d) => {
  const h = d.getHours(); const m = d.getMinutes();
  return `${h > 12 ? h - 12 : h || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
};
const fmtDate = (d) => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
};
const makeVisitor = (id, name, phone, purpose, host, dept, status, daysAgo = 0, hoursAgo = 0) => {
  const checkIn = new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000);
  const checkOut = status === "EXITED" ? new Date(checkIn.getTime() + 3600000) : null;
  return {
    id, visitorName: name, phone, email: `${name.toLowerCase().replace(" ",".")}@gmail.com`,
    company: "Sample Corp", purpose, whomToMeet: host, employeeDept: dept,
    status, photoBase64: null,
    checkInTime: fmtTime(checkIn), checkInDate: fmtDate(checkIn),
    checkOutTime: checkOut ? fmtTime(checkOut) : null,
  };
};

let MOCK_VISITORS = [
  makeVisitor(1,  "Ramesh Babu",    "9000000001", "Business Meeting",   "Rajesh Kumar",  "Engineering", "WAITING",  0, 1),
  makeVisitor(2,  "Kavya Reddy",    "9000000002", "Interview",          "Priya Sharma",  "HR & Admin",  "WAITING",  0, 2),
  makeVisitor(3,  "Arjun Mehta",    "9000000003", "Vendor Discussion",  "Anil Verma",    "Sales",       "EXITED",   0, 3),
  makeVisitor(4,  "Divya Thomas",   "9000000004", "Support Visit",      "Vikram Singh",  "Operations",  "EXITED",   0, 5),
  makeVisitor(5,  "Sanjay Puri",    "9000000005", "Business Meeting",   "Sunita Patel",  "Finance",     "EXITED",   1, 2),
  makeVisitor(6,  "Nisha Kapoor",   "9000000006", "Personal Visit",     "Meera Nair",    "Marketing",   "EXITED",   1, 4),
  makeVisitor(7,  "Rohit Joshi",    "9000000007", "Delivery",           "Rajesh Kumar",  "Engineering", "EXITED",   2, 1),
  makeVisitor(8,  "Anita Rao",      "9000000008", "Interview",          "Priya Sharma",  "HR & Admin",  "EXITED",   2, 3),
  makeVisitor(9,  "Suresh Nair",    "9000000009", "Business Meeting",   "Anil Verma",    "Sales",       "EXITED",   3, 2),
  makeVisitor(10, "Preethi Kumar",  "9000000010", "Vendor Discussion",  "Vikram Singh",  "Operations",  "EXITED",   4, 1),
];

let MOCK_EMPLOYEES_LIST = [...MOCK_EMPLOYEES];

// ── USE_MOCK flag ─────────────────────────────────────
// Set to false when Spring Boot backend is running
export const USE_MOCK = true;

// ── API calls ─────────────────────────────────────────

export const api = {

  // ── Auth
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  // ── Employees
  getEmployees: (token) => {
    if (USE_MOCK) return Promise.resolve([...MOCK_EMPLOYEES_LIST]);
    return request("/employees", {}, token);
  },

  addEmployee: (data, token) => {
    if (USE_MOCK) {
      const emp = { ...data, id: ++mockIdCounter, active: true };
      MOCK_EMPLOYEES_LIST.push(emp);
      return Promise.resolve(emp);
    }
    return request("/employees", { method: "POST", body: JSON.stringify(data) }, token);
  },

  updateEmployee: (id, data, token) => {
    if (USE_MOCK) {
      MOCK_EMPLOYEES_LIST = MOCK_EMPLOYEES_LIST.map(e => e.id === id ? { ...e, ...data } : e);
      return Promise.resolve({ ...data, id });
    }
    return request(`/employees/${id}`, { method: "PUT", body: JSON.stringify(data) }, token);
  },

  toggleEmployee: (id, active, token) => {
    if (USE_MOCK) {
      MOCK_EMPLOYEES_LIST = MOCK_EMPLOYEES_LIST.map(e => e.id === id ? { ...e, active } : e);
      return Promise.resolve({ id, active });
    }
    return request(`/employees/${id}/toggle`, { method: "PUT", body: JSON.stringify({ active }) }, token);
  },

  // ── Visitors
  getWaiting: (token) => {
    if (USE_MOCK) return Promise.resolve(MOCK_VISITORS.filter(v => v.status === "WAITING"));
    return request("/visitors/waiting", {}, token);
  },

  getToday: (token) => {
    if (USE_MOCK) {
      const today = fmtDate(new Date());
      return Promise.resolve(MOCK_VISITORS.filter(v => v.checkInDate === today));
    }
    return request("/visitors/today", {}, token);
  },

  getAll: (token) => {
    if (USE_MOCK) return Promise.resolve([...MOCK_VISITORS].reverse());
    return request("/visitors/all", {}, token);
  },

  getByRange: (from, to, token) => {
    if (USE_MOCK) return Promise.resolve([...MOCK_VISITORS].reverse());
    return request(`/visitors/range?from=${from}&to=${to}`, {}, token);
  },

  getStats: (token) => {
    if (USE_MOCK) {
      const today = fmtDate(new Date());
      const todayVisitors = MOCK_VISITORS.filter(v => v.checkInDate === today);
      return Promise.resolve({
        currentlyWaiting: MOCK_VISITORS.filter(v => v.status === "WAITING").length,
        totalToday:        todayVisitors.length,
        exitedToday:       todayVisitors.filter(v => v.status === "EXITED").length,
        totalAll:          MOCK_VISITORS.length,
      });
    }
    return request("/visitors/stats", {}, token);
  },

  checkOut: (id, token) => {
    if (USE_MOCK) {
      MOCK_VISITORS = MOCK_VISITORS.map(v =>
        v.id === id ? { ...v, status: "EXITED", checkOutTime: fmtTime(new Date()) } : v
      );
      return Promise.resolve(MOCK_VISITORS.find(v => v.id === id));
    }
    return request(`/visitors/${id}/checkout`, { method: "PUT" }, token);
  },
};
