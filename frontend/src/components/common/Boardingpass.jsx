import React, { useRef } from "react";

// ── Theme ─────────────────────────────────────────────────────────────────────
const BURGUNDY   = "#6B1E2E";
const DARK_BURG  = "#4A1520";
const GOLD       = "#C9A84C";
const LIGHT_GOLD = "#FBF7ED";
const WHITE      = "#FFFFFF";
const GRAY       = "#555555";

const CATEGORY_LABELS = {
  adult: "Adult", child: "Child", infant: "Infant", um: "Unaccompanied Minor",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function subtractMins(time, mins) {
  if (!time || !time.includes(":")) return "—";
  const [h, m] = time.split(":").map(Number);
  const total   = h * 60 + m - mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Decorative QR pattern (CSS) ───────────────────────────────────────────────
function QRPattern({ size = 56 }) {
  const pattern = [
    [1,1,1,1,1,1,1,0,0,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,0,1,1,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,1,0,1,1,0,1],
    [1,0,1,1,1,0,1,1,0,0,1,0,0,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,0,0,1,1,0,1],
    [1,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    [1,0,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1],
    [0,1,0,1,0,0,1,1,0,1,1,0,1,0,0,1,0],
    [1,1,0,0,1,0,1,0,1,0,1,1,0,1,0,0,1],
    [0,0,1,0,0,0,0,1,1,1,0,0,1,0,1,1,0],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,0,0,1],
    [1,0,0,0,0,0,1,1,0,1,0,1,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,0,1,0],
    [1,0,0,0,0,0,1,1,0,0,1,1,0,1,1,0,1],
    [1,1,1,1,1,1,1,0,1,0,0,1,1,0,1,1,0],
  ];
  const cell = size / pattern.length;
  return (
    <div style={{ width: size, height: size, background: WHITE, padding: 2, flexShrink: 0 }}>
      {pattern.map((row, ri) => (
        <div key={ri} style={{ display: "flex" }}>
          {row.map((v, ci) => (
            <div key={ci} style={{ width: cell, height: cell, background: v ? DARK_BURG : WHITE }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Decorative barcode ────────────────────────────────────────────────────────
function Barcode({ width = 160, height = 30 }) {
  const bars  = [3,1,2,1,3,2,1,1,2,3,1,2,1,4,1,1,3,2,1,3,1,2,4,1,2,1,3,1,2,3,1,4,2,1,2,1,3];
  const total = bars.reduce((s, b) => s + b * 2.2, 0);
  const scale = width / total;
  let cx = 0;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {bars.map((w, i) => {
        const bw = w * 2.2 * scale;
        const el = i % 2 === 0
          ? <rect key={i} x={cx} y={0} width={bw} height={height} fill={DARK_BURG} />
          : null;
        cx += bw;
        return el;
      })}
    </svg>
  );
}

// ── Single boarding pass card ─────────────────────────────────────────────────
function PassCard({ booking, flight, fare, pax, paxIndex }) {
  const boarding  = subtractMins(flight?.departure_time, 45);
  const gateClose = subtractMins(flight?.departure_time, 20);
  const zone      = fare?.id === "fare-plus" ? "A" : "D";
  const fareLabel = fare?.id === "fare-plus" ? "FLEX PLUS" : "ECONOMY";
  const seat      = booking?.addons?.seats?.[paxIndex] || booking?.addons?.seat || "—";
  const fullName  = [pax?.lastName?.toUpperCase(), "/", pax?.firstName?.toUpperCase(), pax?.title].filter(Boolean).join(" ");

  const InfoCol = ({ label, value, large = true }) => (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: large ? 20 : 8, fontWeight: 800, color: DARK_BURG, lineHeight: 1.1 }}>{value}</div>
    </div>
  );

  const BookingRow = ({ label, value }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 8, fontWeight: 700, color: BURGUNDY, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: DARK_BURG }}>{value}</div>
    </div>
  );

  const NextStep = ({ icon, title, body }) => (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 8, fontWeight: 700, color: BURGUNDY, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 7.5, color: GRAY, lineHeight: 1.4 }}>{body}</div>
    </div>
  );

  return (
    <div style={{
      border: `2px solid ${GOLD}`, borderRadius: 12,
      overflow: "hidden", background: WHITE,
      boxShadow: "0 6px 28px rgba(107,30,46,0.15)",
      fontFamily: "Arial, Helvetica, sans-serif",
      maxWidth: 620,
    }}>

      {/* ── Header bar ── */}
      <div style={{ background: BURGUNDY, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: GOLD, fontWeight: 900, fontSize: 20, letterSpacing: "0.04em" }}>KENYA AVIATION</div>
          <div style={{ color: WHITE, fontSize: 8, letterSpacing: "0.1em", opacity: 0.85, marginTop: 1 }}>THE SPIRIT OF EAST AFRICA</div>
          <div style={{ color: WHITE, fontSize: 7, opacity: 0.65, marginTop: 1 }}>www.kenya-aviation.com</div>
        </div>
        <QRPattern size={56} />
      </div>

      {/* ── Passenger name + priority ── */}
      <div style={{ background: LIGHT_GOLD, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1.5px solid ${GOLD}` }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Boarding Pass</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: BURGUNDY }}>{fullName}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ background: BURGUNDY, color: GOLD, fontWeight: 700, fontSize: 8, padding: "3px 8px", borderRadius: 4, marginBottom: 4 }}>SKY PRIORITY</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: BURGUNDY }}>ZONE: {zone}</div>
        </div>
      </div>

      {/* ── Flight info grid ── */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: BURGUNDY, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Flight Information</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1.1fr 1.2fr", gap: "0 8px", paddingBottom: 10, borderBottom: `1px solid ${GOLD}`, marginBottom: 10 }}>
          <InfoCol label="Flight"        value={flight?.flight_number || "—"} />
          <InfoCol label="Seat"          value={seat} />
          <InfoCol label="Boarding Time" value={boarding} />
          <InfoCol label="Gate"          value="CHECK SCREENS" large={false} />
          <InfoCol label="Gate Closing"  value={gateClose} />
        </div>

        {/* Route */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 8, fontWeight: 700, color: GOLD }}>FROM</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: DARK_BURG }}>{(flight?.origin || "—").toUpperCase()}</span>
          <span style={{ color: GOLD, fontWeight: 700, fontSize: 16, margin: "0 4px" }}>→</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: GOLD }}>TO</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: DARK_BURG }}>{(flight?.destination || "—").toUpperCase()}</span>
        </div>

        {/* Departure / arrival timeline */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <div style={{ minWidth: 80 }}>
            <div style={{ fontSize: 8, color: GRAY, marginBottom: 2 }}>Departure</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: DARK_BURG }}>{formatDate(flight?.departure_date) || flight?.departure_date || "—"}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: DARK_BURG }}>{flight?.departure_time || "—"}</div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", margin: "0 8px" }}>
            <div style={{ flex: 1, height: 1, background: GOLD }} />
            <span style={{ fontSize: 18, margin: "0 4px" }}>✈</span>
            <div style={{ flex: 1, height: 1, background: GOLD }} />
          </div>
          <div style={{ minWidth: 80, textAlign: "right" }}>
            <div style={{ fontSize: 8, color: GRAY, marginBottom: 2 }}>Arrival</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: DARK_BURG }}>{formatDate(flight?.arrival_date) || flight?.arrival_date || "—"}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: DARK_BURG }}>{flight?.arrival_time || "—"}</div>
          </div>
        </div>
      </div>

      {/* ── Travel info + booking details (2-col) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", borderTop: `1.5px solid ${LIGHT_GOLD}` }}>
        <div style={{ padding: "10px 16px" }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: BURGUNDY, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Travel Information</div>
          <div style={{ fontSize: 7.5, fontWeight: 700, color: BURGUNDY, marginBottom: 2 }}>Travel documents</div>
          <div style={{ fontSize: 7.5, color: GRAY, lineHeight: 1.45, marginBottom: 8, maxWidth: 240 }}>
            The passenger is responsible for the validity of their passport and travel documents. Please verify required travel and health documentation for your destination.
          </div>
          <div style={{ fontSize: 7.5, fontWeight: 700, color: BURGUNDY, marginBottom: 2 }}>Contact Information</div>
          <div style={{ fontSize: 7.5, color: GRAY }}>Tel: +254 20 827 0000 &nbsp;|&nbsp; info@kenya-aviation.com</div>
        </div>

        <div style={{ padding: "10px 14px", background: LIGHT_GOLD, borderLeft: `1.5px solid ${GOLD}`, minWidth: 148 }}>
          <BookingRow label="Booking class"     value="Y" />
          <BookingRow label="Class of travel"   value={fareLabel} />
          <BookingRow label="Booking reference" value={booking?.bookingReference || "—"} />
          <BookingRow label="Ticket number"     value={booking?.ticketNumber || booking?.bookingReference || "—"} />
        </div>
      </div>

      {/* ── Next steps ── */}
      <div style={{ background: LIGHT_GOLD, borderTop: `1.5px solid ${GOLD}`, padding: "10px 16px" }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: BURGUNDY, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Next Steps</div>
        <div style={{ display: "flex", gap: 0 }}>
          <NextStep icon="🕐" title="Plan arrival"   body="Allow enough time for security control checks, baggage check-in and boarding." />
          <div style={{ width: 1, background: GOLD, margin: "0 12px" }} />
          <NextStep icon="🧳" title="Baggage drop"   body="Take your baggage to the Baggage Drop desk at least 45 minutes before departure." />
          <div style={{ width: 1, background: GOLD, margin: "0 12px" }} />
          <NextStep icon="👜" title="Carry-on only"  body="Proceed to gate when you have carry-on bag only and required boarding passes." />
        </div>
      </div>

      {/* ── Barcode footer ── */}
      <div style={{ background: WHITE, borderTop: `1.5px solid ${GOLD}`, padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Barcode width={140} height={28} />
        <div style={{ fontSize: 9, fontWeight: 700, color: DARK_BURG, letterSpacing: "0.12em" }}>
          {booking?.bookingReference || "—"}
        </div>
        <Barcode width={100} height={28} />
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export default function BoardingPass({ booking, selectedFlight, passengerDetails, selectedFare, addons }) {
  const printRef = useRef(null);

  const passengers = Array.isArray(passengerDetails) && passengerDetails.length > 0
    ? passengerDetails.filter((p) => p.category !== "infant")
    : passengerDetails
    ? [passengerDetails]
    : [{}];

  const bookingWithAddons = { ...booking, addons };

  function handlePrint() {
    const el = printRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=700,height=900");
    win.document.write(`
      <!DOCTYPE html><html>
      <head>
        <title>Kenya Aviation Boarding Pass — ${booking?.bookingReference || ""}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #fff; padding: 20px; font-family: Arial, Helvetica, sans-serif; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${el.innerHTML}</body>
      </html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  }

  return (
    <div>
      {/* Action bar */}
      <div className="card form-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ color: BURGUNDY, margin: 0 }}>Your boarding pass{passengers.length > 1 ? "es" : ""}</h3>
          <p style={{ fontSize: "0.82rem", color: GRAY, marginTop: "0.2rem" }}>
            {passengers.length} passenger{passengers.length > 1 ? "s" : ""} · {selectedFlight?.origin} → {selectedFlight?.destination}
          </p>
        </div>
        <button
          onClick={handlePrint}
          style={{
            padding: "0.45rem 1.2rem",
            background: BURGUNDY, color: WHITE,
            border: "none", borderRadius: 6,
            fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
          }}
        >
          ⬇ Download / Print
        </button>
      </div>

      {/* Pass cards — one per passenger */}
      <div ref={printRef} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {passengers.map((pax, i) => (
          <PassCard
            key={pax.passengerKey || i}
            booking={bookingWithAddons}
            flight={selectedFlight}
            fare={selectedFare}
            pax={pax}
            paxIndex={i}
          />
        ))}
      </div>
    </div>
  );
}
