import React, { useEffect, useState } from "react";
import Button from "../components/common/Button.jsx";
import {
  adminLogin,
  verifyAdminOtp,
  getAdminAnalytics,
  getBookings,
  getChatLogs,
  setAdminToken as wireAdminToken,
} from "../services/apiClient";

const BURGUNDY = "#5b1237";
const GOLD     = "#c4a045";

// ── Small reusable components ─────────────────────────────────────────────────

function MetricCard({ label, value }) {
  return (
    <div className="card metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="admin-card-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
      </div>
    </div>
  );
}

function AlertBox({ type = "info", children }) {
  return (
    <div className={`alert${type === "danger" ? " alert-danger" : ""}`}>
      {children}
    </div>
  );
}

// ── Login form ────────────────────────────────────────────────────────────────

function LoginForm({ credentials, onChange, onSubmit, loading, error, onBack }) {
  return (
    <main className="section flight-search-page admin-page">
      <div className="container">
        <section className="booking-panel admin-auth-panel">
          <div className="admin-auth-grid">

            {/* Left copy */}
            <div className="admin-auth-copy">
              <p className="eyebrow">Restricted access</p>
              <h2>Admin sign in</h2>
              <p>
                Sign in to access operational insights, chatbot logs,
                booking activity and revenue performance.
              </p>
              <div className="admin-security-card">
                <h3>Secure access</h3>
                <p>
                  This dashboard uses password authentication followed by
                  an email OTP for multifactor verification.
                </p>
              </div>
            </div>

            {/* Login form */}
            <form className="card form-card admin-auth-form" onSubmit={onSubmit}>
              <h3>Login details</h3>

              <label className="form-field">
                <span>Email address</span>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="admin@kenyaaviation.example"
                  autoComplete="email"
                />
              </label>

              <label className="form-field">
                <span>Password</span>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => onChange("password", e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                />
              </label>

              {error && <AlertBox type="danger">{error}</AlertBox>}

              <div className="summary-actions">
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending OTP…" : "Continue"}
                </Button>
                <Button type="button" variant="secondary" onClick={onBack}>
                  Back home
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

// ── OTP form ──────────────────────────────────────────────────────────────────

function OtpForm({ otp, onChange, onSubmit, loading, error, onBack }) {
  return (
    <main className="section flight-search-page admin-page">
      <div className="container">
        <section className="booking-panel admin-auth-panel">
          <div className="admin-auth-grid">

            {/* Left copy */}
            <div className="admin-auth-copy">
              <p className="eyebrow">Multifactor authentication</p>
              <h2>Verify your access</h2>
              <p>
                Enter the one-time password sent to the registered admin
                email address to continue to the dashboard.
              </p>
              <div className="admin-security-card">
                <h3>OTP verification</h3>
                <p>
                  The OTP is valid for 5 minutes and protects sensitive
                  operational and customer activity data.
                </p>
              </div>
            </div>

            {/* OTP form */}
            <form className="card form-card admin-auth-form" onSubmit={onSubmit}>
              <h3>Enter OTP</h3>

              <label className="form-field">
                <span>One-time password</span>
                <input
                  value={otp}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </label>

              {error && <AlertBox type="danger">{error}</AlertBox>}

              <div className="summary-actions">
                <Button type="submit" disabled={loading}>
                  {loading ? "Verifying…" : "Verify and continue"}
                </Button>
                <Button type="button" variant="secondary" onClick={onBack}>
                  Back to login
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

// ── Bookings table ────────────────────────────────────────────────────────────

function BookingsTable({ bookings }) {
  if (!bookings.length) {
    return <p className="muted">No bookings available.</p>;
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>PNR</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Total (KES)</th>
          </tr>
        </thead>
        <tbody>
          {bookings.slice(0, 10).map((b, i) => (
            <tr key={b.booking_reference || b.pnr || i}>
              <td>{b.booking_reference || b.pnr || "—"}</td>
              <td>{b.status        || "Draft"}</td>
              <td>{b.payment_status || "Not Paid"}</td>
              <td>
                {Number(b.total_amount || b.total || 0).toLocaleString("en-KE")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Chat log list ─────────────────────────────────────────────────────────────

function ChatLogList({ logs }) {
  if (!logs.length) {
    return <p className="muted">No chatbot logs available.</p>;
  }
  return (
    <div className="chat-log-list">
      {logs.slice(0, 6).map((log, i) => (
        <div className="chat-log-item" key={log.id || i}>
          <strong>{log.intent || "conversation"}</strong>
          <p>{log.message || "No message captured"}</p>
          <span>{log.outcome || "logged"}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

function Dashboard({ analytics, bookings, chatLogs, loading, error, onSignOut }) {
  return (
    <main className="section flight-search-page admin-page">
      <div className="container">
        <section className="booking-panel admin-dashboard-panel">

          {/* Header */}
          <div className="admin-dashboard-header">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h2>Kenya Aviation overview</h2>
            </div>
            <Button type="button" variant="secondary" onClick={onSignOut}>
              Sign out
            </Button>
          </div>

          {loading && <AlertBox>Loading dashboard data…</AlertBox>}
          {error   && <AlertBox type="danger">{error}</AlertBox>}

          {!loading && !error && (
            <>
              {/* ── Metric cards ── */}
              <div className="admin-metrics-grid">
                <MetricCard
                  label="Total bookings"
                  value={analytics?.booking_count ?? 0}
                />
                <MetricCard
                  label="Revenue"
                  value={`KES ${Number(analytics?.revenue ?? 0).toLocaleString("en-KE")}`}
                />
                <MetricCard
                  label="Chatbot conversations"
                  value={analytics?.chat_log_count ?? 0}
                />
              </div>

              {/* ── Data tables ── */}
              <div className="admin-section-grid">

                <div className="card admin-table-card">
                  <SectionHeading
                    eyebrow="Bookings"
                    title="Recent booking activity"
                  />
                  <BookingsTable bookings={bookings} />
                </div>

                <div className="card admin-chat-card">
                  <SectionHeading
                    eyebrow="Assistant"
                    title="Chatbot conversations"
                  />
                  <ChatLogList logs={chatLogs} />
                </div>

              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

export default function AdminDashboard({ setPage }) {
  // ── Auth state ─────────────────────────────────────────────────────────────
  const [authStep,     setAuthStep]     = useState("login"); // login | otp | authenticated
  const [sessionId,    setSessionId]    = useState("");
  const [adminToken,   setAdminToken]   = useState("");
  const [credentials,  setCredentials]  = useState({ email: "", password: "" });
  const [otp,          setOtp]          = useState("");
  const [authError,    setAuthError]    = useState("");

  // ── Dashboard data state ───────────────────────────────────────────────────
  const [analytics, setAnalytics] = useState(null);
  const [bookings,  setBookings]  = useState([]);
  const [chatLogs,  setChatLogs]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [dataError, setDataError] = useState("");

  const isAuthenticated = authStep === "authenticated" && !!adminToken;

  // ── Auth handlers ──────────────────────────────────────────────────────────

  function updateCredential(field, value) {
    setCredentials((c) => ({ ...c, [field]: value }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    if (!credentials.email || !credentials.password) {
      setAuthError("Please enter admin email and password.");
      return;
    }
    try {
      setLoading(true);
      const res = await adminLogin({ email: credentials.email, password: credentials.password });
      setSessionId(res.session_id);
      setAuthStep("otp");
    } catch {
      setAuthError("Invalid credentials or OTP could not be sent.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerify(e) {
    e.preventDefault();
    setAuthError("");
    if (!otp.trim()) {
      setAuthError("Please enter the OTP sent to your email.");
      return;
    }
    try {
      setLoading(true);
      const res = await verifyAdminOtp({ session_id: sessionId, otp });
      setAdminToken(res.token);
      wireAdminToken(res.token);   // wires Bearer header into all /api/admin/* calls
      setAuthStep("authenticated");
    } catch {
      setAuthError("Invalid or expired OTP. Please request a new one.");
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    setAdminToken("");
    wireAdminToken("");
    setAuthStep("login");
    setSessionId("");
    setOtp("");
    setCredentials({ email: "", password: "" });
    setAnalytics(null);
    setBookings([]);
    setChatLogs([]);
    setAuthError("");
    setDataError("");
  }

  // ── Load dashboard data once authenticated ─────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return;

    async function load() {
      try {
        setLoading(true);
        setDataError("");
        const [analyticsRes, bookingsRes, chatRes] = await Promise.all([
          getAdminAnalytics(),
          getBookings(),
          getChatLogs(),
        ]);
        setAnalytics(analyticsRes   || {});
        setBookings(bookingsRes?.bookings   || []);
        setChatLogs(chatRes?.chat_logs      || []);
      } catch {
        setDataError("Unable to load dashboard data. Please try signing in again.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isAuthenticated]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (authStep === "login") {
    return (
      <LoginForm
        credentials={credentials}
        onChange={updateCredential}
        onSubmit={handleLogin}
        loading={loading}
        error={authError}
        onBack={() => setPage("home")}
      />
    );
  }

  if (authStep === "otp") {
    return (
      <OtpForm
        otp={otp}
        onChange={setOtp}
        onSubmit={handleOtpVerify}
        loading={loading}
        error={authError}
        onBack={() => setAuthStep("login")}
      />
    );
  }

  return (
    <Dashboard
      analytics={analytics}
      bookings={bookings}
      chatLogs={chatLogs}
      loading={loading}
      error={dataError}
      onSignOut={handleSignOut}
    />
  );
}
