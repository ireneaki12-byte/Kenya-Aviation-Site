import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useMoney } from "../../hooks/useMoney.js";

const DEFAULT_FARES = [
  {
    id: "basic",
    name: "Basic",
    amount: 0,
    items: [
      "10kg cabin baggage",
      "Seat selection at a fee",
      "Standard change rules apply",
    ],
  },
  {
    id: "fare-plus",
    name: "Fare Plus+",
    amount: 0,
    items: [
      "10kg cabin + 23kg hold baggage",
      "Free standard seat selection",
      "First change fee waived; fare difference applies",
    ],
  },
];

export default function FareSelector({ fare, setFare, fares = DEFAULT_FARES }) {
  const money = useMoney();

  const selectedFareId = typeof fare === "string" ? fare : fare?.id;

  if (!fares.length) {
    return (
      <div className="alert">
        Fare options are not available for the selected flight.
      </div>
    );
  }

  return (
    <div className="grid grid-2">
      {fares.map((fareOption) => {
        const isSelected = selectedFareId === fareOption.id;

        return (
          <button
            key={fareOption.id}
            type="button"
            className={`card fare-card ${isSelected ? "selected" : ""}`}
            onClick={() => setFare(fareOption)}
          >
            <div className="fare-card-header">
              <div>
                <p className="eyebrow">Fare option</p>
                <h3>{fareOption.name}</h3>
              </div>

              {Number(fareOption.amount) > 0 && (
                <h2>{money(fareOption.amount)}</h2>
              )}
            </div>

            <div className="fare-benefits">
              {(fareOption.items || []).map((item) => (
                <p key={item} className="fare-benefit">
                  <CheckCircle2 size={16} color="#5b1237" />
                  <span>{item}</span>
                </p>
              ))}
            </div>

            <div className="fare-action">
              {isSelected ? "Selected" : "Select fare"}
            </div>
          </button>
        );
      })}
    </div>
  );
}