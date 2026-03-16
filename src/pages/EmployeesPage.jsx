import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import AddEmployeeModal from "../components/AddEmployeeModal";

export default function EmployeesPage() {
  const { token }    = useAuth();
  const [employees,  setEmployees]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);  // null = add, obj = edit
  const [filter,     setFilter]     = useState("ALL"); // ALL | ACTIVE | INACTIVE
  const [search,     setSearch]     = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getEmployees(token);
      setEmployees(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editing) {
      const updated = await api.updateEmployee(editing.id, form, token);
      setEmployees(prev => prev.map(e => e.id === editing.id ? { ...e, ...updated } : e));
    } else {
      const added = await api.addEmployee(form, token);
      setEmployees(prev => [...prev, added]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const handleToggle = async (emp) => {
    setTogglingId(emp.id);
    try {
      await api.toggleEmployee(emp.id, !emp.active, token);
      setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, active: !e.active } : e));
    } catch (e) { console.error(e); }
    finally { setTogglingId(null); setConfirmDel(null); }
  };

  const displayed = employees.filter(e => {
    const matchFilter =
      filter === "ALL" ||
      (filter === "ACTIVE" && e.active) ||
      (filter === "INACTIVE" && !e.active);
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeCount   = employees.filter(e => e.active).length;
  const inactiveCount = employees.filter(e => !e.active).length;

  return (
    <div className="flex flex-col gap-5">

      {/* ── TOP BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Filter tabs */}
          {[
            { key: "ALL",      label: `All (${employees.length})` },
            { key: "ACTIVE",   label: `Active (${activeCount})` },
            { key: "INACTIVE", label: `Inactive (${inactiveCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: filter === key ? "#3D6BC0" : "#fff",
                color:      filter === key ? "#fff"    : "#6b7280",
                border:     filter === key ? "none"    : "1.5px solid #e5e7eb",
              }}
            >
              {label}
            </button>
          ))}

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              className="form-input"
              style={{ paddingLeft: "34px", width: "200px" }}
              placeholder="Search name or dept…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => { setEditing(null); setShowModal(true); }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Employee
        </button>
      </div>

      {/* ── EMPLOYEE GRID ── */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 h-36 animate-pulse" style={{ background: "#f5f6fa" }} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 gap-3">
          <span style={{ fontSize: "44px" }}>👥</span>
          <p style={{ fontSize: "14px", color: "#9ca3af" }}>No employees found</p>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            Add First Employee
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 stagger">
          {displayed.map(emp => (
            <div
              key={emp.id}
              className="card p-5 animate-fade-slide flex flex-col gap-4 relative"
              style={{
                opacity: emp.active ? 1 : 0.6,
                transition: "opacity 0.2s",
              }}
            >
              {/* Active / Inactive indicator */}
              <div
                className="absolute top-4 right-4 w-2 h-2 rounded-full"
                style={{ background: emp.active ? "#22c55e" : "#d1d5db" }}
                title={emp.active ? "Active" : "Inactive"}
              />

              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: emp.active ? "#eef2fb" : "#f3f4f6" }}
                >
                  {emp.avatar || "👤"}
                </div>
                <div className="min-w-0">
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e" }} className="truncate">
                    {emp.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "#FF6829", fontWeight: 600 }}>
                    {emp.department}
                  </p>
                </div>
              </div>

              {/* Contact info */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <p style={{ fontSize: "12px", color: "#6b7280" }} className="truncate">{emp.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18L6.6 2a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 5.41 5.41"/>
                  </svg>
                  <p style={{ fontSize: "12px", color: "#6b7280", fontFamily: "monospace" }}>{emp.phone}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1" style={{ borderTop: "1px solid #f0f2f8" }}>
                <button
                  className="btn btn-outline flex-1 justify-center"
                  style={{ padding: "6px 10px", fontSize: "12px" }}
                  onClick={() => { setEditing(emp); setShowModal(true); }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
                <button
                  className={`btn flex-1 justify-center ${emp.active ? "btn-danger" : "btn-outline"}`}
                  style={{ padding: "6px 10px", fontSize: "12px" }}
                  onClick={() => setConfirmDel(emp)}
                  disabled={togglingId === emp.id}
                >
                  {togglingId === emp.id ? "..." : emp.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <AddEmployeeModal
          existing={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}

      {/* ── CONFIRM TOGGLE MODAL ── */}
      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal-box p-6" onClick={e => e.stopPropagation()} style={{ maxWidth: "380px" }}>
            <div className="flex flex-col items-center text-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: confirmDel.active ? "#fff0f0" : "#f0fdf4" }}
              >
                <span style={{ fontSize: "22px" }}>{confirmDel.active ? "⚠️" : "✅"}</span>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>
                {confirmDel.active ? "Deactivate" : "Activate"} {confirmDel.name}?
              </h3>
              <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6 }}>
                {confirmDel.active
                  ? "This employee will no longer appear in the visitor check-in form."
                  : "This employee will be available again in the visitor check-in form."}
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button className="btn btn-ghost flex-1 justify-center" onClick={() => setConfirmDel(null)}>
                  Cancel
                </button>
                <button
                  className={`btn flex-1 justify-center ${confirmDel.active ? "btn-danger" : "btn-primary"}`}
                  onClick={() => handleToggle(confirmDel)}
                >
                  {confirmDel.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
