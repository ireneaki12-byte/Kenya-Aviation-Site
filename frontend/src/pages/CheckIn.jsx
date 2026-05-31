import React, { useEffect, useMemo, useState } from "react";
import Button from "../components/common/Button.jsx";

const BURGUNDY = "#5b1237";
const GOLD     = "#c4a045";

const CATEGORY_LABELS = {
  adult: "Adult", child: "Child", infant: "Infant", unmr: "Unaccompanied Minor",
};

// ── Check-in window ────────────────────────────────────────────────────────────
function getWindowStatus(departureDate, departureTime) {
  if (!departureDate || !departureTime)
    return { status: "unknown", message: "Departure information is not available." };

  const [hh, mm] = departureTime.split(":").map(Number);
  const dep       = new Date(departureDate);
  dep.setHours(hh, mm, 0, 0);

  const diffHours = (dep - new Date()) / (1000 * 60 * 60);

  if (diffHours > 30) {
    const h = Math.round(diffHours - 30);
    return { status: "too-early",
      message: `Check-in is not yet open. Opens in ${h} hour${h !== 1 ? "s" : ""} (30 hours before departure).` };
  }
  if (diffHours < 0)
    return { status: "departed",
      message: "This flight has already departed. Check-in is closed." };
  if (diffHours < 1) {
    const m = Math.round(diffHours * 60);
    return { status: "too-late",
      message: `Check-in has closed — less than 1 hour to departure (${m} min remaining).` };
  }
  const closeMins = Math.round((diffHours - 1) * 60);
  const closeText = closeMins >= 60
    ? `${Math.floor(closeMins / 60)}h ${closeMins % 60}m`
    : `${closeMins} min`;
  return { status: "open",
    message: `Check-in is open. Closes in ${closeText} (1 hour before departure).` };
}

function resolveActiveLeg(search, selectedFlight, selectedReturnFlight) {
  const outDate = search?.departureDate;
  const retDate = search?.returnDate;
  if (!selectedReturnFlight)
    return { flight: selectedFlight, date: outDate, label: null };

  if (outDate && selectedFlight?.departure_time) {
    const [hh, mm] = selectedFlight.departure_time.split(":").map(Number);
    const dep       = new Date(outDate);
    dep.setHours(hh, mm, 0, 0);
    if (dep > new Date())
      return { flight: selectedFlight, date: outDate, label: "Outbound" };
  }
  return { flight: selectedReturnFlight, date: retDate, label: "Return" };
}

