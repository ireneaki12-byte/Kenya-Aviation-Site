import React from "react";
export default function Button({ children, variant = "primary", ...props }) {
  return <button {...props} className={`btn btn-${variant} ${props.className || ""}`}>{children}</button>;
}
