import React, { useEffect, useState } from "react";
import ProgressSteps from "../components/common/ProgressSteps.jsx";
import Button from "../components/common/Button.jsx";

// ── Age rules ──────────────────────────────────────────────────────────────
const AGE_RULES = {
  adult:  { min: 16, max: null, label: "16 years and above"   },
  child:  { min: 2,  max: 15,  label: "2 – 15 years"          },
  infant: { min: 0,  max: 1,   label: "Under 2 years"          },
  unmr:   { min: 5,  max: 11,  label: "5 – 11 years"           },
};

function ageFromDOB(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age < 0 ? 0 : age;
}

function validateAge(category, dateOfBirth) {
  const age = ageFromDOB(dateOfBirth);
  if (age === null) return "";           // no DOB yet — caught by required-field check
  const rule = AGE_RULES[category];
  if (!rule) return "";
  if (age < rule.min)
    return `Too young for ${CATEGORY_META[category]?.label || category}. Minimum age: ${rule.min} year(s). (${rule.label})`;
  if (rule.max !== null && age > rule.max)
    return `Too old for ${CATEGORY_META[category]?.label || category}. Maximum age: ${rule.max} year(s). (${rule.label})`;
  return "";
}

// ── Category config ────────────────────────────────────────────────────────
const CATEGORY_META = {
  adult:  { label: "Adult",               sublabel: "16 years and above"   },
  child:  { label: "Child",               sublabel: "2 – 15 years"          },
  infant: { label: "Infant",              sublabel: "Under 2 years"          },
  unmr:   { label: "Unaccompanied Minor", sublabel: "5 – 11 years, alone"   },
};

const CATEGORIES = Object.entries(CATEGORY_META).map(([key, { label, sublabel }]) => ({
  key, label, sublabel,
}));

// ── Theming ────────────────────────────────────────────────────────────────
const BURGUNDY         = "#5b1237";
const GOLD             = "#c4a045";
const BRAND_SOFT       = "rgba(91,18,55,0.08)";
const BRAND_GOLD_BORDER= "rgba(196,160,69,0.45)";

// ── Fields per category ────────────────────────────────────────────────────
function getFields(category) {
  const base = [
    { key: "title",          label: "Title",           type: "select",
      options: ["Ms","Mrs","Mr","Dr","Mstr"] },
    { key: "firstName",      label: "First name",      type: "text",    placeholder: "First name",       required: true  },
    { key: "middleName",     label: "Middle name",     type: "text",    placeholder: "Optional"                          },
    { key: "lastName",       label: "Last name",       type: "text",    placeholder: "Last name",         required: true  },
    { key: "dateOfBirth",    label: "Date of birth",   type: "date",                                      required: true  },
    { key: "nationality",    label: "Nationality",     type: "text",    placeholder: "e.g. Kenyan"                       },
    { key: "documentType",   label: "Document type",   type: "select",
      options: category === "infant" || category === "child" || category === "unmr"
        ? ["Birth Certificate","Passport"]
        : ["National ID","Passport","Alien ID"] },
    { key: "documentNumber", label: "Document number", type: "text",    placeholder: "Document number",
      required: category !== "infant" },
  ];

  if (category === "unmr") {
    return [
      ...base,
      { key: "guardianName",        label: "Guardian full name",         type: "text",  placeholder: "Full name",        required: true, section: "Guardian / Emergency Contact" },
      { key: "guardianRelation",    label: "Relationship to minor",      type: "text",  placeholder: "e.g. Mother",      required: true },
      { key: "guardianPhone",       label: "Guardian phone",             type: "text",  placeholder: "0712345678",       required: true },
      { key: "guardianEmail",       label: "Guardian email",             type: "email", placeholder: "guardian@example.com", required: true },
      { key: "destinationContact",  label: "Contact at destination",     type: "text",  placeholder: "Full name",        required: true },
      { key: "destinationPhone",    label: "Destination contact phone",  type: "text",  placeholder: "0712345678",       required: true },
      { key: "medicalConditions",   label: "Medical conditions / special needs", type: "text", placeholder: "None, or describe" },
    ];
  }
  return base;
}

