import React from "react";
import { Plane, Bot } from "lucide-react";
import Button from "../components/common/Button.jsx";
import ImageCarousel from "../components/common/ImageCarousel.jsx";
import DestinationGallery from "../components/common/DestinationGallery.jsx";

export default function Home({ setPage, openChat }) {
  return (
    <main>
      <section className="hero kev-hero">
        <div className="hero-backdrop" />

        <div className="container hero-grid">
          <div className="hero-content">
            <div className="eyebrow">Premium air travel</div>

            <h1>Kenya Aviation</h1>

            <p>
              Search flights, compare fares, customize your journey, check in
              online and receive travel assistance through chat or voice.
            </p>

            <div className="hero-actions">
              <Button onClick={() => setPage("search")}>Book a flight</Button>

              <Button variant="gold" onClick={() => setPage("checkin")}>
                Check in
              </Button>

              <Button variant="secondary" onClick={openChat}>
                Travel assistant
              </Button>
            </div>
          </div>

          <div className="hero-card card hero-card-aircraft-only">
            <img
              src="/images/kev-aircraft.jpg"
              alt="Kenya Aviation aircraft"
              className="hero-aircraft-full"
            />

            <div className="hero-card-caption">
              <span>
                Elegant journeys. Seamless bookings. Memorable African skies.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section home-features">
        <div className="container grid grid-2">
          {[
            [
              Plane,
              "Flight booking",
              "Search one-way and return flights with clear fare options.",
              () => setPage("search"),
            ],
            [
              Bot,
              "Travel assistant",
              "Use chat or voice to search flights and get policy guidance.",
              openChat,
            ],
          ].map(([Icon, title, text, action]) => (
            <button
              className="card feature-card"
              key={title}
              onClick={action}
              type="button"
            >
              <Icon color="#5b1237" />
              <h3>{title}</h3>
              <p>{text}</p>
            </button>
          ))}
        </div>
      </section>

      <ImageCarousel />

      <DestinationGallery />
    </main>
  );
}
