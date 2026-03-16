import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import StatCard from "../components/StatCard";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Generate mock weekly chart data
const mockWeekData = () =>
  WEEK_DAYS.map(day => ({
    day,
    visitors: Math.floor(Math.random() * 12) + 2,
  }));

export default function DashboardPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [stats,    setStats]    = useState(null);
  const [waiting,  setWaiting]  = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const loadData = async () => {
    try {
      const [s, w] = await Promise.all([
        api.getStats(token),
        api.getWaiting(token),
      ]);
      setStats(s);
      setWaiting(w);
      setWeekData(mockWeekData());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(loadData, 30000);
    return () => clearInterval(t);
  }, []);

  const handleCheckout = async (id) => {
    await api.checkOut(id, token);
    setWaiting(prev => prev.filter(v => v.id !== id));
    setStats(prev => prev ? {
      ...prev,
      currentlyWaiting: prev.currentlyWaiting - 1,
      exitedToday: prev.exitedToday + 1,
    } : prev);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-4 gap-4 stagger">
        <StatCard
          label="Currently Waiting"
          value={stats?.currentlyWaiting ?? "—"}
          sub="At reception right now"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>}
          color="#FF6829"
          loading={loading}
        />
        <StatCard
          label="Total Today"
          value={stats?.totalToday ?? "—"}
          sub="Visitors checked in today"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          color="#3D6BC0"
          loading={loading}
        />
        <StatCard
          label="Exited Today"
          value={stats?.exitedToday ?? "—"}
          sub="Completed visits"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
          color="#16a34a"
          loading={loading}
        />
        <StatCard
          label="All Time"
          value={stats?.totalAll ?? "—"}
          sub="Total visitors ever"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
          color="#7c3aed"
          loading={loading}
        />
      </div>

      {/* ── BOTTOM ROW: Waiting list + Chart ── */}
      <div className="grid grid-cols-5 gap-5">

        {/* Live waiting list */}
        <div className="col-span-3 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #f0f2f8" }}>
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e" }}>Currently Waiting</h2>
              {waiting.length > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: "#fff4ef", color: "#FF6829" }}
                >
                  {waiting.length}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate("/visitors")}
              style={{ fontSize: "12.5px", color: "#3D6BC0", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
            >
              View all →
            </button>
          </div>

          {loading ? (
            <div className="p-5 flex flex-col gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "#f5f6fa" }} />
              ))}
            </div>
          ) : waiting.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <span style={{ fontSize: "36px" }}>🪑</span>
              <p style={{ fontSize: "13.5px", color: "#9ca3af", fontWeight: 500 }}>No visitors waiting right now</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Visitor</th>
                    <th>Purpose</th>
                    <th>Meeting</th>
                    <th>Check-In</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {waiting.map(v => (
                    <tr key={v.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: "#eef2fb", color: "#3D6BC0" }}
                          >
                            {v.visitorName[0]}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "13px" }}>{v.visitorName}</p>
                            <p style={{ fontSize: "11.5px", color: "#9ca3af" }}>{v.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "#6b7280" }}>{v.purpose}</td>
                      <td>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 500 }}>{v.whomToMeet}</p>
                          <p style={{ fontSize: "11.5px", color: "#9ca3af" }}>{v.employeeDept}</p>
                        </div>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "12.5px", color: "#6b7280" }}>{v.checkInTime}</td>
                      <td>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: "5px 12px", fontSize: "12px" }}
                          onClick={() => handleCheckout(v.id)}
                        >
                          Exit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Weekly chart */}
        <div className="col-span-2 card px-5 py-5">
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e", marginBottom: "4px" }}>
            This Week
          </h2>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "20px" }}>Daily visitor count</p>

          {loading ? (
            <div className="h-40 rounded-xl animate-pulse" style={{ background: "#f5f6fa" }} />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Plus Jakarta Sans" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Plus Jakarta Sans" }}
                  axisLine={false} tickLine={false} width={25}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff", border: "1px solid #eef0f6",
                    borderRadius: "10px", fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontFamily: "Plus Jakarta Sans",
                  }}
                  cursor={{ fill: "#f5f7ff" }}
                />
                <Bar
                  dataKey="visitors"
                  fill="#3D6BC0"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Quick legend */}
          <div className="flex items-center gap-2 mt-3">
            <div className="w-3 h-3 rounded-sm" style={{ background: "#3D6BC0" }} />
            <span style={{ fontSize: "11.5px", color: "#9ca3af" }}>Visitors per day</span>
          </div>
        </div>

      </div>
    </div>
  );
}
