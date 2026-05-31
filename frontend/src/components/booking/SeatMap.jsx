import React from "react";

const BLOCKED  = new Set(["1A","1B","2C","3D","5A","7F","8C"]);
const ROWS     = Array.from({ length: 8 }, (_, i) => i + 1);
const LEFT     = ["A","B","C"];
const RIGHT    = ["D","E","F"];
const BURGUNDY = "#5b1237";
const GOLD     = "#c4a045";
const SEAT_SIZE = 44;
const GRID      = `28px repeat(3,${SEAT_SIZE}px) 32px repeat(3,${SEAT_SIZE}px)`;

const hdr = {
  fontSize: "0.7rem", fontWeight: 800, color: "#999",
  textAlign: "center", letterSpacing: "0.05em",
};

function SeatBtn({ id, seat, setSeat }) {
  const status = BLOCKED.has(id) ? "unavailable" : id === seat ? "selected" : "available";
  const look = {
    available:   { background: "#fff",    color: BURGUNDY, border: `1.5px solid ${BURGUNDY}`, cursor: "pointer"     },
    selected:    { background: BURGUNDY,  color: "#fff",   border: `1.5px solid ${BURGUNDY}`, cursor: "pointer"     },
    unavailable: { background: "#f1f5f9", color: "#b0bec5", border: "1.5px solid #e2e8f0",    cursor: "not-allowed" },
  }[status];

  return (
    <button type="button" disabled={status === "unavailable"}
      onClick={() => setSeat(id)} title={status === "unavailable" ? `${id} — Unavailable` : id}
      style={{ width: SEAT_SIZE, height: SEAT_SIZE, borderRadius: 8,
               fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.03em",
               transition: "transform 0.12s, box-shadow 0.12s", ...look }}
      onMouseEnter={(e) => {
        if (status !== "unavailable") {
          e.currentTarget.style.transform = "scale(1.12)";
          e.currentTarget.style.boxShadow = `0 2px 8px ${BURGUNDY}44`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >{id}</button>
  );
}

export default function SeatMap({ seat, setSeat }) {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h3 style={{ color: BURGUNDY, marginBottom: "0.25rem", textAlign: "center" }}>
        Select your seat
      </h3>

      {seat && (
        <p style={{ fontSize: "0.82rem", color: GOLD, fontWeight: 700,
                    marginBottom: "1rem", textAlign: "center" }}>
          Selected: <strong>{seat}</strong>
        </p>
      )}

      {/* ── Centring wrapper — fills card width, centres the inner grid ─── */}
      <div style={{
        display:         "flex",
        justifyContent:  "center",   /* centres the inner grid horizontally */
        width:           "100%",
        overflowX:       "auto",     /* allows horizontal scroll on small screens */
        background:      "#faf7fb",
        border:          "1px solid #ede0f0",
        borderRadius:    16,
        padding:         "1.25rem 1.5rem",
        boxSizing:       "border-box",
      }}>

        {/* Inner grid — fit-content so it never stretches and centring is exact */}
        <div style={{ width: "fit-content" }}>

          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: GRID,
                        gap: 6, marginBottom: 8, alignItems: "center" }}>
            <span />
            {LEFT.map(l  => <span key={l}  style={hdr}>{l}</span>)}
            <span style={{ ...hdr, color: "#ccc", fontSize: "0.6rem" }}>✈</span>
            {RIGHT.map(r => <span key={r}  style={hdr}>{r}</span>)}
          </div>

          {/* Seat rows */}
          {ROWS.map(row => (
            <div key={row} style={{ display: "grid", gridTemplateColumns: GRID,
                                    gap: 6, marginBottom: 6, alignItems: "center" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#999",
                             textAlign: "right", paddingRight: 4 }}>{row}</span>
              {LEFT.map(l  => <SeatBtn key={`${row}${l}`} id={`${row}${l}`} seat={seat} setSeat={setSeat} />)}
              <span />
              {RIGHT.map(r => <SeatBtn key={`${row}${r}`} id={`${row}${r}`} seat={seat} setSeat={setSeat} />)}
            </div>
          ))}

          {/* Legend */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem",
                        paddingTop: "0.75rem", borderTop: "1px solid #ede0f0",
                        justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { bg: "#fff",    border: `1.5px solid ${BURGUNDY}`, label: "Available" },
              { bg: BURGUNDY,  border: `1.5px solid ${BURGUNDY}`, label: "Selected"  },
              { bg: "#f1f5f9", border: "1.5px solid #e2e8f0",     label: "Taken"     },
            ].map(({ bg, border, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, background: bg,
                               border, display: "inline-block" }} />
                <span style={{ fontSize: "0.72rem", color: "#555" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
