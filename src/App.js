import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://bcbrxewxdvibbfsuzsef.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYnJ4ZXd4ZHZpYmJmc3V6c2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODA2MzQsImV4cCI6MjA5MDA1NjYzNH0.Bx9Q7y7bh44KwwW-al0jotJeRW8u1KBWNM0CJRVkK9w"
);

const STATUS = {
  pending: { label: "Pending", color: "#b45309", bg: "#fff7ed" },
  in_progress: { label: "In Progress", color: "#1d4ed8", bg: "#eff6ff" },
  fixed: { label: "Fixed", color: "#166534", bg: "#f0fdf4" },
  returned: { label: "Returned", color: "#6d28d9", bg: "#f5f3ff" },
  cannot_repair: { label: "Cannot Repair", color: "#b91c1c", bg: "#fef2f2" },
};

const PRIORITY = {
  low: { label: "Low", color: "#475569", bg: "#f8fafc" },
  medium: { label: "Medium", color: "#1d4ed8", bg: "#eff6ff" },
  high: { label: "High", color: "#b45309", bg: "#fff7ed" },
  urgent: { label: "Urgent", color: "#b91c1c", bg: "#fef2f2" },
};

const EMPTY_FORM = {
  ticket_no: "",
  owner: "",
  department: "",
  device_type: "",
  brand: "",
  model: "",
  serial_no: "",
  asset_tag: "",
  issue: "",
  priority: "medium",
  status: "pending",
  technician: "Unassigned",
  date_in: new Date().toISOString().split("T")[0],
  date_out: "",
  cost: "",
  warranty: false,
  notes: "",
};

