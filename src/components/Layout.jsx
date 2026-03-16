import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    to: "/visitors",
    label: "Visitors",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    to: "/employees",
    label: "Employees",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = {
    "/":          "Dashboard",
    "/visitors":  "Visitors",
    "/employees": "Employees",
  }[location.pathname] || "Admin";

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── SIDEBAR ── */}
      <aside
        className="flex flex-col flex-shrink-0"
        style={{
          width: "230px",
          background: "#ffffff",
          borderRight: "1px solid #eef0f6",
          boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: "1px solid #f0f2f8" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#3D6BC0" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="white" opacity="0.9"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#FF6829", lineHeight: 1.2 }}>WizzyBox</p>
            <p style={{ fontSize: "10.5px", color: "#9ca3af", fontWeight: 500 }}>Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "text-white"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`
              }
              style={({ isActive }) =>
                isActive ? { background: "#3D6BC0", color: "white" } : {}
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid #f0f2f8" }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: "#FF6829" }}
            >
              A
            </div>
            <div>
              <p style={{ fontSize: "12.5px", fontWeight: 600, color: "#1a1a2e" }}>
                {admin?.username || "Admin"}
              </p>
              <p style={{ fontSize: "11px", color: "#9ca3af" }}>Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header
          className="flex items-center justify-between px-8 py-4 flex-shrink-0"
          style={{ background: "#fff", borderBottom: "1px solid #eef0f6" }}
        >
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#FF6829" }}>{pageTitle}</h1>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "1px" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "#f0fdf4", color: "#15803d" }}
            >
              <span className="live-dot" />
              Live
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
