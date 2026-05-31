import React, { useState } from "react";
import ProgressSteps from "../components/common/ProgressSteps.jsx";
import Button from "../components/common/Button.jsx";
import PageBanner from "../components/common/PageBanner.jsx";

// ── Theme ─────────────────────────────────────────────────────────────────────
const BURGUNDY = "#6B1E2E";
const DARK_BURGUNDY = "#4A1520";
const GOLD = "#C9A84C";
const LIGHT_GOLD = "#FBF7ED";
const GOLD_BORDER = "#D4AF37";

// ── Aircraft config (Embraer E190/E195 · 2-2 layout · 130 seats) ─────────────
const TOTAL_ROWS = 33;
const PREMIUM_ROWS = new Set([1, 2, 3, 4]);
const EXIT_ROWS = new Set([12, 24]);
const BLOCKED = new Set(["33C", "33D"]);

const PAX_COLORS = [
  BURGUNDY,
  GOLD,
  DARK_BURGUNDY,
  "#8B6914",
  "#9B2E45",
  "#A67C00",
];

const CATEGORY_LABELS = {
  adult: "Adult",
  child: "Child",
  infant: "Infant",
  um: "Unaccompanied Minor",
  unmr: "Unaccompanied Minor",
};

const MEALS = [
  "Tropical breakfast",
  "Vegetarian meal",
  "Child meal",
  "Premium coastal platter",
];

const BAGGAGE_TYPES = [
  { value: "BAG-23", label: "23 kg — 1 piece" },
  { value: "BAG-32", label: "32 kg — 1 piece" },
  { value: "BAG-46", label: "46 kg — 2 × 23 kg" },
];

const SPECIAL_ITEMS = ["Golf bag", "Bike", "Surfboard", "Dive equipment"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSafeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    return Object.values(value).filter(Boolean);
  }

  return [];
}

function initPerPax(existing, count, defaultFn) {
  if (Array.isArray(existing) && existing.length >= count) {
    return existing;
  }

  return Array.from({ length: count }, (_, index) =>
    existing?.[index] !== undefined ? existing[index] : defaultFn()
  );
}

function ensurePerPax(addons = {}, paxCount) {
  return {
    ...addons,
    seats: initPerPax(addons.seats, paxCount, () => null),
    passengerMeals: initPerPax(addons.passengerMeals, paxCount, () => ""),
    passengerBaggage: initPerPax(addons.passengerBaggage, paxCount, () => ({
      extra: "",
      special: "",
    })),
  };
}

function paxName(passenger, index) {
  const name = [passenger?.firstName, passenger?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    name ||
    `${CATEGORY_LABELS[passenger?.category || passenger?.type] || "Passenger"} ${
      index + 1
    }`
  );
}

// ── Vertical seat map ─────────────────────────────────────────────────────────