const styles = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Segoe UI", Tahoma, Arial, sans-serif;
    background: #f3f6fb;
    color: #1f2937;
  }

  .app {
    min-height: 100vh;
    background: linear-gradient(180deg, #eaf1fb 0%, #f7f9fc 220px, #f3f6fb 220px);
  }

  .container {
    max-width: 1480px;
    margin: 0 auto;
    padding: 24px;
  }

  .hero {
    background: linear-gradient(135deg, #0f2d52 0%, #163f72 60%, #1e4f8d 100%);
    color: #fff;
    border-radius: 18px;
    padding: 24px 28px;
    box-shadow: 0 16px 36px rgba(15, 45, 82, 0.18);
    margin-bottom: 22px;
  }

  .hero-top {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    flex-wrap: wrap;
    align-items: center;
  }

  .brand-wrap {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .crest {
    width: 58px;
    height: 58px;
    border-radius: 14px;
    background: rgba(255,255,255,0.14);
    border: 1px solid rgba(255,255,255,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
  }

  .brand-title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
  }

  .brand-subtitle {
    margin: 6px 0 0 0;
    font-size: 14px;
    color: rgba(255,255,255,0.82);
  }

  .hero-right {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }

  .hero-note {
    padding: 10px 14px;
    background: rgba(255,255,255,0.10);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 12px;
    font-size: 13px;
    color: rgba(255,255,255,0.90);
  }

  .summary-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
  }

  .summary-card {
    background: #fff;
    border: 1px solid #dce6f3;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  }

  .summary-label {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .summary-value {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 6px;
  }

  .summary-foot {
    font-size: 12px;
    font-weight: 600;
  }

  .panel {
    background: #fff;
    border: 1px solid #dce6f3;
    border-radius: 18px;
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
  }

  .toolbar {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 18px;
    border-bottom: 1px solid #e5edf7;
  }

  .toolbar-left {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
    flex: 1;
  }

  .search-box {
    position: relative;
    min-width: 300px;
    flex: 1;
  }

  .search-box input {
    width: 100%;
    height: 44px;
    border: 1px solid #cfdbea;
    border-radius: 12px;
    padding: 0 14px 0 42px;
    font-size: 14px;
    outline: none;
    background: #fff;
  }

  .search-box input:focus,
  .select:focus,
  .field input:focus,
  .field select:focus,
  .field textarea:focus,
  .login-card input:focus {
    border-color: #1d4ed8;
    box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.10);
  }

  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-size: 14px;
  }

  .select {
    height: 44px;
    border: 1px solid #cfdbea;
    border-radius: 12px;
    padding: 0 14px;
    font-size: 14px;
    outline: none;
    background: #fff;
    color: #1f2937;
  }

  .btn {
    border: none;
    border-radius: 12px;
    padding: 11px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.18s ease;
  }

  .btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #0f4c81;
    color: #fff;
  }

  .btn-primary:hover:not(:disabled) { background: #0b3d68; }

  .btn-light {
    background: #fff;
    color: #1e293b;
    border: 1px solid #d1d9e6;
  }

  .btn-light:hover:not(:disabled) { background: #f8fafc; }

  .btn-danger {
    background: #fff1f2;
    color: #b91c1c;
    border: 1px solid #fecdd3;
  }

  .btn-danger:hover:not(:disabled) { background: #ffe4e6; }

  .btn-edit {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
  }

  .btn-edit:hover:not(:disabled) { background: #dbeafe; }

  .btn-sm {
    padding: 8px 12px;
    font-size: 12px;
  }

  .message {
    margin: 16px 18px 0;
    padding: 12px 14px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
  }

  .message.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
  }

  .message.success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }

  .message.loading {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1d4ed8;
  }

  .table-wrap {
    overflow: auto;
    padding: 0 0 4px;
  }

  table {
    width: 100%;
    min-width: 1750px;
    border-collapse: separate;
    border-spacing: 0;
  }

  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f8fbff;
    color: #334155;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-weight: 700;
    text-align: left;
    padding: 14px;
    border-bottom: 1px solid #e5edf7;
  }

  tbody td {
    padding: 14px;
    border-bottom: 1px solid #eef3f9;
    font-size: 14px;
    vertical-align: top;
  }

  tbody tr:hover {
    background: #fafcff;
  }

  .mono {
    font-family: Consolas, "Courier New", monospace;
    font-size: 12px;
    color: #1d4ed8;
  }

  .muted {
    color: #64748b;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  .badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: currentColor;
    opacity: 0.85;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .footer-meta {
    padding: 14px 18px 18px;
    color: #64748b;
    font-size: 13px;
    text-align: right;
  }

  .empty-state {
    padding: 56px 24px;
    text-align: center;
    color: #64748b;
    font-size: 15px;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 50;
  }

  .modal {
    width: min(1040px, 100%);
    max-height: 94vh;
    overflow: auto;
    background: #fff;
    border-radius: 20px;
    border: 1px solid #dce6f3;
    box-shadow: 0 24px 50px rgba(15, 23, 42, 0.20);
  }

  .modal-header {
    padding: 18px 22px;
    border-bottom: 1px solid #e5edf7;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
  }

  .modal-title {
    margin: 0;
    font-size: 20px;
    color: #0f172a;
  }

  .modal-subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: #64748b;
  }

  .close-btn {
    border: none;
    background: #f8fafc;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    font-size: 18px;
    cursor: pointer;
    color: #475569;
  }

  .modal-body {
    padding: 22px;
  }

  .section-title {
    margin: 0 0 14px;
    color: #0f172a;
    font-size: 15px;
    font-weight: 700;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .form-full {
    grid-column: 1 / -1;
  }

  .field label {
    display: block;
    margin-bottom: 7px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }

  .field input,
  .field select,
  .field textarea {
    width: 100%;
    border: 1px solid #cfdbea;
    border-radius: 12px;
    background: #fff;
    color: #1f2937;
    padding: 11px 12px;
    font-size: 14px;
    outline: none;
  }

  .field textarea {
    min-height: 96px;
    resize: vertical;
  }

  .checkbox-box {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding-top: 28px;
  }

  .checkbox-box input {
    width: 18px;
    height: 18px;
    accent-color: #0f4c81;
  }

  .modal-footer {
    padding: 18px 22px 22px;
    border-top: 1px solid #e5edf7;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    background: #fff;
  }

  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eaf1fb 0%, #f6f8fb 100%);
    padding: 24px;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    background: #fff;
    border: 1px solid #dce6f3;
    border-radius: 20px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.10);
    padding: 28px;
  }

  .login-card h1 {
    margin: 0 0 8px;
    font-size: 28px;
    color: #0f2d52;
  }

  .login-card p {
    margin: 0 0 20px;
    color: #64748b;
    font-size: 14px;
  }

  .login-card input {
    width: 100%;
    border: 1px solid #cfdbea;
    border-radius: 12px;
    background: #fff;
    color: #1f2937;
    padding: 12px;
    font-size: 14px;
    outline: none;
    margin-bottom: 12px;
  }

  .role-chip {
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.18);
    color: #fff;
  }

  @media (max-width: 1100px) {
    .summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .container { padding: 16px; }
    .summary-grid { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
    .brand-title { font-size: 23px; }
    .search-box { min-width: 100%; }
    .toolbar { align-items: stretch; }
    .toolbar-left { width: 100%; }
  }
`;

function makeRecordNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REC-${y}${m}${d}-${rand}`;
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <style>{styles}</style>
      <div className="login-card">
        <h1>IT Repair Record</h1>
        <p>Sign in to access the secure internal record system.</p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="btn btn-primary"
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {errorMessage && (
          <div className="message error" style={{ margin: "14px 0 0" }}>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, ticket_no: makeRecordNo() });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error) {
      setProfile(data);
    } else {
      setProfile(null);
    }
  };

  const loadData = useCallback(async () => {
  setLoading(true);
  clearMessages();

  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    setErrorMessage(error.message);
    setRecords([]);
  } else {
    setRecords(data || []);
  }

  setLoading(false);
}, []);

  useEffect(() => {
  if (session) {
    loadProfile();
    loadData();
  } else {
    setProfile(null);
    setRecords([]);
    setLoading(false);
  }
}, [session, loadData]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase();
      const match =
        !q ||
        [
          r.ticket_no,
          r.owner,
          r.department,
          r.device_type,
          r.brand,
          r.model,
          r.serial_no,
          r.asset_tag,
          r.issue,
          r.priority,
          r.status,
          r.technician,
          r.notes,
        ].some((f) => String(f || "").toLowerCase().includes(q));

      const statusMatch = filterStatus === "all" || r.status === filterStatus;
      return match && statusMatch;
    });
  }, [records, search, filterStatus]);

  const counts = useMemo(() => {
    return Object.fromEntries(
      Object.keys(STATUS).map((k) => [
        k,
        records.filter((r) => r.status === k).length,
      ])
    );
  }, [records]);

  const totalCount = records.length;
  const isAdmin = profile?.role === "admin";

  const openAdd = () => {
    clearMessages();
    setEditing(null);
    setForm({ ...EMPTY_FORM, ticket_no: makeRecordNo() });
    setShowModal(true);
  };

  const openEdit = (r) => {
    clearMessages();
    setEditing(r.id);
    setForm({
      ticket_no: r.ticket_no || "",
      owner: r.owner || "",
      department: r.department || "",
      device_type: r.device_type || "",
      brand: r.brand || "",
      model: r.model || "",
      serial_no: r.serial_no || "",
      asset_tag: r.asset_tag || "",
      issue: r.issue || "",
      priority: r.priority || "medium",
      status: r.status || "pending",
      technician: r.technician || "Unassigned",
      date_in: r.date_in || "",
      date_out: r.date_out || "",
      cost: r.cost ?? "",
      warranty: !!r.warranty,
      notes: r.notes || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) setShowModal(false);
  };

  const handleSave = async () => {
    clearMessages();

    if (!form.ticket_no || !form.owner || !form.brand || !form.model || !form.issue) {
      setErrorMessage("Please fill in Record No, Owner, Brand, Model, and Issue.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      ticket_no: form.ticket_no.trim(),
      owner: form.owner.trim(),
      department: form.department ? form.department.trim() : null,
      device_type: form.device_type ? form.device_type.trim() : null,
      brand: form.brand.trim(),
      model: form.model.trim(),
      serial_no: form.serial_no ? form.serial_no.trim() : null,
      asset_tag: form.asset_tag ? form.asset_tag.trim() : null,
      issue: form.issue.trim(),
      priority: form.priority || "medium",
      status: form.status || "pending",
      technician: form.technician ? form.technician.trim() : "Unassigned",
      date_in: form.date_in || null,
      date_out: form.date_out || null,
      cost: form.cost === "" ? null : Number(form.cost),
      warranty: !!form.warranty,
      notes: form.notes ? form.notes.trim() : null,
    };

    if (!editing) {
      payload.created_by = user?.id ?? null;
    }

    if (editing) {
      const { error } = await supabase
        .from("tickets")
        .update(payload)
        .eq("id", editing);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setSuccessMessage("Record updated successfully.");
    } else {
      const { error } = await supabase
        .from("tickets")
        .insert([payload]);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setSuccessMessage("Record added successfully.");
    }

    await loadData();
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    clearMessages();

    const ok = window.confirm("Delete this record?");
    if (!ok) return;

    const { error } = await supabase
      .from("tickets")
      .delete()
      .eq("id", id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Record deleted successfully.");
    await loadData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const f = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <>
      <style>{styles}</style>

      <div className="app">
        <div className="container">
          <div className="hero">
            <div className="hero-top">
              <div className="brand-wrap">
                <div className="crest">🛠️</div>
                <div>
                  <h1 className="brand-title">IT Repair Record</h1>
                  <p className="brand-subtitle">
                    Official internal record system for tracking IT repair activities
                  </p>
                </div>
              </div>

              <div className="hero-right">
                <div className="hero-note">
                  {profile?.full_name || session.user?.email}
                </div>
                <div className="role-chip">
                  {profile?.role || "user"}
                </div>
                <button className="btn btn-light" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>

            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-label">Total Records</div>
                <div className="summary-value">{totalCount}</div>
                <div className="summary-foot" style={{ color: "#0f4c81" }}>
                  All registered repair records
                </div>
              </div>

              {Object.entries(STATUS).map(([k, v]) => (
                <div className="summary-card" key={k}>
                  <div className="summary-label">{v.label}</div>
                  <div className="summary-value">{counts[k] || 0}</div>
                  <div className="summary-foot" style={{ color: v.color }}>
                    Current status count
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            {loading && <div className="message loading">Loading records from database...</div>}
            {errorMessage && <div className="message error">Error: {errorMessage}</div>}
            {successMessage && <div className="message success">{successMessage}</div>}

            <div className="toolbar">
              <div className="toolbar-left">
                <div className="search-box">
                  <span className="search-icon">⌕</span>
                  <input
                    placeholder="Search record no, owner, department, device, serial, issue..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <select
                  className="select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  {Object.entries(STATUS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary" onClick={openAdd}>
                + New Record
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Record No</th>
                    <th>Owner</th>
                    <th>Department</th>
                    <th>Device Type</th>
                    <th>Brand / Model</th>
                    <th>Serial No</th>
                    <th>Asset Tag</th>
                    <th>Issue</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Technician</th>
                    <th>Date In</th>
                    <th>Date Out</th>
                    <th>Cost</th>
                    <th>Warranty</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {!loading && filtered.length === 0 ? (
                    <tr>
                      <td colSpan={17}>
                        <div className="empty-state">No records found.</div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const s = STATUS[r.status] || STATUS.pending;
                      const p = PRIORITY[r.priority] || PRIORITY.medium;

                      return (
                        <tr key={r.id}>
                          <td className="mono">{r.ticket_no}</td>
                          <td><strong>{r.owner}</strong></td>
                          <td>{r.department || "—"}</td>
                          <td>{r.device_type || "—"}</td>
                          <td>{r.brand} <span className="muted">{r.model}</span></td>
                          <td className="mono">{r.serial_no || "—"}</td>
                          <td className="mono">{r.asset_tag || "—"}</td>
                          <td className="muted" style={{ maxWidth: 240 }}>{r.issue}</td>
                          <td>
                            <span className="badge" style={{ color: p.color, background: p.bg }}>
                              <span className="badge-dot"></span>{p.label}
                            </span>
                          </td>
                          <td>
                            <span className="badge" style={{ color: s.color, background: s.bg }}>
                              <span className="badge-dot"></span>{s.label}
                            </span>
                          </td>
                          <td>{r.technician || "Unassigned"}</td>
                          <td>{r.date_in || "—"}</td>
                          <td>{r.date_out || "—"}</td>
                          <td>{r.cost !== null && r.cost !== undefined ? `$${r.cost}` : "—"}</td>
                          <td>{r.warranty ? "Yes" : "No"}</td>
                          <td className="muted" style={{ maxWidth: 220 }}>{r.notes || "—"}</td>
                          <td>
                            <div className="actions">
                              <button className="btn btn-edit btn-sm" onClick={() => openEdit(r)}>
                                Edit
                              </button>
                              {isAdmin && (
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="footer-meta">
              {filtered.length} / {records.length} records displayed
            </div>
          </div>
        </div>

        {showModal && (
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">{editing ? "Edit Record" : "New Record"}</h2>
                  <p className="modal-subtitle">Fill in the repair record information below.</p>
                </div>
                <button className="close-btn" onClick={closeModal}>✕</button>
              </div>

              <div className="modal-body">
                <h3 className="section-title">Record Information</h3>

                <div className="form-grid">
                  <div className="field">
                    <label>Record No *</label>
                    <input
                      value={form.ticket_no}
                      onChange={f("ticket_no")}
                      placeholder="REC-20260326-1234"
                    />
                  </div>

                  <div className="field">
                    <label>Owner *</label>
                    <input
                      value={form.owner}
                      onChange={f("owner")}
                      placeholder="Owner name"
                    />
                  </div>

                  <div className="field">
                    <label>Department</label>
                    <input
                      value={form.department}
                      onChange={f("department")}
                      placeholder="Department"
                    />
                  </div>

                  <div className="field">
                    <label>Device Type</label>
                    <input
                      value={form.device_type}
                      onChange={f("device_type")}
                      placeholder="Laptop, Printer, Desktop..."
                    />
                  </div>

                  <div className="field">
                    <label>Brand *</label>
                    <input
                      value={form.brand}
                      onChange={f("brand")}
                      placeholder="Dell, HP, Lenovo..."
                    />
                  </div>

                  <div className="field">
                    <label>Model *</label>
                    <input
                      value={form.model}
                      onChange={f("model")}
                      placeholder="Model name"
                    />
                  </div>

                  <div className="field">
                    <label>Serial No</label>
                    <input
                      value={form.serial_no}
                      onChange={f("serial_no")}
                      placeholder="Serial number"
                    />
                  </div>

                  <div className="field">
                    <label>Asset Tag</label>
                    <input
                      value={form.asset_tag}
                      onChange={f("asset_tag")}
                      placeholder="Asset tag"
                    />
                  </div>

                  <div className="field">
                    <label>Priority</label>
                    <select value={form.priority} onChange={f("priority")}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Status</label>
                    <select value={form.status} onChange={f("status")}>
                      {Object.entries(STATUS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Technician</label>
                    <input
                      value={form.technician}
                      onChange={f("technician")}
                      placeholder="Technician name"
                    />
                  </div>

                  <div className="field">
                    <label>Cost ($)</label>
                    <input
                      type="number"
                      value={form.cost}
                      onChange={f("cost")}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="field">
                    <label>Date In</label>
                    <input type="date" value={form.date_in} onChange={f("date_in")} />
                  </div>

                  <div className="field">
                    <label>Date Out</label>
                    <input type="date" value={form.date_out} onChange={f("date_out")} />
                  </div>

                  <div className="field form-full">
                    <label>Issue *</label>
                    <textarea
                      value={form.issue}
                      onChange={f("issue")}
                      placeholder="Describe the issue"
                    />
                  </div>

                  <div className="field form-full">
                    <label>Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={f("notes")}
                      placeholder="Repair notes"
                    />
                  </div>

                  <div className="field form-full">
                    <div className="checkbox-box">
                      <input
                        id="warranty"
                        type="checkbox"
                        checked={form.warranty}
                        onChange={f("warranty")}
                      />
                      <label htmlFor="warranty" style={{ margin: 0 }}>Under Warranty</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-light" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Record"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}