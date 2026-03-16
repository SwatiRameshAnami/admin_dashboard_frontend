import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

// ── Excel export using SheetJS CDN-style (pure JS, no import needed)
const exportToExcel = (data) => {
  // Build CSV as fallback (works without SheetJS)
  const headers = ["ID","Visitor Name","Phone","Email","Company","Purpose","Whom to Meet","Dept","Status","Check-In Date","Check-In Time","Check-Out Time"];
  const rows = data.map(v => [
    v.id, v.visitorName, v.phone, v.email || "—", v.company || "—",
    v.purpose, v.whomToMeet, v.employeeDept || "—", v.status,
    v.checkInDate, v.checkInTime, v.checkOutTime || "—",
  ]);

  const csvContent = [headers, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `visitors_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const PAGE_SIZE = 10;

export default function VisitorsPage() {
  const { token }    = useAuth();
  const [all,        setAll]        = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [statusFilter, setStatus]   = useState("ALL");
  const [fromDate,   setFromDate]   = useState("");
  const [toDate,     setToDate]     = useState("");
  const [page,       setPage]       = useState(1);
  const [selected,   setSelected]   = useState(null); // row detail modal

  const load = async () => {
    setLoading(true);
    try {
      let data;
      if (fromDate && toDate) {
        data = await api.getByRange(fromDate, toDate, token);
      } else {
        data = await api.getAll(token);
      }
      setAll(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return all.filter(v => {
      const matchSearch = !s ||
        v.visitorName?.toLowerCase().includes(s) ||
        v.phone?.includes(s) ||
        v.whomToMeet?.toLowerCase().includes(s) ||
        v.purpose?.toLowerCase().includes(s) ||
        v.company?.toLowerCase().includes(s);
      const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [all, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage  = () => setPage(1);

  return (
    <div className="flex flex-col gap-5">

      {/* ── FILTERS ROW ── */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              className="form-input"
              style={{ paddingLeft: "34px" }}
              placeholder="Search name, phone, host, purpose…"
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage(); }}
            />
          </div>

          {/* Status filter */}
          <select
            className="form-input"
            style={{ width: "140px" }}
            value={statusFilter}
            onChange={e => { setStatus(e.target.value); resetPage(); }}
          >
            <option value="ALL">All Status</option>
            <option value="WAITING">Waiting</option>
            <option value="EXITED">Exited</option>
          </select>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input
              type="date" className="form-input" style={{ width: "150px" }}
              value={fromDate} onChange={e => setFromDate(e.target.value)}
            />
            <span style={{ color: "#9ca3af", fontSize: "12px" }}>to</span>
            <input
              type="date" className="form-input" style={{ width: "150px" }}
              value={toDate} onChange={e => setToDate(e.target.value)}
            />
            <button className="btn btn-outline" style={{ padding: "8px 14px" }} onClick={load}>
              Apply
            </button>
            {(fromDate || toDate) && (
              <button className="btn btn-ghost" style={{ padding: "8px 12px" }}
                onClick={() => { setFromDate(""); setToDate(""); setTimeout(load, 0); }}>
                Clear
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span style={{ fontSize: "12.5px", color: "#9ca3af" }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
              className="btn btn-primary"
              style={{ padding: "8px 14px" }}
              onClick={() => exportToExcel(filtered)}
              disabled={filtered.length === 0}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "#f5f6fa" }} />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span style={{ fontSize: "40px" }}>🔍</span>
            <p style={{ fontSize: "14px", color: "#9ca3af" }}>No visitors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Visitor</th>
                  <th>Phone</th>
                  <th>Purpose</th>
                  <th>Whom to Meet</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((v, idx) => (
                  <tr
                    key={v.id}
                    onClick={() => setSelected(v)}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ color: "#c0c7d0", fontSize: "12px", fontFamily: "monospace" }}>
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: "#eef2fb", color: "#3D6BC0" }}
                        >
                          {v.visitorName?.[0]}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "13px" }}>{v.visitorName}</p>
                          {v.company && <p style={{ fontSize: "11.5px", color: "#9ca3af" }}>{v.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "12.5px" }}>{v.phone}</td>
                    <td style={{ color: "#4b5563", maxWidth: "140px" }}>
                      <span className="truncate block">{v.purpose}</span>
                    </td>
                    <td>
                      <p style={{ fontWeight: 500, fontSize: "13px" }}>{v.whomToMeet}</p>
                      <p style={{ fontSize: "11.5px", color: "#9ca3af" }}>{v.employeeDept}</p>
                    </td>
                    <td>
                      <p style={{ fontSize: "12.5px", fontFamily: "monospace" }}>{v.checkInTime}</p>
                      <p style={{ fontSize: "11px", color: "#9ca3af" }}>{v.checkInDate}</p>
                    </td>
                    <td style={{ fontSize: "12.5px", fontFamily: "monospace", color: v.checkOutTime ? "#374151" : "#d1d5db" }}>
                      {v.checkOutTime || "—"}
                    </td>
                    <td>
                      <span className={`badge ${v.status === "WAITING" ? "badge-waiting" : "badge-exited"}`}>
                        {v.status === "WAITING" ? "⏳ Waiting" : "✅ Exited"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid #f0f2f8" }}>
            <p style={{ fontSize: "12.5px", color: "#9ca3af" }}>
              Page {page} of {totalPages} · {filtered.length} total
            </p>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: "12px" }}
                onClick={() => setPage(p => p - 1)} disabled={page === 1}
              >← Prev</button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className="w-8 h-8 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: page === pg ? "#3D6BC0" : "transparent",
                      color: page === pg ? "white" : "#6b7280",
                      border: page === pg ? "none" : "1.5px solid #e5e7eb",
                    }}
                  >{pg}</button>
                );
              })}
              <button
                className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: "12px" }}
                onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
              >Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* ── ROW DETAIL MODAL ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #f0f2f8" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base"
                  style={{ background: "#eef2fb", color: "#3D6BC0" }}>
                  {selected.visitorName?.[0]}
                </div>
                <div>
                  <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>{selected.visitorName}</h2>
                  <span className={`badge ${selected.status === "WAITING" ? "badge-waiting" : "badge-exited"}`} style={{ marginTop: "2px" }}>
                    {selected.status === "WAITING" ? "⏳ Waiting" : "✅ Exited"}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {/* Details grid */}
            <div className="px-6 py-5 grid grid-cols-2 gap-3">
              {[
                ["Phone",       selected.phone],
                ["Email",       selected.email || "—"],
                ["Company",     selected.company || "—"],
                ["Purpose",     selected.purpose],
                ["Whom to Meet",selected.whomToMeet],
                ["Department",  selected.employeeDept || "—"],
                ["Check-In",    `${selected.checkInDate} ${selected.checkInTime}`],
                ["Check-Out",   selected.checkOutTime || "Not yet"],
              ].map(([label, val]) => (
                <div key={label} className="px-4 py-3 rounded-xl" style={{ background: "#f8f9fc", border: "1px solid #eef0f6" }}>
                  <p style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
                  <p style={{ fontSize: "13.5px", color: "#1a1a2e", fontWeight: 500, marginTop: "3px" }}>{val}</p>
                </div>
              ))}
            </div>
            {/* Visitor photo */}
            {selected.photoBase64 && (
              <div className="px-6 pb-5 text-center">
                <img src={selected.photoBase64} alt="Visitor"
                  className="w-20 h-20 rounded-xl object-cover mx-auto"
                  style={{ border: "2px solid #eef0f6" }} />
                <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>Visitor Photo</p>
              </div>
            )}
            <div className="px-6 pb-5 flex justify-end">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
