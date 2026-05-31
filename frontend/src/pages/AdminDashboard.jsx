import React, { useEffect, useState } from "react";
import Button from "../components/common/Button.jsx";
import {
  adminLogin,
  verifyAdminOtp,
  getAdminAnalytics,
  getBookings,
  getChatLogs,
  setAdminToken as wireAdminToken, // wires Bearer header into all /api/admin/* calls
} from "../services/apiClient";

export default function AdminDashboard({ setPage }) {
  const [authStep, setAuthStep] = useState("login");
  const [sessionId, setSessionId] = useState("");
  const [adminToken, setAdminToken] = useState(""); // React state only

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [dataError, setDataError] = useState("");

  const isAuthenticated = authStep === "authenticated" && adminToken;

  function updateCredential(field, value) {
    setCredentials((current) => ({ ...current, [field]: value }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError("");

    if (!credentials.email || !credentials.password) {
      setAuthError("Please enter admin email and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await adminLogin({
        email: credentials.email,
        password: credentials.password,
      });
      setSessionId(response.session_id);
      setAuthStep("otp");
    } catch (error) {
      console.error("Admin login failed:", error);
      setAuthError("Invalid credentials or OTP could not be sent.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerify(event) {
    event.preventDefault();
    setAuthError("");

    if (!otp.trim()) {
      setAuthError("Please enter the OTP sent to your email.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyAdminOtp({ session_id: sessionId, otp });

      // 1. Store the token in React state (drives isAuthenticated / UI).
      setAdminToken(response.token);
      // 2. Wire it into the apiClient module so every subsequent
      //    /api/admin/* request includes Authorization: Bearer <token>.
      wireAdminToken(response.token);

      setAuthStep("authenticated");
    } catch (error) {
      console.error("OTP verification failed:", error);
      setAuthError("Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    // Clear both the React state and the apiClient module-level token.
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

  useEffect(() => {
    async function loadDashboardData() {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setDataError("");

        const [analyticsResponse, bookingsResponse, chatResponse] =
          await Promise.all([getAdminAnalytics(), getBookings(), getChatLogs()]);

        setAnalytics(analyticsResponse || {});
        setBookings(bookingsResponse?.bookings || []);
        setChatLogs(chatResponse?.chat_logs || []);
      } catch (error) {
        console.error("Admin dashboard failed:", error);
        setDataError(
          "Unable to load admin dashboard data. Please confirm the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isAuthenticated]);

  // ── Login screen ──────────────────────────────────────────────────────────
  if (authStep === "login") {
    return (
      <main className="section flight-search-page admin-page">
        <div className="container">
          <section className="booking-panel admin-auth-panel">
            <div className="admin-auth-grid">
              <div className="admin-auth-copy">
                <p className="eyebrow">Restricted access</p>
                <h2>Admin sign in</h2>
                <p>
                  Sign in to access operational insights, chatbot logs, booking
                  activity and revenue performance.
                </p>
                <div className="admin-security-card">
                  <h3>Secure access</h3>
                  <p>
                    This dashboard uses password authentication followed by an
                    email OTP for multifactor verification.
                  </p>
                </div>
              </div>

              <form
                className="card form-card admin-auth-form"
                onSubmit={handleLogin}
              >
                <h3>Login details</h3>

                <label className="form-field">
                  <span>Email address</span>
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(event) =>
                      updateCredential("email", event.target.value)
                    }
                    placeholder="admin@kenyaaviation.example"
                  />
                </label>

                <label className="form-field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(event) =>
                      updateCredential("password", event.target.value)
                    }
                    placeholder="Enter admin password"
                  />
                </label>

                {authError && (
                  <div className="alert alert-danger">{authError}</div>
                )}

                <div className="summary-actions">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Sending OTP..." : "Continue"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setPage("home")}
                  >
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

  // ── OTP screen ────────────────────────────────────────────────────────────
  if (authStep === "otp") {
    return (
      <main className="section flight-search-page admin-page">
        <div className="container">
          <section className="booking-panel admin-auth-panel">
            <div className="admin-auth-grid">
              <div className="admin-auth-copy">
                <p className="eyebrow">Multifactor authentication</p>
                <h2>Verify your access</h2>
                <p>
                  Enter the one-time password sent to the registered admin email
                  address to continue to the dashboard.
                </p>
                <div className="admin-security-card">
                  <h3>OTP verification</h3>
                  <p>
                    The OTP is time-bound and helps protect sensitive operational
                    and customer activity data.
                  </p>
                </div>
              </div>

              <form
                className="card form-card admin-auth-form"
                onSubmit={handleOtpVerify}
              >
                <h3>Enter OTP</h3>

                <label className="form-field">
                  <span>One-time password</span>
                  <input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                </label>

                {authError && (
                  <div className="alert alert-danger">{authError}</div>
                )}

                <div className="summary-actions">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify and continue"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setAuthStep("login")}
                  >
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

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <main className="section flight-search-page admin-page">
      <div className="container">
        <section className="booking-panel admin-dashboard-panel">
          <div className="admin-dashboard-header">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h2>Kenya Aviation overview</h2>
            </div>
            <Button type="button" variant="secondary" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>

          {loading && <div className="alert">Loading dashboard data...</div>}
          {dataError && <div className="alert alert-danger">{dataError}</div>}

          {!loading && !dataError && (
            <>
              <div className="admin-metrics-grid">
                <div className="card metric-card">
                  <span>Total bookings</span>
                  <strong>{analytics?.booking_count || 0}</strong>
                </div>
                <div className="card metric-card">
                  <span>Revenue</span>
                  <strong>
                    KES {Number(analytics?.revenue || 0).toLocaleString()}
                  </strong>
                </div>
                <div className="card metric-card">
                  <span>Chatbot logs</span>
                  <strong>{analytics?.chat_log_count || 0}</strong>
                </div>
                <div className="card metric-card">
                  <span>Notifications</span>
                  <strong>{analytics?.notification_count || 0}</strong>
                </div>
              </div>

              <div className="admin-section-grid">
                <div className="card admin-table-card">
                  <div className="admin-card-heading">
                    <div>
                      <p className="eyebrow">Bookings</p>
                      <h3>Recent booking activity</h3>
                    </div>
                  </div>

                  {bookings.length === 0 ? (
                    <p className="muted">No bookings available.</p>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>PNR</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.slice(0, 8).map((booking, index) => (
                            <tr key={booking.pnr || index}>
                              <td>{booking.pnr || booking.booking_reference}</td>
                              <td>{booking.status || "Draft"}</td>
                              <td>{booking.payment_status || "Not Paid"}</td>
                              <td>
                                KES{" "}
                                {Number(booking.total || 0).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="card admin-chat-card">
                  <div className="admin-card-heading">
                    <div>
                      <p className="eyebrow">Assistant</p>
                      <h3>Chatbot conversations</h3>
                    </div>
                  </div>

                  {chatLogs.length === 0 ? (
                    <p className="muted">No chatbot logs available.</p>
                  ) : (
                    <div className="chat-log-list">
                      {chatLogs.slice(0, 6).map((log, index) => (
                        <div className="chat-log-item" key={log.id || index}>
                          <strong>{log.intent || "conversation"}</strong>
                          <p>{log.message || "No message captured"}</p>
                          <span>{log.outcome || "logged"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}