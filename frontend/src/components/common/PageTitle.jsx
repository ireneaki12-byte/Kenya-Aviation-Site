import React from "react";
export default function PageTitle({ eyebrow, title, text }) {
  return <div style={{ marginBottom: "1.5rem" }}><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{text && <p style={{ color: "#64748b", maxWidth: 720 }}>{text}</p>}</div>;
}