function emptyPassenger(category, index) {
  const passenger = { category, passengerKey: `${category}-${index + 1}` };
  for (const field of getFields(category)) {
    passenger[field.key] = field.type === "select" ? field.options[0] : "";
  }
  return passenger;
}

function buildPassengersFromSearch(searchPassengers, existingPassengerDetails = []) {
  const existingList = Array.isArray(existingPassengerDetails) ? existingPassengerDetails : [];
  const counts = {
    adult:  Number(searchPassengers?.adult  || 0),
    child:  Number(searchPassengers?.child  || 0),
    infant: Number(searchPassengers?.infant || 0),
    unmr:   Number(searchPassengers?.unmr   || 0),
  };

  const next = { adult: [], child: [], infant: [], unmr: [] };
  for (const { key } of CATEGORIES) {
    for (let i = 0; i < counts[key]; i++) {
      const passengerKey = `${key}-${i + 1}`;
      const existing = existingList.find(
        (p) => p.passengerKey === passengerKey || p.key === passengerKey
      );
      next[key].push(existing || emptyPassenger(key, i));
    }
  }
  return next;
}

// ── Inline age badge ───────────────────────────────────────────────────────
function AgeBadge({ category, dateOfBirth }) {
  const age = ageFromDOB(dateOfBirth);
  if (age === null) return null;
  const error = validateAge(category, dateOfBirth);
  const ok    = !error;
  return (
    <div style={{
      marginTop: 4, fontSize: "0.75rem", fontWeight: 600, display: "inline-flex",
      alignItems: "center", gap: 5, padding: "2px 10px", borderRadius: 20,
      background: ok ? "#f0fdf4" : "#fff5f5",
      border: `1px solid ${ok ? "#86efac" : "#fca5a5"}`,
      color: ok ? "#16a34a" : "#991b1b",
    }}>
      {ok ? "✓" : "✗"} Age: {age} year{age !== 1 ? "s" : ""}
      {!ok && <span style={{ fontWeight: 400, marginLeft: 4 }}>— {error}</span>}
    </div>
  );
}

