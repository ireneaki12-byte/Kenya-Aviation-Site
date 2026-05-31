import React, { useState, useEffect } from "react";
import ProgressSteps from "../components/common/ProgressSteps.jsx";
import Button        from "../components/common/Button.jsx";
import { useMoney }  from "../hooks/useMoney.js";
import { sendItineraryEmail } from "../services/emailService.js";

const BURGUNDY = "#6B1E2E";
const GOLD     = "#C9A84C";

const CATEGORY_LABELS = {
  adult: "Adult", child: "Child", infant: "Infant", unmr: "Unaccompanied Minor",
};

function emailKey(ref) { return `ka_email_sent_${ref}`; }

function FlightSegmentCard({ label, flight, date, step }) {
  if (!flight) return null;
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ background: BURGUNDY, color: "#fff", borderRadius: "50%",
                       width: 22, height: 22, display: "flex", alignItems: "center",
                       justifyContent: "center", fontWeight: 800, fontSize: "0.7rem", flexShrink: 0 }}>
          {step}
        </span>
        <span style={{ fontWeight: 800, color: BURGUNDY, fontSize: "0.85rem" }}>{label}</span>
        {date && (
          <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#777",
                         background: "#fdf9fd", border: `1px solid ${GOLD}`,
                         borderRadius: 12, padding: "1px 10px" }}>{date}</span>
        )}
      </div>
      <div className="form-grid">
        <label className="form-field"><span>Flight number</span>
          <input readOnly value={flight.flight_number || "—"} /></label>
        <label className="form-field"><span>Route</span>
          <input readOnly value={`${flight.origin || "—"} → ${flight.destination || "—"}`} /></label>
        <label className="form-field"><span>Departure</span>
          <input readOnly value={flight.departure_time || "—"} /></label>
        <label className="form-field"><span>Arrival</span>
          <input readOnly value={flight.arrival_time || "—"} /></label>
      </div>
    </div>
  );
}

