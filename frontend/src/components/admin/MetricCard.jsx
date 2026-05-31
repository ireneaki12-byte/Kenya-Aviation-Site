import React from "react";
export default function MetricCard({ icon: Icon, label, value }) {
  return <div className="card"><Icon color="#5b1237" /><p style={{ color: "#64748b" }}>{label}</p><h2>{value}</h2></div>;
}
