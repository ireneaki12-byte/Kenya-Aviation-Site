import React from "react";
import Field from "../common/Field.jsx";
export function validatePassengers(passengers) {
  const adult = Number(passengers.adult || 0), child = Number(passengers.child || 0), infant = Number(passengers.infant || 0), unmr = Number(passengers.unmr || 0);
  if (adult + child < 1 && unmr < 1) return "Add at least one adult/child or one child travelling alone.";
  if (adult + child > 9) return "Adults and children cannot exceed 9 passengers.";
  if (infant > 0 && adult < 1) return "An infant cannot travel without an adult.";
  if (infant > adult) return "Infants cannot exceed adults.";
  return "";
}
export default function PassengerSelector({ passengers, onChange }) {
  return <div className="grid grid-4">
    {[ ["Adults", "adult"], ["Children", "child"], ["Infants", "infant"], ["Children alone", "unmr"] ].map(([label, key]) => (
      <Field key={key} label={label}><input className="input" type="number" min="0" max="9" value={passengers[key]} onChange={(e) => onChange({ ...passengers, [key]: Number(e.target.value) })} /></Field>
    ))}
  </div>;
}