// ── Canvas download ────────────────────────────────────────────────────────────
function drawBoardingPass(canvas, { pnr, outbound, outboundDate, inbound, inboundDate, passengers }) {
  const isReturn = !!inbound;
  const PAX_H    = Math.max(passengers.length, 1) * 28;
  const HEIGHT   = (isReturn ? 560 : 400) + PAX_H;
  canvas.width   = 820;
  canvas.height  = HEIGHT;
  const ctx      = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = BURGUNDY;  ctx.fillRect(0, 0, canvas.width, 110);

  ctx.fillStyle = GOLD;  ctx.font = "bold 26px Arial"; ctx.fillText("KENYA AVIATION", 36, 44);
  ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "11px Arial";
  ctx.fillText("THE SPIRIT OF EAST AFRICA", 37, 62);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 13px Arial"; ctx.textAlign = "right";
  ctx.fillText(isReturn ? "RETURN BOARDING PASS" : "BOARDING PASS", canvas.width - 36, 44);
  ctx.textAlign = "left";

  ctx.fillStyle = "#ffffff"; ctx.font = "bold 36px Arial"; ctx.textAlign = "center";
  ctx.fillText(pnr, canvas.width / 2, 97);
  ctx.textAlign = "left";

  ctx.fillStyle = GOLD; ctx.fillRect(0, 110, canvas.width, 4);

  let y = 130;

  function drawSegment(flight, date, label) {
    // Label
    ctx.fillStyle = BURGUNDY; ctx.font = "bold 11px Arial";
    ctx.fillText(label.toUpperCase(), 36, y + 10);
    if (date) {
      ctx.fillStyle = "#555"; ctx.font = "11px Arial";
      ctx.textAlign = "right";
      ctx.fillText(date, canvas.width - 36, y + 10);
      ctx.textAlign = "left";
    }
    ctx.fillStyle = GOLD; ctx.fillRect(36, y + 14, 80, 2);
    y += 24;

    // Route
    ctx.fillStyle = BURGUNDY; ctx.font = "bold 44px Arial"; ctx.textAlign = "center";
    ctx.fillText(`${flight?.origin || "—"}  →  ${flight?.destination || "—"}`,
                  canvas.width / 2, y + 38);
    ctx.textAlign = "left"; y += 52;

    // Details row — FLIGHT / DATE / DEPARTURE / ARRIVAL
    const cols = [
      ["FLIGHT",    flight?.flight_number  || "—"],
      ["DATE",      date                   || "—"],
      ["DEPARTURE", flight?.departure_time || "—"],
      ["ARRIVAL",   flight?.arrival_time   || "—"],
    ];
    const colW = canvas.width / cols.length;
    cols.forEach(([lbl, val], i) => {
      const x = i * colW + 36;
      ctx.fillStyle = GOLD;    ctx.font = "bold 9px Arial";  ctx.fillText(lbl, x, y);
      ctx.fillStyle = BURGUNDY; ctx.font = "bold 18px Arial"; ctx.fillText(val, x, y + 22);
    });
    y += 44;

    ctx.strokeStyle = "#e8dce8"; ctx.lineWidth = 1;
    ctx.setLineDash(isReturn ? [6, 4] : []);
    ctx.beginPath(); ctx.moveTo(36, y); ctx.lineTo(canvas.width - 36, y); ctx.stroke();
    ctx.setLineDash([]); y += 16;
  }

  drawSegment(outbound, outboundDate, isReturn ? "Outbound flight" : "Flight");
  if (isReturn) drawSegment(inbound, inboundDate, "Return flight");

  // Passengers
  ctx.fillStyle = BURGUNDY; ctx.font = "bold 11px Arial";
  ctx.fillText("PASSENGERS", 36, y + 10); y += 24;
  ctx.fillStyle = "#999"; ctx.font = "10px Arial";
  ctx.fillText("NAME", 36, y); ctx.fillText("TYPE", 320, y);
  ctx.fillText("DOCUMENT", 490, y); ctx.fillText("STATUS", 700, y); y += 10;

  passengers.forEach((p, i) => {
    const rowY = y + i * 28;
    const name = [p.title, p.firstName || p.first_name, p.lastName || p.last_name]
                   .filter(Boolean).join(" ") || "—";
    ctx.fillStyle = i % 2 === 0 ? "#fdf9fd" : "#ffffff";
    ctx.fillRect(24, rowY - 14, canvas.width - 48, 22);
    ctx.fillStyle = "#222"; ctx.font = "bold 13px Arial"; ctx.fillText(name, 36, rowY);
    ctx.fillStyle = "#555"; ctx.font = "12px Arial";
    ctx.fillText(CATEGORY_LABELS[p.category || p.type] || "Adult", 320, rowY);
    ctx.fillText(p.documentNumber || "—", 490, rowY);
    ctx.fillStyle = "#16a34a"; ctx.font = "bold 11px Arial";
    ctx.fillText("CHECKED IN ✓", 700, rowY);
  });

  y += passengers.length * 28 + 16;

  // Barcode
  ctx.fillStyle = BURGUNDY; ctx.font = "bold 10px Arial"; ctx.fillText("SCAN AT GATE", 36, y);
  const widths = [2,1,3,1,2,1,1,3,2,1,2,3,1,2,1,3,1,2,1,1,3,2,1,2];
  let cursor = 36;
  widths.forEach((w, i) => {
    ctx.fillStyle = i % 2 === 0 ? "#1a1a1a" : "#ffffff";
    ctx.fillRect(cursor, y + 10, w * 3, 44); cursor += w * 3 + 1;
  });
  y += 60;

  ctx.fillStyle = BURGUNDY; ctx.fillRect(0, HEIGHT - 36, canvas.width, 36);
  ctx.fillStyle = GOLD; ctx.font = "bold 11px Arial"; ctx.textAlign = "center";
  ctx.fillText("Kenya Aviation  •  info@kenya-aviation.com  •  +254 20 827 0000",
               canvas.width / 2, HEIGHT - 13);
  ctx.textAlign = "left";
}

