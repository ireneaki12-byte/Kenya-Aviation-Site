import React, { useEffect, useMemo, useState } from "react";
import Button        from "../components/common/Button.jsx";
import ProgressSteps from "../components/common/ProgressSteps.jsx";
import { useMoney }  from "../hooks/useMoney.js";
import { fetchQuote } from "../services/pricingService.js";
import { createBookingDraft } from "../services/apiClient.js";

const BURGUNDY = "#5b1237";
const GOLD     = "#c4a045";

const CATEGORY_LABELS = {
  adult: "Adult", child: "Child", infant: "Infant", unmr: "Unaccompanied Minor", um: "Unaccompanied Minor",
};

function Row({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}>
      <span style={{ fontWeight: bold ? 600 : 400, color: bold ? "#111" : "#555" }}>{label}</span>
      <span style={{ fontWeight: bold ? 600 : 400 }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "0.5rem 0" }} />;
}

function toSafeArray(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (v && typeof v === "object") return Object.values(v).filter(Boolean);
  return v ? [v] : [];
}

function formatAddon(v, fallback = "None") {
  const arr = toSafeArray(v);
  return arr.length ? arr.join(", ") : fallback;
}

function toCounts(list = []) {
  const by = (cat) => list.filter((p) => (p?.category || p?.type) === cat).length;
  return { adult: by("adult"), child: by("child"), infant: by("infant"), unmr: by("unmr") + by("um") };
}

function getFlightId(f) { return f?.id || f?.flight_id || f?.flightId; }
function getFareType(f)  { return f?.id || f?.fare_type || f?.fareType || f?.code; }

function FlightSegment({ label, flight }) {
  if (!flight) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem",
                  background: "#fdf9fd", borderRadius: 8, padding: "0.75rem 1rem",
                  border: `1px solid rgba(196,160,69,0.4)`, marginBottom: "0.5rem" }}>
      <div>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontWeight: 800, color: BURGUNDY }}>{flight.flight_number || "—"}</div>
        <div style={{ fontSize: "0.78rem", color: "#555" }}>{flight.origin} → {flight.destination}</div>
      </div>
      <div>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Departure</div>
        <div style={{ fontWeight: 700 }}>{flight.departure_time || "—"}</div>
      </div>
      <div>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Arrival</div>
        <div style={{ fontWeight: 700 }}>{flight.arrival_time || "—"}</div>
      </div>
    </div>
  );
}

