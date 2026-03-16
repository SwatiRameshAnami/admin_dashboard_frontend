import { useState } from "react";

const DEPTS = ["Engineering", "HR & Admin", "Sales", "Finance", "Operations", "Marketing", "Legal", "IT"];
const AVATARS = ["👨‍💻","👩‍💼","👨‍💼","👩‍💻","👨‍🔧","👩‍🎨","👨‍🔬","👩‍🏫","👨‍💰","👩‍⚕️"];

const empty = { name: "", department: "", email: "", phone: "", avatar: "👨‍💻" };

export default function AddEmployeeModal({ onClose, onSave, existing }) {
  const [form, setForm] = useState(existing ? { ...existing } : { ...empty });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name       = "Name is required";
    if (!form.department)        e.department = "Select a department";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone))     e.phone = "10-digit number required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #f0f2f8" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#FF6829" }}>
              {existing ? "Edit Employee" : "Add New Employee"}
            </h2>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
              {existing ? "Update employee details" : "Fill in details to add to the team"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Avatar picker */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "8px" }}>
              Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => set("avatar", a)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                  style={{
                    border: form.avatar === a ? "2px solid #3D6BC0" : "2px solid #eef0f6",
                    background: form.avatar === a ? "#eef2fb" : "#fafbff",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <Field label="Full Name" error={errors.name}>
            <input className="form-input" placeholder="e.g. Rajesh Kumar" value={form.name} onChange={e => set("name", e.target.value)} />
          </Field>

          {/* Department */}
          <Field label="Department" error={errors.department}>
            <select className="form-input" value={form.department} onChange={e => set("department", e.target.value)}>
              <option value="">Select department</option>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>

          {/* Email */}
          <Field label="Email Address" error={errors.email}>
            <input className="form-input" type="email" placeholder="employee@company.com" value={form.email} onChange={e => set("email", e.target.value)} />
          </Field>

          {/* Phone */}
          <Field label="Phone Number" error={errors.phone}>
            <input className="form-input" type="tel" placeholder="10-digit mobile" maxLength={10}
              value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/, ""))} />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #f0f2f8" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : existing ? "Save Changes" : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: "11.5px", color: "#dc2626", marginTop: "4px" }}>{error}</p>}
    </div>
  );
}
