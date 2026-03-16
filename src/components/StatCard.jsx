export default function StatCard({ label, value, sub, icon, color = "#3D6BC0", loading }) {
  return (
    <div className="card p-5 animate-fade-slide" style={{ opacity: 0 }}>
      <div className="flex items-start justify-between mb-3">
        <p style={{ fontSize: "12px", fontWeight: 600, color: "#8a94a6", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-16 rounded-lg animate-pulse" style={{ background: "#f0f2f8" }} />
      ) : (
        <p style={{ fontSize: "28px", fontWeight: 800, color: "#1a1a2e", lineHeight: 1 }}>
          {value}
        </p>
      )}
      {sub && (
        <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>{sub}</p>
      )}
    </div>
  );
}