export default function BookingSummary({
  search, selectedFlight, selectedReturnFlight, selectedFare,
  passengerDetails, contactDetails, addons, setBooking, setPage,
}) {
  const money      = useMoney();
  const isReturn   = !!selectedReturnFlight;
  const passengers = useMemo(() => Array.isArray(passengerDetails) ? passengerDetails : [], [passengerDetails]);

  const [outboundQuote, setOutboundQuote] = useState(null);
  const [returnQuote,   setReturnQuote]   = useState(null);
  const [error,         setError]         = useState("");
  const [submitting,    setSubmitting]     = useState(false);

  const flightId       = getFlightId(selectedFlight);
  const returnFlightId = getFlightId(selectedReturnFlight);
  const fareType       = getFareType(selectedFare);

  useEffect(() => {
    let active = true;
    setError("");
    setOutboundQuote(null);
    setReturnQuote(null);

    if (!flightId || !fareType) {
      setError("Missing selected flight or fare. Please go back and choose your flight again.");
      return () => { active = false; };
    }
    if (!passengers.length) {
      setError("No passengers found. Please go back and enter passenger details.");
      return () => { active = false; };
    }

    const quotePayload = { selectedFlight, selectedFare: { ...selectedFare, id: fareType },
                           passengerDetails: passengers, addons: addons || {} };

    fetchQuote(quotePayload)
      .then((q) => { if (active) setOutboundQuote(q); })
      .catch(() => { if (active) setError("Unable to price the outbound leg. Please go back and try again."); });

    if (isReturn && returnFlightId) {
      fetchQuote({ ...quotePayload, selectedFlight: { ...selectedReturnFlight, id: returnFlightId } })
        .then((q) => { if (active) setReturnQuote(q); })
        .catch(() => { if (active) setError("Unable to price the return leg. Please go back and try again."); });
    }

    return () => { active = false; };
  }, [flightId, returnFlightId, fareType, passengers.length, JSON.stringify(addons || {})]);

  const bothQuotesReady = outboundQuote && (!isReturn || returnQuote);
  const combinedTotal   = (outboundQuote?.total || 0) + (returnQuote?.total || 0);

  async function continueToPayment() {
    setError("");
    if (!flightId || !fareType) { setError("Missing flight or fare."); return; }
    if (!passengers.length)     { setError("No passengers found."); return; }
    try {
      setSubmitting(true);
      const draft = await createBookingDraft({
        flight_id:        flightId,
        fare_type:        fareType,
        passengers:       toCounts(passengers),
        addons:           addons || {},
        return_flight_id: returnFlightId || null,
      });
      setBooking((c) => ({
        ...c,
        bookingReference: draft.booking_reference,
        totalAmount:      isReturn ? combinedTotal : draft.total_amount,
        status:           "Pending Payment",
        paymentStatus:    "Not Paid",
      }));
      setPage("payment");
    } catch {
      setError("We could not start your booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const ao = outboundQuote?.ancillary || {};
  const ar = returnQuote?.ancillary   || {};

  return (
    <main className="section">
      <div className="container">
        <ProgressSteps current={4} />
        <div className="booking-layout">
          <section className="flight-results-column">

            {/* Flights */}
            <div className="card form-card">
              <h3>Flight{isReturn ? "s" : ""}</h3>
              <FlightSegment label="Outbound" flight={selectedFlight} />
              {isReturn && <FlightSegment label="Return" flight={selectedReturnFlight} />}
              <p style={{ fontSize: "0.82rem", color: "#555", marginTop: "0.5rem" }}>
                <strong>Fare:</strong> {selectedFare?.name || "—"}
              </p>
            </div>

            {/* Passengers */}
            <div className="card form-card">
              <h3>Passengers</h3>
              {passengers.length === 0 ? (
                <p>No passenger details captured.</p>
              ) : (
                passengers.map((p, i) => {
                  const cat = p?.category || p?.type;
                  return (
                    <div key={p.passengerKey || i} className="passenger-summary-row">
                      <strong>{p.label || `${CATEGORY_LABELS[cat] || "Passenger"} ${i + 1}`}</strong>
                      <span>{[p.title, p.firstName, p.lastName].filter(Boolean).join(" ") || `Passenger ${i + 1}`}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Contact */}
            <div className="card form-card">
              <h3>Contact</h3>
              <p>{contactDetails?.email || "No email"} · {contactDetails?.phone || "No phone"}</p>
            </div>

            {/* Add-ons */}
            <div className="card form-card">
              <h3>Add-ons</h3>
              <p><strong>Seat:</strong>           {formatAddon(addons?.seats || addons?.seat, "Not selected")}</p>
              <p><strong>Extra baggage:</strong>  {formatAddon(addons?.extraBaggage)}</p>
              <p><strong>Special baggage:</strong>{formatAddon(addons?.specialBaggage)}</p>
              <p><strong>Meal:</strong>            {formatAddon(addons?.passengerMeals || addons?.meal)}</p>
              <p><strong>Assistance:</strong>      {formatAddon(addons?.specialAssistance)}</p>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="card summary-card">
            <h3>Price summary</h3>

            {!outboundQuote ? (
              <p className="muted">Pricing…</p>
            ) : (
              <>
                {/* Outbound breakdown */}
                {isReturn && (
                  <p style={{ fontSize: "0.7rem", fontWeight: 800, color: BURGUNDY,
                               textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                    Outbound leg
                  </p>
                )}
                <Row label="Fare per passenger" value={money(outboundQuote.fare_amount)} />
                <Row label="Full-fare passengers" value={money(outboundQuote.full_passenger_fare)} />
                {outboundQuote.infant_fare > 0 && <Row label="Infant fare" value={money(outboundQuote.infant_fare)} />}
                <Row label="Taxes & fees" value={money(outboundQuote.taxes_and_fees)} />
                {ao.seat_fee          > 0 && <Row label="Seat"          value={money(ao.seat_fee)} />}
                {ao.extra_baggage_fee > 0 && <Row label="Extra baggage" value={money(ao.extra_baggage_fee)} />}
                {ao.meal_fee          > 0 && <Row label="Meal"          value={money(ao.meal_fee)} />}
                <Row label="Outbound subtotal" value={money(outboundQuote.total)} bold />

                {/* Return breakdown */}
                {isReturn && returnQuote && (
                  <>
                    <Divider />
                    <p style={{ fontSize: "0.7rem", fontWeight: 800, color: BURGUNDY,
                                 textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                      Return leg
                    </p>
                    <Row label="Fare per passenger" value={money(returnQuote.fare_amount)} />
                    <Row label="Full-fare passengers" value={money(returnQuote.full_passenger_fare)} />
                    {returnQuote.infant_fare > 0 && <Row label="Infant fare" value={money(returnQuote.infant_fare)} />}
                    <Row label="Taxes & fees" value={money(returnQuote.taxes_and_fees)} />
                    {ar.seat_fee          > 0 && <Row label="Seat"          value={money(ar.seat_fee)} />}
                    {ar.extra_baggage_fee > 0 && <Row label="Extra baggage" value={money(ar.extra_baggage_fee)} />}
                    {ar.meal_fee          > 0 && <Row label="Meal"          value={money(ar.meal_fee)} />}
                    <Row label="Return subtotal" value={money(returnQuote.total)} bold />
                  </>
                )}

                <Divider />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.25rem 0 1rem" }}>
                  <strong>Total</strong>
                  <strong style={{ fontSize: "1.4rem" }}>{money(isReturn ? combinedTotal : outboundQuote.total)}</strong>
                </div>
              </>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="summary-actions">
              <Button variant="secondary" onClick={() => setPage("addons")}>Back</Button>
              <Button onClick={continueToPayment} disabled={submitting || !bothQuotesReady}>
                {submitting ? "Starting booking…" : "Continue to payment"}
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
