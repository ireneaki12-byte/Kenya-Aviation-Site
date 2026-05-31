import React from "react";
const steps = ["Search", "Flights", "Passenger", "Add-ons", "Summary", "Payment", "Confirm"];
export default function ProgressSteps({ current = 0 }) {
  return <div className="card" style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
    {steps.map((s, i) => <span key={s} className="pill" style={{ background: i <= current ? "#5b1237" : "white", color: i <= current ? "white" : "#5b1237" }}>{s}</span>)}
  </div>;
}
