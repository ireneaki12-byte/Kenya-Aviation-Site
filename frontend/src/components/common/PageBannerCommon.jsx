import React from "react";

export default function PageBannerCommon({ eyebrow, title, text }) {
  return (
    <section className="search-hero page-banner">
      <div className="search-hero-content">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h1>{title}</h1>}
        {text && <p>{text}</p>}
      </div>
    </section>
  );
}