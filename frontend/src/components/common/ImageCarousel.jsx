import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    src: "/images/kev-city.jpg",
    title: "City connections",
    text: "Connect to business and leisure destinations with refined service."
  },
  {
    src: "/images/kev-seats.jpg",
    title: "Comfort on board",
    text: "Enjoy a calm cabin experience designed around your journey."
  },
  {
    src: "/images/kev-boarding.jpg",
    title: "Travel made seamless",
    text: "Move from booking to boarding with clear digital support."
  },
  {
    src: "/images/kev-mahali.jpg",
    title: "Inspired escapes",
    text: "Discover safari retreats, coastal beauty and regional getaways."
  }
];

export default function ImageCarousel() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  function next() {
    setIndex((current) => (current + 1) % slides.length);
  }

  function previous() {
    setIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  return (
    <section className="section showcase-section" aria-label="Kenya Aviation travel showcase">
      <div className="container">
        <div className="showcase-grid">
          <div>
            <div className="eyebrow">The Kenya Aviation experience</div>
            <h2>Designed for every journey</h2>
            <p className="showcase-copy">
              From premium cabin comfort to memorable destinations, Kenya Aviation brings travel planning, booking and support into one elegant digital experience.
            </p>
            <div className="carousel-actions" aria-label="Carousel controls">
              <button className="carousel-control" onClick={previous} aria-label="Previous image"><ChevronLeft size={20} /></button>
              <button className="carousel-control" onClick={next} aria-label="Next image"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="carousel-card">
            <img src={slide.src} alt={slide.title} className="carousel-image" />
            <div className="carousel-caption">
              <h3>{slide.title}</h3>
              <span>{slide.text}</span>
            </div>
            <div className="carousel-dots">
              {slides.map((item, itemIndex) => (
                <button
                  key={item.title}
                  onClick={() => setIndex(itemIndex)}
                  className={itemIndex === index ? "active" : ""}
                  aria-label={`Show ${item.title}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}