// ── Passenger accordion card ───────────────────────────────────────────────
function PassengerForm({ passenger, index, category, onChange, ageError }) {
  const meta   = CATEGORY_META[category];
  const fields = getFields(category);
  const [open, setOpen] = useState(index === 0);

  const fullName =
    [passenger.firstName, passenger.lastName].filter(Boolean).join(" ") ||
    `${meta.label} ${index + 1}`;

  // Build section groups
  const sections = [];
  let current = { title: null, fields: [] };
  for (const field of fields) {
    if (field.section && field.section !== current.title) {
      if (current.fields.length) sections.push({ ...current });
      current = { title: field.section, fields: [field] };
    } else {
      current.fields.push(field);
    }
  }
  if (current.fields.length) sections.push({ ...current });

  return (
    <div className="card form-card" style={{
      padding: 0, overflow: "hidden",
      border: `1px solid ${ageError ? "#fca5a5" : BRAND_GOLD_BORDER}`,
    }}>
      {/* Accordion toggle */}
      <button type="button" onClick={() => setOpen((o) => !o)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "0.85rem 1.1rem",
        background: open ? BRAND_SOFT : "#fff",
        border: "none", borderBottom: open ? `1px solid ${BRAND_GOLD_BORDER}` : "none",
        cursor: "pointer", textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <strong style={{ fontSize: "0.95rem", color: BURGUNDY }}>{fullName}</strong>
          {ageError && (
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, color: "#991b1b",
              background: "#fff5f5", border: "1px solid #fca5a5",
              padding: "1px 8px", borderRadius: 12,
            }}>Age invalid</span>
          )}
        </div>
        <span style={{ fontSize: "0.85rem", color: BURGUNDY, transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: "1rem 1.1rem" }}>
          {sections.map((section, si) => (
            <div key={si}>
              {section.title && (
                <p style={{
                  fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "0.05em", color: BURGUNDY,
                  marginBottom: "0.6rem", paddingBottom: "0.3rem",
                  borderBottom: `1px solid ${BRAND_GOLD_BORDER}`,
                }}>{section.title}</p>
              )}
              <div className="form-grid">
                {section.fields.map((field) => (
                  <label key={field.key} className="form-field">
                    <span>
                      {field.label}
                      {field.required && <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>}
                    </span>
                    {field.type === "select" ? (
                      <select
                        value={passenger[field.key] || field.options[0]}
                        onChange={(e) => onChange(field.key, e.target.value)}
                      >
                        {field.options.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={passenger[field.key] || ""}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        max={field.key === "dateOfBirth" ? new Date().toISOString().split("T")[0] : undefined}
                      />
                    )}
                    {/* Inline age badge directly under DOB */}
                    {field.key === "dateOfBirth" && passenger.dateOfBirth && (
                      <AgeBadge category={category} dateOfBirth={passenger.dateOfBirth} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function PassengerDetails({
  search, passengerDetails, setPassengerDetails,
  contactDetails, setContactDetails, setPage,
}) {
  const [error, setError] = useState("");
  const [passengers, setPassengers] = useState({
    adult: [], child: [], infant: [], unmr: [],
  });

  useEffect(() => {
    setPassengers(buildPassengersFromSearch(search?.passengers, passengerDetails));
  }, [search?.passengers, passengerDetails]);

  const counts = {
    adult:  passengers.adult.length,
    child:  passengers.child.length,
    infant: passengers.infant.length,
    unmr:   passengers.unmr.length,
  };
  const totalPax = Object.values(counts).reduce((s, n) => s + n, 0);

  function updateField(categoryKey, index, field, value) {
    setPassengers((current) => {
      const updated = [...current[categoryKey]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...current, [categoryKey]: updated };
    });
  }

  function updateContact(field, value) {
    setContactDetails((current) => ({ ...current, [field]: value }));
  }

  function copyPassengerToContact() {
    const first = passengers.adult[0];
    if (!first) return;
    setContactDetails((current) => ({
      ...current, title: first.title,
      firstName: first.firstName, lastName: first.lastName,
    }));
  }

  function handleContinue(event) {
    event.preventDefault();
    setError("");

    for (const { key } of CATEGORIES) {
      for (let i = 0; i < (passengers[key] || []).length; i++) {
        const p     = passengers[key][i];
        const label = `${CATEGORY_META[key].label} ${i + 1}`;

        // Required fields
        for (const field of getFields(key)) {
          if (field.required && !p[field.key]) {
            setError(`${label}: please fill in "${field.label}".`);
            return;
          }
        }

        // Age validation
        const ageErr = validateAge(key, p.dateOfBirth);
        if (ageErr) {
          setError(`${label}: ${ageErr}`);
          return;
        }
      }
    }

    if (!contactDetails.phone || !contactDetails.email) {
      setError("Please enter contact phone number and email address.");
      return;
    }
    if (contactDetails.email !== contactDetails.confirmEmail) {
      setError("Email and confirm email must match.");
      return;
    }

    const flattened = CATEGORIES.flatMap(({ key, label }) =>
      (passengers[key] || []).map((p, i) => ({
        ...p, type: key, category: key,
        label: `${label} ${i + 1}`,
        passengerKey: `${key}-${i + 1}`,
      }))
    );
    setPassengerDetails(flattened);
    setPage("addons");
  }

  // Precompute per-passenger age errors for the accordion badges
  const ageErrors = {};
  for (const { key } of CATEGORIES) {
    (passengers[key] || []).forEach((p, i) => {
      const err = validateAge(key, p.dateOfBirth);
      if (err) ageErrors[`${key}-${i}`] = err;
    });
  }

  return (
    <main className="section">
      <div className="container">
        <ProgressSteps current={2} />

        <form onSubmit={handleContinue} className="booking-layout">
          <section className="flight-results-column">

            {/* Age rule reference card */}
            <div style={{
              background: "#fdf9fd", border: `1px solid ${BRAND_GOLD_BORDER}`,
              borderRadius: 10, padding: "0.85rem 1.1rem",
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
              gap: "0.5rem", marginBottom: "0.25rem",
            }}>
              {Object.entries(AGE_RULES).map(([cat, { label, min, max }]) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    background: BURGUNDY, color: "#fff",
                    fontSize: "0.62rem", fontWeight: 800, padding: "2px 8px",
                    borderRadius: 12, whiteSpace: "nowrap",
                  }}>{CATEGORY_META[cat].label}</span>
                  <span style={{ fontSize: "0.75rem", color: "#555" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Passenger forms */}
            {CATEGORIES.map(({ key, label, sublabel }) =>
              counts[key] > 0 ? (
                <div key={key}>
                  <h4 style={{
                    margin: "1.25rem 0 0.5rem",
                    fontSize: "0.85rem", fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    color: BURGUNDY,
                    borderBottom: `2px solid ${GOLD}`, paddingBottom: "0.35rem",
                  }}>
                    {label}s — {sublabel}
                  </h4>
                  {(passengers[key] || []).map((passenger, i) => (
                    <PassengerForm
                      key={`${key}-${i}`}
                      passenger={passenger}
                      index={i}
                      category={key}
                      ageError={!!ageErrors[`${key}-${i}`]}
                      onChange={(field, value) => updateField(key, i, field, value)}
                    />
                  ))}
                </div>
              ) : null
            )}

            {/* Contact details */}
            <div className="card form-card">
              <div className="card-header-row">
                <h3>Contact details</h3>
                <Button type="button" variant="secondary" onClick={copyPassengerToContact}>
                  Copy passenger name
                </Button>
              </div>
              <div className="form-grid">
                {[
                  { field: "title",        label: "Title",           type: "select", options: ["Ms","Mrs","Mr","Dr"] },
                  { field: "firstName",    label: "First name",      type: "text"   },
                  { field: "lastName",     label: "Last name",       type: "text"   },
                  { field: "phone",        label: "Phone",           type: "text",  placeholder: "07XXXXXXXX" },
                  { field: "email",        label: "Email",           type: "email", placeholder: "name@example.com" },
                  { field: "confirmEmail", label: "Confirm email",   type: "email", placeholder: "name@example.com" },
                  { field: "country",      label: "Country",         type: "text"   },
                  { field: "city",         label: "City",            type: "text"   },
                ].map(({ field, label, type, placeholder, options }) => (
                  <label key={field} className="form-field">
                    <span>{label}</span>
                    {type === "select" ? (
                      <select value={contactDetails[field] || ""} onChange={(e) => updateContact(field, e.target.value)}>
                        {(options || []).map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={type} value={contactDetails[field] || ""}
                        onChange={(e) => updateContact(field, e.target.value)}
                        placeholder={placeholder} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="card summary-card">
            <h3>Booking progress</h3>
            <p>
              {CATEGORIES.filter(({ key }) => counts[key] > 0)
                .map(({ key, label }) => `${counts[key]} ${label}${counts[key] > 1 ? "s" : ""}`)
                .join(", ")}
            </p>
            <p style={{ fontSize: "0.82rem", color: "#555", marginTop: "0.5rem" }}>
              Passenger list is based on the travellers selected on the Book Flight page.
            </p>
            <hr />
            <p><strong>Total passengers:</strong> {totalPax}</p>

            {/* Age rules reminder */}
            <div style={{
              marginTop: "0.75rem", background: "#fdf9fd",
              border: `1px solid ${BRAND_GOLD_BORDER}`,
              borderRadius: 8, padding: "0.65rem 0.85rem",
              fontSize: "0.75rem", color: "#555", lineHeight: 1.7,
            }}>
              <strong style={{ color: BURGUNDY, display: "block", marginBottom: 3 }}>Age requirements</strong>
              Adult: 16+ years<br />
              Child: 2 – 15 years<br />
              Infant: Under 2 years<br />
              Unaccompanied minor: 5 – 11 years
            </div>

            {error && <div className="alert alert-danger" style={{ marginTop: "0.75rem" }}>{error}</div>}

            <div className="summary-actions" style={{ marginTop: "1rem" }}>
              <Button type="button" variant="secondary" onClick={() => setPage("results")}>
                Back to flights
              </Button>
              <Button type="submit">Continue to add-ons</Button>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
