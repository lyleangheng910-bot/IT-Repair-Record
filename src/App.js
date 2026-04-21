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
  device_type: "Laptop",
  brand: "Dell",
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

const REPORT_FILTERS_DEFAULT = {
  startDate: "",
  endDate: "",
  status: "all",
  priority: "all",
  department: "all",
  technician: "all",
  deviceType: "all",
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

  .tabs {
    display: flex;
    gap: 10px;
    padding: 18px 18px 0;
    flex-wrap: wrap;
  }

  .tab-btn {
    border: 1px solid #d1d9e6;
    background: #fff;
    color: #334155;
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .tab-btn.active {
    background: #0f4c81;
    color: #fff;
    border-color: #0f4c81;
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

  .form-grid,
  .report-filter-grid,
  .report-card-grid,
  .analytics-grid {
    display: grid;
    gap: 16px;
  }

  .form-grid,
  .report-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .report-card-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding: 18px;
  }

  .analytics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 0 18px 18px;
  }

  .analytics-card,
  .report-summary-card {
    background: #fff;
    border: 1px solid #dce6f3;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  }

  .report-summary-card .summary-value {
    font-size: 24px;
  }

  .report-filters-wrap {
    padding: 18px;
    border-bottom: 1px solid #e5edf7;
  }

  .report-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
  }

  .list-stat {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px dashed #e5edf7;
    font-size: 14px;
  }

  .list-stat:last-child {
    border-bottom: none;
  }

  .field-full {
    grid-column: 1 / -1;
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

  @media print {
    body {
      background: #fff;
    }
    .hero-right,
    .tabs,
    .toolbar,
    .report-actions,
    .footer-meta,
    .modal-overlay {
      display: none !important;
    }
    .app, .panel, .summary-card, .report-summary-card, .analytics-card {
      box-shadow: none !important;
      border-color: #d1d5db !important;
    }
    .container {
      max-width: 100%;
      padding: 0;
    }
  }

  @media (max-width: 1100px) {
    .summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .report-card-grid,
    .analytics-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .container { padding: 16px; }
    .summary-grid,
    .report-card-grid,
    .analytics-grid { grid-template-columns: 1fr; }
    .form-grid,
    .report-filter-grid { grid-template-columns: 1fr; }
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

function formatMoney(value) {
  const num = Number(value || 0);
  return `$${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function downloadCsv(filename, rows) {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell ?? "");
          const escaped = text.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function groupCount(items, getter) {
  const map = new Map();
  items.forEach((item) => {
    const key = getter(item) || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
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

function StatList({ title, items, emptyText = "No data" }) {
  return (
    <div className="analytics-card">
      <h3 className="section-title">{title}</h3>
      {items.length === 0 ? (
        <div className="muted">{emptyText}</div>
      ) : (
        items.slice(0, 10).map((item) => (
          <div className="list-stat" key={item.name}>
            <span>{item.name}</span>
            <strong>{item.count}</strong>
          </div>
        ))
      )}
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
  const [activeTab, setActiveTab] = useState("records");
  const [reportFilters, setReportFilters] = useState(REPORT_FILTERS_DEFAULT);

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

  const reportFiltered = useMemo(() => {
    return records.filter((r) => {
      const inDate = r.date_in || "";
      if (reportFilters.startDate && (!inDate || inDate < reportFilters.startDate)) {
        return false;
      }
      if (reportFilters.endDate && (!inDate || inDate > reportFilters.endDate)) {
        return false;
      }
      if (reportFilters.status !== "all" && r.status !== reportFilters.status) {
        return false;
      }
      if (reportFilters.priority !== "all" && r.priority !== reportFilters.priority) {
        return false;
      }
      if (
        reportFilters.department !== "all" &&
        (r.department || "Unknown") !== reportFilters.department
      ) {
        return false;
      }
      if (
        reportFilters.technician !== "all" &&
        (r.technician || "Unassigned") !== reportFilters.technician
      ) {
        return false;
      }
      if (
        reportFilters.deviceType !== "all" &&
        (r.device_type || "Unknown") !== reportFilters.deviceType
      ) {
        return false;
      }
      return true;
    });
  }, [records, reportFilters]);

  const reportStats = useMemo(() => {
    const total = reportFiltered.length;
    const fixed = reportFiltered.filter((r) => r.status === "fixed").length;
    const returned = reportFiltered.filter((r) => r.status === "returned").length;
    const pending = reportFiltered.filter((r) => r.status === "pending").length;
    const inProgress = reportFiltered.filter((r) => r.status === "in_progress").length;
    const cannotRepair = reportFiltered.filter((r) => r.status === "cannot_repair").length;
    const warrantyCount = reportFiltered.filter((r) => !!r.warranty).length;
    const totalCost = reportFiltered.reduce((sum, r) => sum + Number(r.cost || 0), 0);
    const avgCost = total ? totalCost / total : 0;
    const completionRate = total ? ((fixed + returned) / total) * 100 : 0;

    return {
      total,
      fixed,
      returned,
      pending,
      inProgress,
      cannotRepair,
      warrantyCount,
      totalCost,
      avgCost,
      completionRate,
    };
  }, [reportFiltered]);

  const departmentStats = useMemo(
    () => groupCount(reportFiltered, (r) => r.department || "Unknown"),
    [reportFiltered]
  );
  const technicianStats = useMemo(
    () => groupCount(reportFiltered, (r) => r.technician || "Unassigned"),
    [reportFiltered]
  );
  const deviceTypeStats = useMemo(
    () => groupCount(reportFiltered, (r) => r.device_type || "Unknown"),
    [reportFiltered]
  );
  const issueStats = useMemo(
    () => groupCount(reportFiltered, (r) => r.issue || "Unknown"),
    [reportFiltered]
  );
  const brandModelStats = useMemo(
    () =>
      groupCount(
        reportFiltered,
        (r) => `${r.brand || "Unknown"}${r.model ? ` / ${r.model}` : ""}`
      ),
    [reportFiltered]
  );

  const departmentOptions = useMemo(
    () => ["all", ...new Set(records.map((r) => r.department || "Unknown"))],
    [records]
  );
  const technicianOptions = useMemo(
    () => ["all", ...new Set(records.map((r) => r.technician || "Unassigned"))],
    [records]
  );
  const deviceTypeOptions = useMemo(
    () => ["all", ...new Set(records.map((r) => r.device_type || "Unknown"))],
    [records]
  );

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
      device_type: r.device_type || "Laptop",
      brand: r.brand || "Dell",
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
      const { error } = await supabase.from("tickets").update(payload).eq("id", editing);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setSuccessMessage("Record updated successfully.");
    } else {
      const { error } = await supabase.from("tickets").insert([payload]);

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

    const { error } = await supabase.from("tickets").delete().eq("id", id);

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

  const rf = (key) => (e) => {
    const value = e.target.value;
    setReportFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetReportFilters = () => {
    setReportFilters(REPORT_FILTERS_DEFAULT);
  };

  const exportReportCsv = () => {
    const header = [
      "Record No",
      "Owner",
      "Department",
      "Device Type",
      "Brand",
      "Model",
      "Serial No",
      "Asset Tag",
      "Issue",
      "Priority",
      "Status",
      "Technician",
      "Date In",
      "Date Out",
      "Cost",
      "Warranty",
      "Notes",
    ];

    const rows = reportFiltered.map((r) => [
      r.ticket_no,
      r.owner,
      r.department,
      r.device_type,
      r.brand,
      r.model,
      r.serial_no,
      r.asset_tag,
      r.issue,
      PRIORITY[r.priority]?.label || r.priority,
      STATUS[r.status]?.label || r.status,
      r.technician,
      r.date_in,
      r.date_out,
      r.cost,
      r.warranty ? "Yes" : "No",
      r.notes,
    ]);

    downloadCsv(`it-repair-report-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows]);
  };

  const printReport = () => {
    window.print();
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
                <div className="hero-note">{profile?.full_name || session.user?.email}</div>
                <div className="role-chip">{profile?.role || "user"}</div>
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

            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === "records" ? "active" : ""}`}
                onClick={() => setActiveTab("records")}
              >
                Records
              </button>
              <button
                className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
                onClick={() => setActiveTab("reports")}
              >
                Reports & Analytics
              </button>
            </div>

            {activeTab === "records" ? (
              <>
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
                        <option key={k} value={k}>
                          {v.label}
                        </option>
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
                              <td>
                                <strong>{r.owner}</strong>
                              </td>
                              <td>{r.department || "—"}</td>
                              <td>{r.device_type || "—"}</td>
                              <td>
                                {r.brand} <span className="muted">{r.model}</span>
                              </td>
                              <td className="mono">{r.serial_no || "—"}</td>
                              <td className="mono">{r.asset_tag || "—"}</td>
                              <td className="muted" style={{ maxWidth: 240 }}>
                                {r.issue}
                              </td>
                              <td>
                                <span className="badge" style={{ color: p.color, background: p.bg }}>
                                  <span className="badge-dot"></span>
                                  {p.label}
                                </span>
                              </td>
                              <td>
                                <span className="badge" style={{ color: s.color, background: s.bg }}>
                                  <span className="badge-dot"></span>
                                  {s.label}
                                </span>
                              </td>
                              <td>{r.technician || "Unassigned"}</td>
                              <td>{r.date_in || "—"}</td>
                              <td>{r.date_out || "—"}</td>
                              <td>
                                {r.cost !== null && r.cost !== undefined ? formatMoney(r.cost) : "—"}
                              </td>
                              <td>{r.warranty ? "Yes" : "No"}</td>
                              <td className="muted" style={{ maxWidth: 220 }}>
                                {r.notes || "—"}
                              </td>
                              <td>
                                <div className="actions">
                                  <button className="btn btn-edit btn-sm" onClick={() => openEdit(r)}>
                                    Edit
                                  </button>
                                  {isAdmin && (
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleDelete(r.id)}
                                    >
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
              </>
            ) : (
              <>
                <div className="report-filters-wrap">
                  <h3 className="section-title">Report Filters</h3>
                  <div className="report-filter-grid">
                    <div className="field">
                      <label>Start Date</label>
                      <input type="date" value={reportFilters.startDate} onChange={rf("startDate")} />
                    </div>
                    <div className="field">
                      <label>End Date</label>
                      <input type="date" value={reportFilters.endDate} onChange={rf("endDate")} />
                    </div>
                    <div className="field">
                      <label>Status</label>
                      <select value={reportFilters.status} onChange={rf("status")}>
                        <option value="all">All Status</option>
                        {Object.entries(STATUS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Priority</label>
                      <select value={reportFilters.priority} onChange={rf("priority")}>
                        <option value="all">All Priority</option>
                        {Object.entries(PRIORITY).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Department</label>
                      <select value={reportFilters.department} onChange={rf("department")}>
                        {departmentOptions.map((item) => (
                          <option key={item} value={item}>
                            {item === "all" ? "All Departments" : item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Technician</label>
                      <select value={reportFilters.technician} onChange={rf("technician")}>
                        {technicianOptions.map((item) => (
                          <option key={item} value={item}>
                            {item === "all" ? "All Technicians" : item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field field-full">
                      <label>Device Type</label>
                      <select value={reportFilters.deviceType} onChange={rf("deviceType")}>
                        {deviceTypeOptions.map((item) => (
                          <option key={item} value={item}>
                            {item === "all" ? "All Device Types" : item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="report-actions">
                    <button className="btn btn-light" onClick={resetReportFilters}>
                      Reset Filters
                    </button>
                    <button className="btn btn-primary" onClick={exportReportCsv}>
                      Export CSV
                    </button>
                    <button className="btn btn-light" onClick={printReport}>
                      Print Report
                    </button>
                  </div>
                </div>

                <div className="report-card-grid">
                  <div className="report-summary-card">
                    <div className="summary-label">Total Records</div>
                    <div className="summary-value">{reportStats.total}</div>
                    <div className="summary-foot muted">Records in report result</div>
                  </div>
                  <div className="report-summary-card">
                    <div className="summary-label">Completion Rate</div>
                    <div className="summary-value">{reportStats.completionRate.toFixed(1)}%</div>
                    <div className="summary-foot muted">Fixed + Returned</div>
                  </div>
                  <div className="report-summary-card">
                    <div className="summary-label">Total Cost</div>
                    <div className="summary-value">{formatMoney(reportStats.totalCost)}</div>
                    <div className="summary-foot muted">Total repair spending</div>
                  </div>
                  <div className="report-summary-card">
                    <div className="summary-label">Average Cost</div>
                    <div className="summary-value">{formatMoney(reportStats.avgCost)}</div>
                    <div className="summary-foot muted">Average per record</div>
                  </div>
                  <div className="report-summary-card">
                    <div className="summary-label">Pending</div>
                    <div className="summary-value">{reportStats.pending}</div>
                    <div className="summary-foot muted">Waiting for action</div>
                  </div>
                  <div className="report-summary-card">
                    <div className="summary-label">In Progress</div>
                    <div className="summary-value">{reportStats.inProgress}</div>
                    <div className="summary-foot muted">Currently processing</div>
                  </div>
                  <div className="report-summary-card">
                    <div className="summary-label">Fixed / Returned</div>
                    <div className="summary-value">{reportStats.fixed + reportStats.returned}</div>
                    <div className="summary-foot muted">Completed records</div>
                  </div>
                  <div className="report-summary-card">
                    <div className="summary-label">Cannot Repair / Warranty</div>
                    <div className="summary-value">
                      {reportStats.cannotRepair} / {reportStats.warrantyCount}
                    </div>
                    <div className="summary-foot muted">Cannot repair and under warranty</div>
                  </div>
                </div>

                <div className="analytics-grid">
                  <StatList title="Records by Department" items={departmentStats} />
                  <StatList title="Records by Technician" items={technicianStats} />
                  <StatList title="Records by Device Type" items={deviceTypeStats} />
                  <StatList title="Top Issues" items={issueStats} />
                  <StatList title="Top Brand / Model" items={brandModelStats} />
                  <div className="analytics-card">
                    <h3 className="section-title">Report Notes</h3>
                    <div className="list-stat"><span>Filtered Records</span><strong>{reportStats.total}</strong></div>
                    <div className="list-stat"><span>Fixed</span><strong>{reportStats.fixed}</strong></div>
                    <div className="list-stat"><span>Returned</span><strong>{reportStats.returned}</strong></div>
                    <div className="list-stat"><span>Cannot Repair</span><strong>{reportStats.cannotRepair}</strong></div>
                    <div className="list-stat"><span>Under Warranty</span><strong>{reportStats.warrantyCount}</strong></div>
                  </div>
                </div>
              </>
            )}
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
                <button className="close-btn" onClick={closeModal}>
                  ✕
                </button>
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
                    <input value={form.owner} onChange={f("owner")} placeholder="Owner name" />
                  </div>

                  <div className="field">
                    <label>Department</label>
                    <input value={form.department} onChange={f("department")} placeholder="Department" />
                  </div>

                  <div className="field">
                    <label>Device Type</label>
                    <select value={form.device_type} onChange={f("device_type")}>
                      <option value="Laptop">Laptop</option>
                      <option value="Desktop">Desktop</option>
                      <option value="Printer">Printer</option>
                      <option value="Scanner">Scanner</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Brand *</label>
                    <select value={form.brand} onChange={f("brand")}>
                      <option value="Dell">Dell</option>
                      <option value="HP">HP</option>
                      <option value="Lenovo">Lenovo</option>
                      <option value="Macbook">Macbook</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Model *</label>
                    <input value={form.model} onChange={f("model")} placeholder="Model name" />
                  </div>

                  <div className="field">
                    <label>Serial No</label>
                    <input value={form.serial_no} onChange={f("serial_no")} placeholder="Serial number" />
                  </div>

                  <div className="field">
                    <label>Asset Tag</label>
                    <input value={form.asset_tag} onChange={f("asset_tag")} placeholder="Asset tag" />
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
                        <option key={k} value={k}>
                          {v.label}
                        </option>
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
                    <input type="number" value={form.cost} onChange={f("cost")} placeholder="0.00" />
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
                    <textarea value={form.issue} onChange={f("issue")} placeholder="Describe the issue" />
                  </div>

                  <div className="field form-full">
                    <label>Notes</label>
                    <textarea value={form.notes} onChange={f("notes")} placeholder="Repair notes" />
                  </div>

                  <div className="field form-full">
                    <div className="checkbox-box">
                      <input
                        id="warranty"
                        type="checkbox"
                        checked={form.warranty}
                        onChange={f("warranty")}
                      />
                      <label htmlFor="warranty" style={{ margin: 0 }}>
                        Under Warranty
                      </label>
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