export default function Confirmation({
  booking, search,
  selectedFlight, selectedReturnFlight, selectedFare,
  passengerDetails, contactDetails, addons,
  setPage, startNewBooking, resetBookingState,
}) {
  const money    = useMoney();
  const isReturn = !!selectedReturnFlight;

  const outboundDate = search?.departureDate || "";
  const returnDate   = search?.returnDate    || "";

  const passengers = Array.isArray(passengerDetails)
    ? passengerDetails
    : passengerDetails ? [passengerDetails] : [];

  // Guard: use sessionStorage only to prevent double-send in StrictMode dev
  const [emailStatus, setEmailStatus] = useState(() => {
    const ref = booking?.bookingReference;
    if (!ref) return "idle";
    try {
      const s = sessionStorage.getItem(emailKey(ref));
      if (s === "sent") return "sent";
      if (s === "sending") return "sending";
    } catch {}
    return "pending";
  });

  useEffect(() => {
    const ref = booking?.bookingReference;
    if (!ref) return;
    try {
      const s = sessionStorage.getItem(emailKey(ref));
      if (s === "sent" || s === "sending") return;
      sessionStorage.setItem(emailKey(ref), "sending");
    } catch {}
    setEmailStatus("sending");

    sendItineraryEmail({
      booking,
      flight:         selectedFlight       || {},
      returnFlight:   selectedReturnFlight || null,
      search:         search               || {},
      fare:           selectedFare         || {},
      passengers,
      contactDetails: contactDetails       || {},
      addons:         addons               || {},
    })
      .then(() => {
        setEmailStatus("sent");
        try { sessionStorage.setItem(emailKey(booking.bookingReference), "sent"); } catch {}
      })
      .catch(() => {
        setEmailStatus("failed");
        try { sessionStorage.removeItem(emailKey(booking.bookingReference)); } catch {}
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.bookingReference]);

  // ── Navigation helpers — always reset booking state before leaving ─────────
  // This ensures the next customer starts with clean, empty forms.
  function goHome() {
    resetBookingState();
    setPage("home");
  }

  function goCheckIn() {
    // Do NOT reset — customer needs the booking reference visible on check-in.
    // They will type it manually; we just navigate.
    setPage("checkin");
  }

  return (
    <main className="section">
      <div className="container">
        <ProgressSteps current={6} />
        <div className="booking-layout">
          <section className="flight-results-column">

            {/* Booking reference */}
            <div className="card form-card"
              style={{ borderTop: `4px solid ${GOLD}`, textAlign: "center" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "0.09em", color: GOLD, marginBottom: "0.5rem" }}>
                {isReturn ? "Return trip confirmed" : "Booking confirmed"}
              </p>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: BURGUNDY,
                           letterSpacing: "0.06em", margin: "0 0 0.5rem" }}>
                {booking?.bookingReference || "Pending reference"}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#555", margin: 0 }}>
                Note your booking reference — you will need it for check-in.
              </p>
            </div>

            {/* Itinerary */}
            <div className="card form-card">
              <h3 style={{ color: BURGUNDY }}>Itinerary</h3>
              <FlightSegmentCard
                step="1" label={isReturn ? "Outbound" : "Flight"}
                flight={selectedFlight} date={outboundDate} />
              {isReturn && (
                <>
                  <div style={{ borderTop: `1px dashed ${GOLD}`, margin: "0.75rem 0" }} />
                  <FlightSegmentCard step="2" label="Return"
                    flight={selectedReturnFlight} date={returnDate} />
                </>
              )}
              <p style={{ fontSize: "0.82rem", color: "#555", marginTop: "0.5rem" }}>
                <strong>Fare:</strong> {selectedFare?.name || "—"}
              </p>
            </div>

            {/* Passengers */}
            <div className="card form-card">
              <h3 style={{ color: BURGUNDY }}>Passengers</h3>
              {passengers.length === 0 ? (
                <p style={{ color: "#888" }}>No passenger details captured.</p>
              ) : passengers.map((p, i) => (
                <div key={p.passengerKey || i} className="passenger-summary-row">
                  <strong>{CATEGORY_LABELS[p.category] || p.label || `Passenger ${i + 1}`}</strong>
                  <span>{[p.title, p.firstName, p.lastName].filter(Boolean).join(" ") || "—"}</span>
                </div>
              ))}
            </div>

            {/* Add-ons */}
            <div className="card form-card">
              <h3 style={{ color: BURGUNDY }}>Add-ons</h3>
              <div className="form-grid">
                <label className="form-field"><span>Seat</span>
                  <input readOnly value={
                    (Array.isArray(addons?.seats) && addons.seats.filter(Boolean).join(", ")) ||
                    addons?.seat || "Not selected"
                  } /></label>
                <label className="form-field"><span>Extra baggage</span>
                  <input readOnly value={
                    Array.isArray(addons?.extraBaggage) && addons.extraBaggage.length
                      ? addons.extraBaggage.join(", ") : "None"
                  } /></label>
                <label className="form-field"><span>Meal</span>
                  <input readOnly value={addons?.meal || "None"} /></label>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="card summary-card">
            <h3 style={{ color: BURGUNDY }}>Payment summary</h3>
            <p><strong>Status:</strong>      {booking?.paymentStatus        || "Succeeded"}</p>
            <p><strong>Method:</strong>       {booking?.paymentMethod        || "—"}</p>
            <p><strong>Transaction:</strong>  {booking?.transactionReference || "—"}</p>
            <hr />

            {/* Email status */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "0.5rem",
              padding: "0.55rem 0.75rem", borderRadius: 7, marginBottom: "0.75rem",
              background: emailStatus === "sent" ? "#F0FFF4" : emailStatus === "failed" ? "#FFF5F5" : "#FFFBEB",
              border: `1px solid ${emailStatus === "sent" ? "#86EFAC" : emailStatus === "failed" ? "#FCA5A5" : GOLD}`,
            }}>
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>
                {emailStatus === "sent" ? "✅" : emailStatus === "failed" ? "⚠️" : "📧"}
              </span>
              <div style={{ fontSize: "0.78rem" }}>
                {emailStatus === "sent" && (
                  <><strong style={{ color: "#166534" }}>Itinerary emailed</strong>
                    <div style={{ color: "#555", marginTop: 1 }}>Sent to {contactDetails?.email || "your email"}.</div></>
                )}
                {(emailStatus === "sending" || emailStatus === "pending") && (
                  <span style={{ color: "#92400e" }}>Sending your itinerary…</span>
                )}
                {emailStatus === "failed" && (
                  <><strong style={{ color: "#991B1B" }}>Email could not be sent</strong>
                    <div style={{ color: "#555", marginTop: 1 }}>
                      Save your reference. Contact info@kenya-aviation.com.
                    </div></>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between",
                          alignItems: "center", margin: "0.25rem 0 1rem" }}>
              <strong>Total paid</strong>
              <strong style={{ fontSize: "1.4rem", color: BURGUNDY }}>
                {money(booking?.totalAmount || 0)}
              </strong>
            </div>

            <div className="summary-actions">
              {/* goCheckIn does NOT reset — customer types ref manually */}
              <Button onClick={goCheckIn}>Check in</Button>
              {/* goHome resets all state — next customer starts clean */}
              <Button variant="secondary" onClick={goHome}>Back home</Button>
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              {/* startNewBooking resets state and goes to search */}
              <Button variant="secondary" style={{ width: "100%" }}
                onClick={startNewBooking}>
                Book another flight
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
