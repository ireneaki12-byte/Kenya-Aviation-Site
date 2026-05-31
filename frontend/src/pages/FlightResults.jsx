import React, { useEffect, useState } from "react";
import PageTitle    from "../components/common/PageTitle.jsx";
import ProgressSteps from "../components/common/ProgressSteps.jsx";
import FlightCard   from "../components/booking/FlightCard.jsx";
import FareSelector from "../components/booking/FareSelector.jsx";
import Button       from "../components/common/Button.jsx";
import { getFlightFares } from "../services/apiClient";

const BURGUNDY = "#5b1237";
const GOLD     = "#c4a045";

function SectionHeader({ step, label, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem",
                  margin: "1.25rem 0 0.75rem", paddingBottom: "0.5rem",
                  borderBottom: `2px solid ${GOLD}` }}>
      <span style={{ background: BURGUNDY, color: "#fff", borderRadius: "50%",
                     width: 26, height: 26, display: "flex", alignItems: "center",
                     justifyContent: "center", fontWeight: 800, fontSize: "0.78rem",
                     flexShrink: 0 }}>{step}</span>
      <div>
        <div style={{ fontWeight: 800, color: BURGUNDY, fontSize: "0.95rem" }}>{label}</div>
        {subtitle && <div style={{ fontSize: "0.75rem", color: "#777" }}>{subtitle}</div>}
      </div>
    </div>
  );
}

export default function FlightResults({
  search,
  results       = [],
  returnResults = [],
  selectedFlight,       setSelectedFlight,
  selectedReturnFlight, setSelectedReturnFlight,
  selectedFare,         setSelectedFare,
  setPage,
}) {
  const isReturn    = search?.tripType === "return";
  const [fares,      setFares]      = useState([]);
  const [fareError,  setFareError]  = useState("");
  const [loadingFares, setLoadingFares] = useState(false);

  useEffect(() => {
    async function loadFares() {
      if (!selectedFlight?.id) { setFares([]); return; }
      try {
        setLoadingFares(true);
        setFareError("");
        const res      = await getFlightFares(selectedFlight.id);
        const fareList = res.fares || [];
        setFares(fareList);
        if (fareList.length > 0) setSelectedFare(fareList[0]);
      } catch {
        setFareError("Unable to retrieve fare options for this flight.");
        setFares([]);
      } finally {
        setLoadingFares(false);
      }
    }
    loadFares();
  }, [selectedFlight?.id, setSelectedFare]);

  if (!results.length) {
    return (
      <main className="section">
        <div className="container">
          <ProgressSteps current={1} />
          <PageTitle eyebrow="Flight selection" title="No flights found"
            text="We could not find available flights for your selected route. Please edit your search and try again." />
          <div className="card">
            <Button onClick={() => setPage("search")} variant="secondary">Edit search</Button>
          </div>
        </div>
      </main>
    );
  }

  const canContinue = selectedFlight && selectedFare && (!isReturn || selectedReturnFlight);

  return (
    <main className="section">
      <div className="container">
        <ProgressSteps current={1} />
        <PageTitle eyebrow="Flight selection" title="Choose your flights"
          text={isReturn
            ? "Select your outbound flight, then your return flight, then choose a fare."
            : "Compare available flights, review fare benefits and continue your booking."} />

        <div className="booking-layout">
          <section className="flight-results-column">

            {/* ── Outbound ─────────────────────────────────────────── */}
            <SectionHeader
              step="1"
              label={`Outbound — ${search?.origin || ""} → ${search?.destination || ""}`}
              subtitle={search?.departureDate}
            />
            {results.map((flight) => (
              <FlightCard key={flight.id} flight={flight}
                selected={selectedFlight} onSelect={setSelectedFlight} />
            ))}

            {/* ── Return ───────────────────────────────────────────── */}
            {isReturn && (
              <>
                <SectionHeader
                  step="2"
                  label={`Return — ${search?.destination || ""} → ${search?.origin || ""}`}
                  subtitle={search?.returnDate}
                />
                {returnResults.length === 0 ? (
                  <div className="alert" style={{ marginBottom: "0.75rem" }}>
                    No return flights available for this route.
                  </div>
                ) : (
                  returnResults.map((flight) => (
                    <FlightCard key={flight.id} flight={flight}
                      selected={selectedReturnFlight} onSelect={setSelectedReturnFlight} />
                  ))
                )}
              </>
            )}

            {/* ── Fare ─────────────────────────────────────────────── */}
            <SectionHeader
              step={isReturn ? "3" : "2"}
              label="Fare package"
              subtitle="One fare applies to all legs of the journey."
            />
            <div className="card fare-section" style={{ padding: "1rem" }}>
              {loadingFares && <div className="alert">Retrieving fare options…</div>}
              {fareError   && <div className="alert alert-danger">{fareError}</div>}
              {!loadingFares && !fareError && (
                <FareSelector fare={selectedFare} setFare={setSelectedFare} fares={fares} />
              )}
            </div>
          </section>

          {/* ── Sidebar ───────────────────────────────────────────── */}
          <aside className="card summary-card">
            <h3>Search summary</h3>
            <p><strong>Route:</strong> {search?.origin} → {search?.destination}</p>
            {isReturn && (
              <p><strong>Return:</strong> {search?.destination} → {search?.origin}</p>
            )}
            <p><strong>Outbound date:</strong> {search?.departureDate || "—"}</p>
            {isReturn && (
              <p><strong>Return date:</strong> {search?.returnDate || "—"}</p>
            )}

            {selectedFlight && (
              <>
                <hr />
                <p style={{ fontWeight: 700, color: BURGUNDY, fontSize: "0.82rem", marginBottom: 2 }}>Outbound</p>
                <p>{selectedFlight.flight_number} · {selectedFlight.departure_time} → {selectedFlight.arrival_time}</p>
              </>
            )}

            {isReturn && selectedReturnFlight && (
              <>
                <p style={{ fontWeight: 700, color: BURGUNDY, fontSize: "0.82rem", margin: "0.5rem 0 2px" }}>Return</p>
                <p>{selectedReturnFlight.flight_number} · {selectedReturnFlight.departure_time} → {selectedReturnFlight.arrival_time}</p>
              </>
            )}

            {selectedFare && (
              <p style={{ marginTop: "0.4rem" }}><strong>Fare:</strong> {selectedFare.name}</p>
            )}

            {isReturn && !canContinue && (
              <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.8rem", borderRadius: 8,
                            background: "#fffbeb", border: `1px solid ${GOLD}`,
                            fontSize: "0.78rem", color: "#555" }}>
                Please select both an outbound and a return flight to continue.
              </div>
            )}

            <div className="summary-actions" style={{ marginTop: "1rem" }}>
              <Button onClick={() => setPage("search")} variant="secondary">Edit search</Button>
              <Button disabled={!canContinue} onClick={() => setPage("passengers")}>Continue</Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