function SeatMap({ assignedSeats, activePaxIndex, onSeatClick }) {
  const SEAT = 36;
  const GAP = 4;
  const FONT = "0.82rem";

  function getSeat(row, col) {
    const id = `${row}${col}`;
    const paxIdx = assignedSeats.indexOf(id);

    if (BLOCKED.has(id)) {
      return {
        bg: "#E5E7EB",
        color: "#AAA",
        border: "#D1D5DB",
        label: "×",
        blocked: true,
      };
    }

    if (paxIdx !== -1) {
      return {
        bg: PAX_COLORS[paxIdx % PAX_COLORS.length],
        color: "#FFF",
        border: "transparent",
        label: String(paxIdx + 1),
      };
    }

    if (PREMIUM_ROWS.has(row)) {
      return {
        bg: LIGHT_GOLD,
        color: DARK_BURGUNDY,
        border: GOLD_BORDER,
        label: "",
      };
    }

    if (EXIT_ROWS.has(row)) {
      return {
        bg: "#F0F4F0",
        color: "#166534",
        border: "#86EFAC",
        label: "",
      };
    }

    return {
      bg: "#F8F8F8",
      color: "#555",
      border: "#DDD",
      label: "",
    };
  }

  function renderSeat(row, col) {
    const id = `${row}${col}`;
    const seat = getSeat(row, col);

    return (
      <button
        key={id}
        type="button"
        title={seat.blocked ? "Not available" : id}
        onClick={() => !seat.blocked && onSeatClick(id)}
        style={{
          width: SEAT,
          height: SEAT,
          flexShrink: 0,
          background: seat.bg,
          color: seat.color,
          border: `1.5px solid ${seat.border}`,
          borderRadius: 5,
          cursor: seat.blocked ? "default" : "pointer",
          fontSize: FONT,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        {seat.label || (seat.blocked ? "×" : "")}
      </button>
    );
  }

  const rows = Array.from({ length: TOTAL_ROWS }, (_, index) => index + 1);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: GAP,
          marginBottom: GAP,
          paddingLeft: 38,
        }}
      >
        {["A", "B"].map((column) => (
          <div
            key={column}
            style={{
              width: SEAT,
              textAlign: "center",
              fontWeight: 700,
              fontSize: FONT,
              color: BURGUNDY,
            }}
          >
            {column}
          </div>
        ))}

        <div style={{ width: 28 }} />

        {["C", "D"].map((column) => (
          <div
            key={column}
            style={{
              width: SEAT,
              textAlign: "center",
              fontWeight: 700,
              fontSize: FONT,
              color: BURGUNDY,
            }}
          >
            {column}
          </div>
        ))}
      </div>

      <div
        style={{
          maxHeight: 380,
          overflowY: "auto",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          padding: "0.5rem 0.6rem",
        }}
      >
        {rows.map((row) => (
          <div
            key={row}
            style={{
              display: "flex",
              alignItems: "center",
              gap: GAP,
              marginBottom: GAP,
            }}
          >
            <span
              style={{
                width: 26,
                fontSize: "0.72rem",
                color: "#999",
                textAlign: "right",
                flexShrink: 0,
                fontWeight:
                  EXIT_ROWS.has(row) || PREMIUM_ROWS.has(row) ? 700 : 400,
              }}
            >
              {row}
            </span>

            {renderSeat(row, "A")}
            {renderSeat(row, "B")}

            <div
              style={{
                width: 28,
                textAlign: "center",
                fontSize: "0.6rem",
                color: "#16a34a",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {EXIT_ROWS.has(row) ? "EXIT" : ""}
            </div>

            {renderSeat(row, "C")}
            {renderSeat(row, "D")}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginTop: "0.65rem",
        }}
      >
        {[
          { bg: LIGHT_GOLD, border: GOLD_BORDER, label: "Premium (rows 1–4)" },
          { bg: "#F0F4F0", border: "#86EFAC", label: "Exit row" },
          { bg: "#F8F8F8", border: "#DDD", label: "Standard" },
          { bg: "#E5E7EB", border: "#D1D5DB", label: "Not available" },
        ].map((legend) => (
          <span
            key={legend.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: FONT,
              color: "#666",
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                background: legend.bg,
                border: `1.5px solid ${legend.border}`,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {legend.label}
          </span>
        ))}
      </div>
    </>
  );
}

// ── Lump-sum add-ons ──────────────────────────────────────────────────────────

function LumpSumAddons({ addons, onChange }) {
  const extraQty = addons.lumpExtraBaggageQty || 0;
  const extraType = addons.lumpExtraBaggageType || "";
  const mealQty = addons.lumpMealQty || 0;
  const mealType = addons.lumpMealType || "";

  const special = toSafeArray(addons.specialBaggage);

  function setExtraQty(qty) {
    const bags = qty > 0 && extraType ? Array(qty).fill(extraType) : [];

    onChange({
      lumpExtraBaggageQty: qty,
      extraBaggage: bags,
    });
  }

  function setExtraType(type) {
    const bags = extraQty > 0 && type ? Array(extraQty).fill(type) : [];

    onChange({
      lumpExtraBaggageType: type,
      extraBaggage: bags,
    });
  }

  function setMealQty(qty) {
    onChange({
      lumpMealQty: qty,
    });
  }

  function setMealType(type) {
    onChange({
      lumpMealType: type,
      meal: type,
    });
  }

  function toggleSpecial(item) {
    const next = special.includes(item)
      ? special.filter((selectedItem) => selectedItem !== item)
      : [...special, item];

    onChange({
      specialBaggage: next,
    });
  }

  function Counter({ value, onDecrement, onIncrement }) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "0.35rem",
        }}
      >
        <button
          type="button"
          onClick={onDecrement}
          disabled={value <= 0}
          style={{
            width: 28,
            height: 28,
            borderRadius: 5,
            border: `1.5px solid ${BURGUNDY}`,
            background: "#fff",
            color: BURGUNDY,
            fontWeight: 700,
            fontSize: "1rem",
            cursor: value <= 0 ? "not-allowed" : "pointer",
            opacity: value <= 0 ? 0.4 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          −
        </button>

        <span
          style={{
            fontWeight: 700,
            minWidth: "1.4rem",
            textAlign: "center",
            fontSize: "0.95rem",
          }}
        >
          {value}
        </span>

        <button
          type="button"
          onClick={onIncrement}
          style={{
            width: 28,
            height: 28,
            borderRadius: 5,
            border: `1.5px solid ${BURGUNDY}`,
            background: BURGUNDY,
            color: "#fff",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <div className="form-grid">
      <label className="form-field">
        <span>Extra baggage type</span>
        <select value={extraType} onChange={(event) => setExtraType(event.target.value)}>
          <option value="">Select type</option>
          {BAGGAGE_TYPES.map((baggage) => (
            <option key={baggage.value} value={baggage.value}>
              {baggage.label}
            </option>
          ))}
        </select>
      </label>

      <div className="form-field">
        <span>Number of extra bags</span>
        <Counter
          value={extraQty}
          onDecrement={() => setExtraQty(Math.max(0, extraQty - 1))}
          onIncrement={() => setExtraQty(extraQty + 1)}
        />
      </div>

      <label className="form-field">
        <span>Meal type</span>
        <select value={mealType} onChange={(event) => setMealType(event.target.value)}>
          <option value="">Select meal</option>
          {MEALS.map((meal) => (
            <option key={meal} value={meal}>
              {meal}
            </option>
          ))}
        </select>
      </label>

      <div className="form-field">
        <span>Number of meals</span>
        <Counter
          value={mealQty}
          onDecrement={() => setMealQty(Math.max(0, mealQty - 1))}
          onIncrement={() => setMealQty(mealQty + 1)}
        />
      </div>

      <div className="form-field" style={{ gridColumn: "1 / -1" }}>
        <span>Special baggage</span>

        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            flexWrap: "wrap",
            marginTop: "0.4rem",
          }}
        >
          {SPECIAL_ITEMS.map((item) => {
            const isSelected = special.includes(item);

            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleSpecial(item)}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: 5,
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: isSelected ? 600 : 400,
                  border: `1.5px solid ${isSelected ? BURGUNDY : "#DDD"}`,
                  background: isSelected ? BURGUNDY : "#fff",
                  color: isSelected ? "#fff" : "#555",
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AddOns({
  addons,
  setAddons,
  selectedFare,
  passengerDetails,
  setPage,
}) {
  const seatIncluded = selectedFare?.id === "fare-plus";

  const passengers =
    Array.isArray(passengerDetails) && passengerDetails.length > 0
      ? passengerDetails
      : [{ category: "adult", firstName: "", lastName: "" }];

  const paxCount = passengers.length;

  const [activePaxIndex, setActivePaxIndex] = useState(0);
  const [addonMode, setAddonMode] = useState("lumpSum");

  const current = ensurePerPax(addons, paxCount);

  function assignSeat(id) {
    setAddons((currentAddons) => {
      const safeAddons = ensurePerPax(currentAddons, paxCount);
      const seats = [...safeAddons.seats];

      if (seats[activePaxIndex] === id) {
        seats[activePaxIndex] = null;
      } else {
        const taken = seats.indexOf(id);

        if (taken !== -1) {
          seats[taken] = null;
        }

        seats[activePaxIndex] = id;
      }

      return {
        ...safeAddons,
        seats,
        seat: seats[0] || "",
      };
    });
  }

  function updatePassengerMeal(index, value) {
    setAddons((currentAddons) => {
      const safeAddons = ensurePerPax(currentAddons, paxCount);

      const meals = safeAddons.passengerMeals.map((meal, mealIndex) =>
        mealIndex === index ? value : meal
      );

      return {
        ...safeAddons,
        passengerMeals: meals,
        meal: meals[0] || "",
      };
    });
  }

  function updatePassengerBaggage(index, field, value) {
    setAddons((currentAddons) => {
      const safeAddons = ensurePerPax(currentAddons, paxCount);

      const bags = safeAddons.passengerBaggage.map((bag, bagIndex) =>
        bagIndex === index ? { ...bag, [field]: value } : bag
      );

      return {
        ...safeAddons,
        passengerBaggage: bags,
        extraBaggage: bags.map((bag) => bag.extra).filter(Boolean),
        specialBaggage: bags.map((bag) => bag.special).filter(Boolean),
      };
    });
  }

  function updateLumpSum(updates) {
    setAddons((currentAddons) => ({
      ...currentAddons,
      ...updates,
    }));
  }

  function updateShared(field, value) {
    setAddons((currentAddons) => ({
      ...ensurePerPax(currentAddons, paxCount),
      [field]: value,
    }));
  }

  const summaryLines = (() => {
    const lines = [];

    const assignedSeats = toSafeArray(current.seats).filter(Boolean);

    if (assignedSeats.length) {
      lines.push({
        label: "Seats",
        value: assignedSeats.join(", "),
      });
    }

    if (addonMode === "perPassenger") {
      passengers.forEach((passenger, index) => {
        const bag = current.passengerBaggage[index]?.extra;
        const meal = current.passengerMeals[index];

        if (bag || meal) {
          lines.push({
            label: paxName(passenger, index),
            value: [bag, meal].filter(Boolean).join(", "),
          });
        }
      });
    } else {
      const {
        lumpExtraBaggageQty: qty = 0,
        lumpExtraBaggageType: type = "",
        lumpMealQty: mealQty = 0,
        lumpMealType: mealType = "",
      } = addons || {};

      const specialItems = toSafeArray(addons?.specialBaggage);

      if (qty && type) {
        lines.push({
          label: "Extra bags",
          value: `${qty} × ${
            BAGGAGE_TYPES.find((baggage) => baggage.value === type)?.label ||
            type
          }`,
        });
      }

      if (mealQty && mealType) {
        lines.push({
          label: "Meals",
          value: `${mealQty} × ${mealType}`,
        });
      }

      if (specialItems.length) {
        lines.push({
          label: "Special",
          value: specialItems.join(", "),
        });
      }
    }

    const assistance = toSafeArray(addons?.specialAssistance);

    if (assistance[0]) {
      lines.push({
        label: "Assistance",
        value: assistance[0],
      });
    }

    return lines;
  })();

  return (
    <main className="section">
      <div className="container">
        <ProgressSteps current={3} />

        <div className="booking-layout">
          <section className="flight-results-column">
            <div className="card form-card">
              <h3 style={{ color: BURGUNDY }}>Seat selection</h3>

              <p className="muted">
                {seatIncluded
                  ? "Standard seat selection is included with your fare."
                  : "Select a seat for each passenger. Standard seats are available at an additional fee."}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  flexWrap: "wrap",
                  margin: "0.75rem 0",
                }}
              >
                {passengers.map((passenger, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActivePaxIndex(index)}
                    style={{
                      padding: "0.3rem 0.75rem",
                      borderRadius: 6,
                      border: `2px solid ${
                        PAX_COLORS[index % PAX_COLORS.length]
                      }`,
                      background:
                        activePaxIndex === index
                          ? PAX_COLORS[index % PAX_COLORS.length]
                          : "#fff",
                      color:
                        activePaxIndex === index
                          ? "#fff"
                          : PAX_COLORS[index % PAX_COLORS.length],
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    {current.seats[index]
                      ? `Seat ${current.seats[index]}`
                      : "No seat"}{" "}
                    — Pax {index + 1}
                  </button>
                ))}
              </div>

              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#555",
                  marginBottom: "0.6rem",
                }}
              >
                Assigning for:{" "}
                <strong
                  style={{
                    color: PAX_COLORS[activePaxIndex % PAX_COLORS.length],
                  }}
                >
                  {paxName(passengers[activePaxIndex], activePaxIndex)}
                </strong>{" "}
                — click a seat below.
              </p>

              <SeatMap
                assignedSeats={current.seats}
                activePaxIndex={activePaxIndex}
                onSeatClick={assignSeat}
              />
            </div>

            <div className="card form-card">
              <div className="card-header-row">
                <h3 style={{ color: BURGUNDY }}>Baggage &amp; meals</h3>

                <div
                  style={{
                    display: "flex",
                    border: `1.5px solid ${BURGUNDY}`,
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  {[
                    { key: "lumpSum", label: "All passengers" },
                    { key: "perPassenger", label: "Per passenger" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAddonMode(key)}
                      style={{
                        padding: "0.28rem 0.75rem",
                        background: addonMode === key ? BURGUNDY : "#fff",
                        color: addonMode === key ? "#fff" : BURGUNDY,
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {addonMode === "lumpSum" ? (
                <LumpSumAddons addons={addons} onChange={updateLumpSum} />
              ) : (
                passengers.map((passenger, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: index < paxCount - 1 ? "1.25rem" : 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.6rem",
                        paddingBottom: "0.3rem",
                        borderBottom: `2px solid ${
                          PAX_COLORS[index % PAX_COLORS.length]
                        }`,
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: PAX_COLORS[index % PAX_COLORS.length],
                          color: "#fff",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </span>

                      <strong style={{ fontSize: "0.85rem" }}>
                        {paxName(passenger, index)}
                      </strong>

                      {current.seats[index] && (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "0.78rem",
                            color: "#777",
                          }}
                        >
                          Seat {current.seats[index]}
                        </span>
                      )}
                    </div>

                    <div className="form-grid">
                      <label className="form-field">
                        <span>Extra baggage</span>

                        <select
                          value={current.passengerBaggage[index]?.extra || ""}
                          onChange={(event) =>
                            updatePassengerBaggage(
                              index,
                              "extra",
                              event.target.value
                            )
                          }
                        >
                          <option value="">No extra baggage</option>
                          {BAGGAGE_TYPES.map((baggage) => (
                            <option key={baggage.value} value={baggage.value}>
                              {baggage.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="form-field">
                        <span>Special baggage</span>

                        <select
                          value={current.passengerBaggage[index]?.special || ""}
                          onChange={(event) =>
                            updatePassengerBaggage(
                              index,
                              "special",
                              event.target.value
                            )
                          }
                        >
                          <option value="">None</option>
                          {SPECIAL_ITEMS.map((specialItem) => (
                            <option key={specialItem} value={specialItem}>
                              {specialItem}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="form-field">
                        <span>Meal preference</span>

                        <select
                          value={current.passengerMeals[index] || ""}
                          onChange={(event) =>
                            updatePassengerMeal(index, event.target.value)
                          }
                        >
                          <option value="">No meal selected</option>
                          {MEALS.map((meal) => (
                            <option key={meal} value={meal}>
                              {meal}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="card form-card">
              <h3 style={{ color: BURGUNDY }}>Special assistance</h3>

              <label className="form-field">
                <span>Assistance required</span>

                <select
                  value={toSafeArray(addons?.specialAssistance)[0] || ""}
                  onChange={(event) =>
                    updateShared(
                      "specialAssistance",
                      event.target.value ? [event.target.value] : []
                    )
                  }
                >
                  <option value="">No assistance required</option>
                  <option value="Mobility assistance">Mobility assistance</option>
                  <option value="Visual impairment assistance">
                    Visual impairment assistance
                  </option>
                  <option value="Hearing impairment assistance">
                    Hearing impairment assistance
                  </option>
                  <option value="Hidden disability support">
                    Hidden disability support
                  </option>
                </select>
              </label>
            </div>
          </section>

          <aside className="card summary-card">
            <h3 style={{ color: BURGUNDY }}>Selected add-ons</h3>

            {summaryLines.length === 0 ? (
              <p style={{ fontSize: "0.82rem", color: "#888" }}>
                No add-ons selected yet.
              </p>
            ) : (
              summaryLines.map((line, index) => (
                <p
                  key={index}
                  style={{
                    fontSize: "0.82rem",
                    margin: "0.25rem 0",
                  }}
                >
                  <strong>{line.label}:</strong> {line.value}
                </p>
              ))
            )}

            <div className="summary-actions">
              <Button variant="secondary" onClick={() => setPage("passengers")}>
                Back
              </Button>

              <Button onClick={() => setPage("summary")}>
                Review booking
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}