function downloadBoardingPass({ pnr, outbound, outboundDate, inbound, inboundDate, passengers }) {
  const canvas = document.createElement("canvas");
  drawBoardingPass(canvas, { pnr, outbound, outboundDate, inbound, inboundDate, passengers });
  const link    = document.createElement("a");
  link.download = `boarding-pass-${pnr}.png`;
  link.href     = canvas.toDataURL("image/png");
  link.click();
}

// ── On-screen segment ──────────────────────────────────────────────────────────
function SegmentRow({ label, flight, date, step }) {
  if (!flight) return null;
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
        <span style={{ background: BURGUNDY, color: "#fff", borderRadius: "50%", width: 20, height: 20,
                       display: "flex", alignItems: "center", justifyContent: "center",
                       fontWeight: 800, fontSize: "0.68rem", flexShrink: 0 }}>{step}</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: BURGUNDY,
                       textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
        {date && (
          <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#777",
                         background: "#fdf9fd", border: `1px solid ${GOLD}`,
                         borderRadius: 12, padding: "1px 10px" }}>{date}</span>
        )}
      </div>

      {/* 4-column grid: FLIGHT · DATE · DEPARTURE · ARRIVAL */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)",
                    gap: "1px", background: "#ede0f0" }}>
        {[
          ["FLIGHT",    flight.flight_number,  true ],
          ["DATE",      date || "—",           false],
          ["DEPARTURE", flight.departure_time, false],
          ["ARRIVAL",   flight.arrival_time,   false],
        ].map(([lbl, val, hi]) => (
          <div key={lbl} style={{ background: hi ? BURGUNDY : "#fff",
                                  padding: "0.6rem 0.75rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.55rem", fontWeight: 700, color: GOLD,
                          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>
              {lbl}
            </div>
            <div style={{ fontSize: "0.82rem", fontWeight: 800,
                          color: hi ? "#ffffff" : BURGUNDY }}>
              {val || "—"}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fdf9fd", padding: "0.3rem 0.75rem", textAlign: "center",
                    fontSize: "0.72rem", color: "#777" }}>
        {flight.origin} → {flight.destination}
      </div>
    </div>
  );
}

function WindowBanner({ windowStatus }) {
  const styles = {
    open:       { bg: "#f0fdf4", border: "#86efac", icon: "✅", color: "#166534" },
    "too-early":{ bg: "#fffbeb", border: GOLD,      icon: "🕐", color: "#92400e" },
    "too-late": { bg: "#fff5f5", border: "#fca5a5", icon: "⚠️", color: "#991b1b" },
    departed:   { bg: "#f1f5f9", border: "#cbd5e1", icon: "✈️", color: "#475569" },
    unknown:    { bg: "#f8fafc", border: "#e2e8f0", icon: "ℹ️", color: "#555"    },
  };
  const s = styles[windowStatus.status] || styles.unknown;
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8,
                  padding: "0.7rem 1rem", marginBottom: "1rem",
                  display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{s.icon}</span>
      <span style={{ fontSize: "0.82rem", color: s.color, fontWeight: 600 }}>
        {windowStatus.message}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CheckIn({
  booking, search, passengerDetails,
  selectedFlight, selectedReturnFlight,
  setPage, startNewBooking,
}) {
  const isReturn   = !!selectedReturnFlight;
  const passengers = useMemo(
    () => Array.isArray(passengerDetails)
      ? passengerDetails
      : passengerDetails ? [passengerDetails] : [],
    [passengerDetails]
  );

  const outboundDate = search?.departureDate || "";
  const returnDate   = search?.returnDate    || "";

  const [pnr,       setPnr]       = useState("");
  const [lastName,  setLastName]  = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [error,     setError]     = useState("");

  const activeLeg    = resolveActiveLeg(search, selectedFlight, selectedReturnFlight);
  const windowStatus = getWindowStatus(activeLeg.date, activeLeg.flight?.departure_time);
  const canCheckIn   = windowStatus.status === "open";

  function handleCheckIn(e) {
    e.preventDefault();
    setError("");
    if (!canCheckIn)      { setError("Check-in is not currently available for this flight."); return; }
    if (!pnr.trim())      { setError("Please enter your booking reference."); return; }
    if (!lastName.trim()) { setError("Please enter your last name."); return; }
    setCheckedIn(true);
  }

  return (
    <main className="section">
      <div className="container">
        <div className="booking-layout" style={{ alignItems: "flex-start" }}>

          <section className="flight-results-column"
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Form */}
            <form className="card form-card" onSubmit={handleCheckIn}>
              <h3 style={{ color: BURGUNDY, marginBottom: "0.75rem" }}>Check-in details</h3>
              <WindowBanner windowStatus={windowStatus} />

              {activeLeg.label && (
                <p style={{ fontSize: "0.78rem", color: "#777", marginBottom: "0.75rem" }}>
                  Window based on your{" "}
                  <strong style={{ color: BURGUNDY }}>{activeLeg.label} flight</strong>
                  {activeLeg.date ? ` on ${activeLeg.date}` : ""} departing at{" "}
                  <strong>{activeLeg.flight?.departure_time || "—"}</strong>.
                </p>
              )}

              <div className="form-grid">
                <label className="form-field">
                  <span>Booking reference</span>
                  <input value={pnr} disabled={!canCheckIn}
                    onChange={(e) => setPnr(e.target.value.toUpperCase())}
                    placeholder="e.g. KAS7K9P"
                    style={{ opacity: canCheckIn ? 1 : 0.6 }} />
                </label>
                <label className="form-field">
                  <span>Last name</span>
                  <input value={lastName} disabled={!canCheckIn}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name as on booking"
                    style={{ opacity: canCheckIn ? 1 : 0.6 }} />
                </label>
              </div>

              {error && <div className="alert alert-danger" style={{ marginTop: "0.75rem" }}>{error}</div>}

              <div className="summary-actions" style={{ marginTop: "1rem" }}>
                <Button type="submit" disabled={!canCheckIn}>
                  {canCheckIn ? "Check in" : "Check-in unavailable"}
                </Button>
              </div>
            </form>

            {/* Boarding pass */}
            {checkedIn && (
              <div style={{ borderRadius: 16, overflow: "hidden",
                            boxShadow: "0 4px 24px rgba(91,18,55,0.15)",
                            border: `2px solid ${GOLD}` }}>

                {/* Header */}
                <div style={{ background: BURGUNDY, padding: "1.25rem 1.5rem",
                              display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: GOLD, fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.05em" }}>
                      KENYA AVIATION
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.65rem",
                                  letterSpacing: "0.12em", marginTop: 2 }}>
                      THE SPIRIT OF EAST AFRICA
                    </div>
                  </div>
                  <div style={{ background: GOLD, color: BURGUNDY, fontSize: "0.65rem",
                                fontWeight: 800, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.08em" }}>
                    {isReturn ? "RETURN BOARDING PASS" : "BOARDING PASS"}
                  </div>
                </div>

                {/* PNR — white */}
                <div style={{ background: BURGUNDY, paddingBottom: "1rem",
                              textAlign: "center", borderBottom: `3px solid ${GOLD}` }}>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.62rem", fontWeight: 700,
                                letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
                    Booking Reference
                  </div>
                  <div style={{ color: "#ffffff", fontSize: "2rem", fontWeight: 900, letterSpacing: "0.1em" }}>
                    {pnr}
                  </div>
                </div>

                {/* Segments — with dates */}
                <div style={{ background: "#fff", padding: "1rem 1.5rem" }}>
                  <SegmentRow step="1"
                    label={isReturn ? "Outbound flight" : "Flight"}
                    flight={selectedFlight}
                    date={outboundDate} />

                  {isReturn && (
                    <>
                      <div style={{ borderTop: `1px dashed ${GOLD}`, margin: "0.75rem 0" }} />
                      <SegmentRow step="2" label="Return flight"
                        flight={selectedReturnFlight}
                        date={returnDate} />
                    </>
                  )}
                </div>

                {/* Passengers */}
                <div style={{ background: "#fff", padding: "0 1.5rem 1rem",
                              borderTop: "1px solid #ede0f0" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 800, color: BURGUNDY,
                                textTransform: "uppercase", letterSpacing: "0.1em",
                                borderBottom: `2px solid ${GOLD}`, paddingBottom: "0.4rem",
                                marginBottom: "0.75rem", marginTop: "1rem" }}>
                    Passengers
                  </div>
                  {passengers.length === 0 ? (
                    <p style={{ color: "#888", fontSize: "0.85rem" }}>No passenger details found.</p>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                      <thead>
                        <tr style={{ background: "#fdf9fd" }}>
                          {["#","Name","Type","Document","Status"].map((h) => (
                            <th key={h} style={{ padding: "6px 8px", textAlign: "left",
                                                  fontSize: "0.6rem", fontWeight: 800, color: "#999",
                                                  textTransform: "uppercase", letterSpacing: "0.07em",
                                                  borderBottom: "1px solid #ede0f0" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {passengers.map((p, i) => (
                          <tr key={p.passengerKey || i}
                            style={{ background: i % 2 === 0 ? "#fff" : "#fdf9fd" }}>
                            <td style={{ padding: "7px 8px", color: "#aaa", fontSize: "0.75rem" }}>{i + 1}</td>
                            <td style={{ padding: "7px 8px", fontWeight: 700, color: "#222" }}>
                              {[p.title, p.firstName, p.lastName].filter(Boolean).join(" ") || "—"}
                            </td>
                            <td style={{ padding: "7px 8px", color: BURGUNDY, fontWeight: 600 }}>
                              {CATEGORY_LABELS[p.category || p.type] || "Adult"}
                            </td>
                            <td style={{ padding: "7px 8px", color: "#555" }}>
                              {p.documentType ? `${p.documentType}: ${p.documentNumber || "—"}` : "—"}
                            </td>
                            <td style={{ padding: "7px 8px" }}>
                              <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: "0.65rem",
                                             fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>
                                ✓ Checked in
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Barcode */}
                <div style={{ background: "#fdf9fd", padding: "0.85rem 1.5rem",
                              display: "flex", alignItems: "center", gap: "1.5rem",
                              borderTop: "1px solid #ede0f0" }}>
                  <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                    {[2,1,3,1,2,1,1,3,2,1,2,3,1,2,1,3,1,2].map((w, i) => (
                      <div key={i} style={{ width: w * 3, height: 44,
                                           background: i % 2 === 0 ? BURGUNDY : "transparent",
                                           borderRadius: 1 }} />
                    ))}
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "#aaa", letterSpacing: "0.15em" }}>
                    SCAN AT GATE • {pnr}
                  </div>
                </div>

                <div style={{ background: BURGUNDY, padding: "0.75rem 1.5rem", textAlign: "center" }}>
                  <div style={{ color: GOLD, fontSize: "0.65rem", letterSpacing: "0.1em" }}>
                    KENYA AVIATION • info@kenya-aviation.com • +254 20 827 0000
                  </div>
                </div>

                <div style={{ padding: "1rem 1.5rem", background: "#fff",
                              display: "flex", justifyContent: "flex-end" }}>
                  <Button onClick={() => downloadBoardingPass({
                    pnr,
                    outbound:     selectedFlight,
                    outboundDate: outboundDate,
                    inbound:      selectedReturnFlight || null,
                    inboundDate:  returnDate,
                    passengers,
                  })}>
                    ⬇ Download boarding pass
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="card summary-card" style={{ alignSelf: "flex-start" }}>
            <h3 style={{ color: BURGUNDY }}>Check-in information</h3>
            <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.6, marginBottom: "0.75rem" }}>
              Online check-in opens <strong>30 hours before departure</strong> and closes{" "}
              <strong>1 hour before departure</strong>. Ensure your documents match your booking.
            </p>
            {isReturn && (
              <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                This is a <strong>return trip</strong>. Your boarding pass covers both the
                outbound ({outboundDate}) and return ({returnDate}) flights.
              </p>
            )}
            {checkedIn && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: 8,
                            background: "#f0fdf4", border: "1px solid #86efac" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#166534" }}>
                  ✓ Check-in complete
                </div>
                <div style={{ fontSize: "0.75rem", color: "#555", marginTop: 3 }}>
                  Download or screenshot your boarding pass for the airport.
                </div>
              </div>
            )}
            <div className="summary-actions" style={{ marginTop: "1.25rem" }}>
              <Button variant="secondary" onClick={() => setPage("home")}>Back home</Button>
              <Button onClick={() => startNewBooking ? startNewBooking() : setPage("search")}>
                Book another flight
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
