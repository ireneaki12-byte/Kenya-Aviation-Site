import React from "react";
import { Plane } from "lucide-react";
import { useMoney } from "../../hooks/useMoney.js";
export default function FlightCard({ flight, selected, onSelect }) {
  const money = useMoney();
  return <button className={`card flight-card ${selected?.id === flight.id ? "selected" : ""}`} onClick={() => onSelect(flight)}>
    <div className="grid grid-3" style={{ alignItems: "center" }}>
      <div><strong style={{ color: "#5b1237" }}><Plane size={16} /> {flight.flight_number}</strong><p>{flight.origin} to {flight.destination}</p></div>
      <div><strong>{flight.departure_time} → {flight.arrival_time}</strong><p style={{ color: "#64748b" }}>{flight.duration}</p></div>
      <div style={{ textAlign: "right" }}><p style={{ color: "#64748b" }}>From</p><h3>{money(flight.basic_fare)}</h3><small>{flight.seats_available} seats left</small></div>
    </div>
  </button>;
}
