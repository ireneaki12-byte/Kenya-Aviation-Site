import { useEffect, useState } from "react";
import { Search, Plane, AlertCircle, RefreshCw, Users } from "lucide-react";
import { getAirports, searchFlights } from "../services/apiClient";

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function validatePassengers(p) {
  const adult = Number(p.adult || 0), child = Number(p.child || 0),
        infant = Number(p.infant || 0), unmr = Number(p.unmr || 0);
  if (adult + child < 1 && unmr < 1) return "Please add at least one adult passenger or one child travelling alone.";
  if (adult + child > 9)             return "Adults and children cannot exceed 9 passengers on one booking.";
  if (infant > 0 && adult < 1)       return "An infant cannot travel without an adult on the booking.";
  if (infant > adult)                return "The number of infants cannot exceed the number of adults.";
  return "";
}

const defaultSearchState = {
  tripType: "one-way", origin: "", destination: "",
  departureDate: todayDate(), returnDate: "",
  passengers: { adult: 1, child: 0, infant: 0, unmr: 0 },
};

export default function FlightSearch({
  search, setSearch,
  setResults, setReturnResults,
  setSelectedFlight, setSelectedReturnFlight,
  setPage,
}) {
  const [airports,        setAirports]        = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(true);
  const [airportError,    setAirportError]    = useState("");
  const [localSearch,     setLocalSearch]     = useState(search || defaultSearchState);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");

  async function loadAirports() {
    try {
      setAirportsLoading(true);
      setAirportError("");
      const data        = await getAirports();
      const airportList = data.airports || [];
      if (!airportList.length) {
        setAirportError("No airports returned. Make sure the database is seeded.");
        return;
      }
      setAirports(airportList);
      setLocalSearch((c) => ({
        ...c,
        origin:      c.origin      || airportList[0]?.code || "",
        destination: c.destination || airportList[1]?.code || "",
      }));
    } catch {
      setAirportError("Could not load airports — start the backend with: uvicorn app.main:app --reload");
    } finally {
      setAirportsLoading(false);
    }
  }

  useEffect(() => { loadAirports(); }, []); // eslint-disable-line
  useEffect(() => { if (setSearch) setSearch(localSearch); }, [localSearch, setSearch]);

  const update  = (f, v) => setLocalSearch((c) => ({ ...c, [f]: v }));
  const updateP = (f, v) => setLocalSearch((c) => ({ ...c, passengers: { ...c.passengers, [f]: Number(v) } }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!localSearch.origin)                            { setError("Please select your origin.");         return; }
    if (!localSearch.destination)                       { setError("Please select your destination.");    return; }
    if (localSearch.origin === localSearch.destination) { setError("Origin and destination cannot be the same."); return; }
    if (!localSearch.departureDate)                     { setError("Please select your departure date."); return; }
    if (localSearch.tripType === "return" && (!localSearch.returnDate || localSearch.returnDate < localSearch.departureDate))
                                                        { setError("Please select a valid return date."); return; }
    const pErr = validatePassengers(localSearch.passengers);
    if (pErr) { setError(pErr); return; }

    try {
      setLoading(true);
      const data = await searchFlights({
        trip_type:      localSearch.tripType,
        origin:         localSearch.origin,
        destination:    localSearch.destination,
        departure_date: localSearch.departureDate,
        return_date:    localSearch.tripType === "return" ? localSearch.returnDate : null,
        passengers: {
          adult:  Number(localSearch.passengers.adult  || 0),
          child:  Number(localSearch.passengers.child  || 0),
          infant: Number(localSearch.passengers.infant || 0),
          unmr:   Number(localSearch.passengers.unmr   || 0),
        },
      });

      const flights       = data.flights       || [];
      const returnFlights = data.return_flights || [];

      if (!flights.length) {
        setResults([]);
        setSelectedFlight(null);
        setError("No outbound flights found for this route. Please try another route.");
        return;
      }

      setResults(flights);
      setSelectedFlight(flights[0]);

      // Store return-leg flights (empty array for one-way)
      setReturnResults(returnFlights);
      setSelectedReturnFlight(returnFlights[0] || null);

      if (setPage) setPage("results");
    } catch {
      setError("Unable to retrieve flights. Please check the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }

  function AirportSelect({ field, label }) {
    return (
      <label className="form-field">
        <span>{label}</span>
        {airportsLoading ? (
          <select disabled><option>Loading airports…</option></select>
        ) : airportError ? (
          <select disabled><option>— airports unavailable —</option></select>
        ) : (
          <select value={localSearch[field]} onChange={(e) => update(field, e.target.value)}>
            {airports.map((a) => (
              <option key={a.code} value={a.code}>{a.city} ({a.code}) — {a.name}</option>
            ))}
          </select>
        )}
      </label>
    );
  }

  return (
    <main className="page-shell">
      <section className="booking-panel">
        <div className="booking-panel-header">
          <div><p className="eyebrow">Book a flight</p><h2>Where would you like to go?</h2></div>
          <Plane className="panel-icon" size={34} />
        </div>

        {airportError && (
          <div className="form-alert" style={{ marginBottom: "1rem", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={18} /><span>{airportError}</span>
            </div>
            <button type="button" onClick={loadAirports}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.85rem",
                       borderRadius: 6, border: "1.5px solid #5b1237", background: "#fff",
                       color: "#5b1237", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flight-search-form">
          <div className="trip-type-tabs">
            {[["one-way","One-way"],["return","Return"]].map(([type, label]) => (
              <button key={type} type="button"
                className={localSearch.tripType === type ? "trip-tab active" : "trip-tab"}
                onClick={() => update("tripType", type)}>{label}</button>
            ))}
          </div>

          <div className="form-grid">
            <AirportSelect field="origin"      label="From" />
            <AirportSelect field="destination" label="To"   />
            <label className="form-field">
              <span>Departure date</span>
              <input type="date" min={todayDate()} value={localSearch.departureDate}
                onChange={(e) => update("departureDate", e.target.value)} />
            </label>
            <label className="form-field">
              <span>Return date</span>
              <input type="date" min={localSearch.departureDate || todayDate()}
                value={localSearch.returnDate} disabled={localSearch.tripType !== "return"}
                onChange={(e) => update("returnDate", e.target.value)} />
            </label>
          </div>

          <div className="passenger-box">
            <div className="passenger-box-title">
              <Users size={20} />
              <div><h3>Passengers</h3><p>Select the number and type of travellers.</p></div>
            </div>
            <div className="passenger-grid">
              {[["adult","Adults (16+ yrs)"],["child","Children (2–15 yrs)"],["infant","Infants (under 2 yrs)"],["unmr","Children travelling alone"]].map(([f, l]) => (
                <label key={f} className="form-field">
                  <span>{l}</span>
                  <input type="number" min="0" max="9" value={localSearch.passengers[f]}
                    onChange={(e) => updateP(f, e.target.value)} />
                </label>
              ))}
            </div>
          </div>

          {error && <div className="form-alert"><AlertCircle size={18} /><span>{error}</span></div>}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={loading || airportsLoading || !!airportError}>
              <Search size={18} />{loading ? "Searching…" : "Search flights"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
