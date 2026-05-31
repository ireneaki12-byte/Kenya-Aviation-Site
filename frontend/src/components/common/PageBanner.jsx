import React from "react";

export default function PageBanner({ eyebrow, title, text }) {
  return (
    <section className="page-banner">
      <div className="page-banner-content">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    </section>
  );
}