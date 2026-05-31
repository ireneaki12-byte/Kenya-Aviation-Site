import React, { useState, useRef, useEffect } from "react";
import { Bot, Mic, MicOff, Send, X, Check, Phone, Mail } from "lucide-react";
import { chatWithAssistantAgentic } from "../../services/apiClient";

const BURGUNDY   = "#6B1E2E";
const GOLD       = "#C9A84C";
const LIGHT_GOLD = "#FBF7ED";
const TAXES      = 2000;

function kes(n) { return `KES ${Number(n || 0).toLocaleString("en-KE")}`; }

const primaryBtn = {
  width: "100%", padding: "0.5rem",
  background: BURGUNDY, color: "#fff",
  border: "none", borderRadius: 7,
  fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
};
const ghostBtn = {
  width: "100%", padding: "0.48rem",
  background: "#fff", color: "#555",
  border: "1px solid #ccc", borderRadius: 7,
  fontSize: "0.85rem", cursor: "pointer",
};
const fieldBase = {
  width: "100%", padding: "0.35rem 0.5rem",
  fontSize: "0.85rem", border: "1px solid #ddd",
  borderRadius: 6, boxSizing: "border-box",
};

// ── Renders **bold** and line-breaks ──────────────────────────────────────────
function MessageText({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/);
  return (
    <>
      {parts.map((p, i) => {
        if (p === "\n") return <br key={i} />;
        if (p.startsWith("**") && p.endsWith("**"))
          return <strong key={i}>{p.slice(2, -2)}</strong>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

// ── Human escalation card — shown when Claude cannot help ─────────────────────
function EscalationCard() {
  return (
    <div style={{ background: "#fff", border: `2px solid ${GOLD}`, borderRadius: 10,
                  overflow: "hidden", fontSize: "0.82rem", marginTop: "0.5rem" }}>
      <div style={{ background: BURGUNDY, color: "#fff", padding: "0.5rem 0.85rem",
                    fontWeight: 700, fontSize: "0.83rem" }}>
        🧑‍💼 Speak to our team
      </div>
      <div style={{ padding: "0.75rem 0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Phone size={14} color={BURGUNDY} />
          <div>
            <div style={{ fontWeight: 700, color: BURGUNDY, fontSize: "0.8rem" }}>Call us</div>
            <div style={{ color: "#555" }}>+254 20 827 0000 &nbsp;·&nbsp; Mon–Fri, 8am–6pm EAT</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Mail size={14} color={BURGUNDY} />
          <div>
            <div style={{ fontWeight: 700, color: BURGUNDY, fontSize: "0.8rem" }}>Email us</div>
            <a href="mailto:info@kenya-aviation.com"
               style={{ color: BURGUNDY, textDecoration: "none" }}>
              info@kenya-aviation.com
            </a>
            <div style={{ color: "#888", fontSize: "0.74rem" }}>We respond within 2 business hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Booking summary card ───────────────────────────────────────────────────────
function ChatSummaryCard({ flight, fare, passenger, addons }) {
  const bagFee  = addons?.extraBaggage?.[0] === "BAG-23" ? 2500
    : addons?.extraBaggage?.[0] === "BAG-32" ? 3500
    : addons?.extraBaggage?.[0] === "BAG-46" ? 4800 : 0;
  const mealFee = addons?.meal ? 900 : 0;
  const total   = (fare?.amount || 0) + TAXES + bagFee + mealFee;

  const rows = [
    ["Flight",     `${flight?.flight_number}  ·  ${flight?.origin} → ${flight?.destination}`],
    ["Departure",  `${flight?.departure_time}  →  ${flight?.arrival_time}`],
    ["Fare",       `${fare?.name}  —  ${kes(fare?.amount || 0)}`],
    ["Passenger",  `${passenger?.title} ${passenger?.firstName} ${passenger?.lastName}`],
    ["Document",   `${passenger?.documentType}: ${passenger?.documentNumber}`],
    ["Contact",    `${passenger?.phone}  ·  ${passenger?.email}`],
    addons?.seat              && ["Seat",        addons.seat],
    addons?.extraBaggage?.[0] && ["Baggage",     addons.extraBaggage[0]],
    addons?.meal              && ["Meal",        addons.meal],
    ["Taxes & fees", kes(TAXES)],
    bagFee  > 0 && ["Baggage fee", kes(bagFee)],
    mealFee > 0 && ["Meal fee",    kes(mealFee)],
  ].filter(Boolean);

  return (
    <div style={{ background: "#fff", border: `2px solid ${GOLD}`, borderRadius: 10,
                  overflow: "hidden", fontSize: "0.82rem" }}>
      <div style={{ background: BURGUNDY, color: "#fff", padding: "0.5rem 0.85rem",
                    fontWeight: 700, fontSize: "0.83rem", display: "flex",
                    justifyContent: "space-between", alignItems: "center" }}>
        <span>Booking summary</span>
        <span style={{ color: GOLD }}>{kes(total)}</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map(([label, value], i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : LIGHT_GOLD }}>
              <td style={{ padding: "0.35rem 0.75rem", fontWeight: 700,
                           color: BURGUNDY, whiteSpace: "nowrap", width: "35%" }}>
                {label}
              </td>
              <td style={{ padding: "0.35rem 0.75rem", color: "#333" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, hint, type = "text", value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: BURGUNDY,
                      display: "flex", gap: "0.25rem", marginBottom: 3 }}>
        {label}{required && <span style={{ color: "#c00" }}>*</span>}
      </label>
      {hint && <div style={{ fontSize: "0.68rem", color: "#888", marginBottom: 3 }}>{hint}</div>}
      {options ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} style={fieldBase}>
          {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          style={fieldBase} placeholder={hint} />
      )}
    </div>
  );
}

function StepBadge({ step, total, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.35rem 0.75rem", background: LIGHT_GOLD,
                  borderBottom: `1px solid ${GOLD}` }}>
      <span style={{ background: BURGUNDY, color: "#fff", borderRadius: "50%",
                     width: 20, height: 20, display: "flex", alignItems: "center",
                     justifyContent: "center", fontSize: "0.68rem", fontWeight: 800, flexShrink: 0 }}>
        {step}
      </span>
      <span style={{ fontSize: "0.73rem", fontWeight: 700, color: BURGUNDY }}>
        Step {step} of {total} — {label}
      </span>
    </div>
  );
}

function FlightCards({ flights, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {(flights || []).map((f, i) => (
        <div key={f.id || i} style={{ border: `1.5px solid ${GOLD}`, borderRadius: 10,
                                      overflow: "hidden", background: "#fff" }}>
          <div style={{ background: BURGUNDY, color: "#fff", padding: "0.35rem 0.75rem",
                        display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
            <strong>{f.flight_number}</strong>
            <span>{f.origin} → {f.destination}</span>
          </div>
          <div style={{ padding: "0.6rem 0.75rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#888", paddingBottom: 2 }}>Departure</td>
                  <td style={{ fontWeight: 700, paddingBottom: 2 }}>{f.departure_time}</td>
                  <td style={{ color: "#888", paddingBottom: 2, paddingLeft: 12 }}>Arrival</td>
                  <td style={{ fontWeight: 700, paddingBottom: 2 }}>{f.arrival_time}</td>
                </tr>
                <tr>
                  <td style={{ color: "#888" }}>Duration</td>
                  <td style={{ fontWeight: 600 }}>{f.duration || "—"}</td>
                  <td style={{ color: "#888", paddingLeft: 12 }}>From</td>
                  <td style={{ fontWeight: 700, color: BURGUNDY }}>{kes(f.basic_fare || 0)}</td>
                </tr>
              </tbody>
            </table>
            <button type="button" style={{ ...primaryBtn, marginTop: "0.5rem" }}
              onClick={() => onSelect(f)}>Select this flight →</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function FareCards({ fares, onSelect }) {
  const options = fares?.length ? fares : [
    { id: "basic",     name: "Basic",      amount: 0,
      items: ["10 kg cabin baggage", "Seat selection at a fee", "Standard change rules"] },
    { id: "fare-plus", name: "Fare Plus+", amount: 0,
      items: ["10 kg cabin + 23 kg hold baggage", "Free standard seat selection", "First change fee waived"] },
  ];
  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem", lineHeight: 1.5 }}>
        Choose a fare. <strong>Fare Plus+</strong> is recommended for checked baggage and flexibility.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {options.map((fare) => (
          <div key={fare.id} style={{ border: `1.5px solid ${fare.id === "fare-plus" ? GOLD : "#ddd"}`,
                                      borderRadius: 10, overflow: "hidden", background: "#fff" }}>
            <div style={{ background: fare.id === "fare-plus" ? BURGUNDY : "#f5f5f5",
                          color: fare.id === "fare-plus" ? "#fff" : BURGUNDY,
                          padding: "0.35rem 0.75rem", display: "flex",
                          justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700 }}>
              <span>{fare.name}</span>
              {fare.amount > 0 && <span>{kes(fare.amount)}</span>}
            </div>
            <div style={{ padding: "0.5rem 0.75rem" }}>
              <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.76rem",
                           color: "#555", lineHeight: 1.7 }}>
                {(fare.items || fare.perks || []).map((p) => <li key={p}>{p}</li>)}
              </ul>
              <button type="button" style={{ ...primaryBtn, marginTop: "0.5rem" }}
                onClick={() => onSelect(fare)}>Choose {fare.name} →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PassengerFormInline({ onSubmit }) {
  const [form, setForm] = useState({
    title: "Mr", firstName: "", lastName: "",
    dateOfBirth: "", nationality: "Kenyan",
    documentType: "National ID", documentNumber: "",
    phone: "", email: "",
  });
  const [error, setError] = useState("");
  const set = (f) => (v) => setForm((p) => ({ ...p, [f]: v }));

  function handleSubmit() {
    const missing = [];
    if (!form.firstName)      missing.push("First name");
    if (!form.lastName)       missing.push("Last name");
    if (!form.dateOfBirth)    missing.push("Date of birth");
    if (!form.documentNumber) missing.push("Document number");
    if (!form.phone)          missing.push("Phone");
    if (!form.email)          missing.push("Email");
    if (missing.length) return setError(`Please fill in: ${missing.join(", ")}.`);
    setError("");
    onSubmit({ ...form, category: "adult", passengerKey: "adult-1", label: "Adult 1" });
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ background: LIGHT_GOLD, padding: "0.5rem 0.85rem",
                    borderBottom: `1px solid ${GOLD}`, fontSize: "0.75rem", color: BURGUNDY, lineHeight: 1.6 }}>
        <strong>All fields marked * are required.</strong><br />
        Name must exactly match your travel document.
      </div>
      <div style={{ padding: "0.85rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 0.6rem" }}>
          <Field label="Title" value={form.title} onChange={set("title")} required
            options={["Mr","Mrs","Ms","Dr","Mstr"].map((o) => ({ value: o, label: o }))} />
          <Field label="Date of birth" value={form.dateOfBirth} onChange={set("dateOfBirth")}
            type="date" hint="YYYY-MM-DD" required />
          <Field label="First name" value={form.firstName} onChange={set("firstName")}
            hint="As on your ID / passport" required />
          <Field label="Last name"  value={form.lastName}  onChange={set("lastName")}
            hint="As on your ID / passport" required />
          <Field label="Nationality" value={form.nationality} onChange={set("nationality")}
            hint="e.g. Kenyan, British" />
          <Field label="Document type" value={form.documentType} onChange={set("documentType")}
            options={["National ID","Passport","Alien ID"].map((o) => ({ value: o, label: o }))} required />
          <Field label="Document number" value={form.documentNumber} onChange={set("documentNumber")}
            hint="ID or passport number" required />
          <Field label="Phone" value={form.phone} onChange={set("phone")}
            type="tel" hint="e.g. 0712 345 678" required />
        </div>
        <Field label="Email address" value={form.email} onChange={set("email")}
          type="email" hint="Booking confirmation will be sent here" required />
        {error && (
          <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 6,
                        padding: "0.4rem 0.65rem", fontSize: "0.76rem", color: "#c00",
                        marginBottom: "0.4rem" }}>{error}</div>
        )}
        <button type="button" style={primaryBtn} onClick={handleSubmit}>
          Save passenger details →
        </button>
      </div>
    </div>
  );
}

function AddonFormInline({ onSubmit }) {
  const [seat, setSeat] = useState("");
  const [bag,  setBag]  = useState("");
  const [meal, setMeal] = useState("");

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ background: LIGHT_GOLD, padding: "0.5rem 0.85rem",
                    borderBottom: `1px solid ${GOLD}`, fontSize: "0.75rem", color: BURGUNDY }}>
        All add-ons are optional. Click <strong>Skip</strong> if you don't need any.
      </div>
      <div style={{ padding: "0.85rem" }}>
        <Field label="Seat preference" value={seat} onChange={setSeat}
          options={[{ value: "", label: "No preference (free)" },
                    { value: "window", label: "Window seat" },
                    { value: "aisle",  label: "Aisle seat"  },
                    { value: "front",  label: "Front of cabin" }]} />
        <Field label="Extra baggage" value={bag} onChange={setBag}
          hint="Cabin baggage (10 kg) included for all fares"
          options={[{ value: "",       label: "No extra baggage" },
                    { value: "BAG-23", label: "23 kg piece — KES 2,500" },
                    { value: "BAG-32", label: "32 kg piece — KES 3,500" },
                    { value: "BAG-46", label: "2 × 23 kg pieces — KES 4,800" }]} />
        <Field label="Meal preference" value={meal} onChange={setMeal}
          options={[{ value: "",                        label: "No meal" },
                    { value: "Tropical breakfast",      label: "Tropical breakfast — KES 900" },
                    { value: "Vegetarian meal",         label: "Vegetarian meal — KES 850" },
                    { value: "Child meal",              label: "Child meal — KES 750" },
                    { value: "Premium coastal platter", label: "Premium coastal platter — KES 1,500" }]} />
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button type="button" style={primaryBtn}
            onClick={() => onSubmit({ seat, extraBaggage: bag ? [bag] : [], meal })}>
            Continue to summary →
          </button>
          <button type="button" style={{ ...ghostBtn, width: "auto", padding: "0.48rem 1rem" }}
            onClick={() => onSubmit({ seat: "", extraBaggage: [], meal: "" })}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

function MethodOption({ id, label, sub, selected, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(id)} style={{
      width: "100%", padding: "0.55rem 0.75rem", textAlign: "left",
      border: `1.5px solid ${selected ? BURGUNDY : "#ddd"}`,
      background: selected ? LIGHT_GOLD : "#fff",
      borderRadius: 8, cursor: "pointer", marginBottom: "0.4rem", display: "flex",
      alignItems: "center", gap: "0.6rem",
    }}>
      <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                     border: `2px solid ${selected ? BURGUNDY : "#ccc"}`,
                     background: selected ? BURGUNDY : "#fff",
                     display: "flex", alignItems: "center", justifyContent: "center" }}>
        {selected && <Check size={9} color="#fff" strokeWidth={3} />}
      </span>
      <span>
        <div style={{ fontWeight: 700, fontSize: "0.84rem", color: BURGUNDY }}>{label}</div>
        <div style={{ fontSize: "0.73rem", color: "#777" }}>{sub}</div>
      </span>
    </button>
  );
}

// ── Detect escalation signals in Claude's response ────────────────────────────
// Show the EscalationCard automatically when Claude refers to a human agent.
function needsEscalationCard(text = "") {
  const lower = text.toLowerCase();
  return (
    lower.includes("human agent") ||
    lower.includes("our team") ||
    lower.includes("contact us") ||
    lower.includes("call us") ||
    lower.includes("speak to") ||
    lower.includes("info@kenya-aviation") ||
    lower.includes("+254 20 827")
  );
}

// ── Main ChatbotWidget ────────────────────────────────────────────────────────
export default function ChatbotWidget({
  isOpen, onClose,
  setResults, setSearch, setPage,
  setSelectedFlight, setSelectedReturnFlight,
  setSelectedFare, setPassengerDetails,
  setContactDetails, setAddons,
}) {
  const [messages,             setMessages]             = useState([{
    role: "assistant",
    text: "Hello! ✈️ I'm your Kenya Aviation travel assistant.\n\nI can:\n**• Search flights** — just tell me where and when\n**• Guide your booking** — I'll collect all the details step by step\n**• Answer questions** — baggage, check-in, fares and more\n\nWhere would you like to fly today?",
  }]);
  const [input,               setInput]               = useState("");
  const [loading,             setLoading]             = useState(false);
  const [isListening,         setIsListening]         = useState(false);
  const [step,                setStep]                = useState("chat");
  const [bookingData,         setBookingData]         = useState({});
  const [availableFares,      setAvailableFares]      = useState([]);
  const [inlineFlights,       setInlineFlights]       = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);

  const bottomRef       = useRef(null);
  const recognitionRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, step]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  if (!isOpen) return null;

  function addMsg(role, text, extra = {}) {
    setMessages((m) => [...m, { role, text, ...extra }]);
  }

  // ── Voice input — fixed ───────────────────────────────────────────────────
  function handleVoice() {
    // If already listening, stop
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      addMsg("assistant",
        "Voice input is not supported in your browser.\n\n" +
        "**Supported browsers:** Chrome, Edge, and Safari on iOS.\n" +
        "Please type your message, or switch to a supported browser to use voice."
      );
      return;
    }

    // Chrome requires HTTPS for the microphone outside of localhost.
    // Warn the user if they are on http:// in production.
    if (location.protocol === "http:" && !["localhost","127.0.0.1"].includes(location.hostname)) {
      addMsg("assistant",
        "Voice input requires a secure connection (HTTPS). " +
        "Please contact your administrator to enable HTTPS, or type your message."
      );
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.lang              = "en-US";
    recognition.continuous        = false;   // stop after one utterance
    recognition.interimResults    = false;   // wait for the final result only
    recognition.maxAlternatives   = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);         // populate the text box
      setIsListening(false);
      // Auto-focus the input so the user can review before sending
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      const messages = {
        "not-allowed":       "Microphone access was denied.\n\nTo fix this: click the 🔒 icon in your browser's address bar → Site settings → Microphone → Allow, then try again.",
        "no-speech":         "No speech was detected. Please try again and speak clearly into your microphone.",
        "audio-capture":     "No microphone was found. Please connect a microphone and try again.",
        "network":           "A network error occurred with voice recognition. Please check your connection or type your message.",
        "service-not-allowed": "Voice recognition is blocked. This may be because the page is not served over HTTPS.",
      };
      addMsg("assistant", messages[e.error] ||
        `Voice input encountered an error (${e.error}). Please type your message instead.`
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      addMsg("assistant", "Could not start voice input. Please type your message.");
    }
  }

  // ── Agentic send ──────────────────────────────────────────────────────────
  async function sendMessage() {
    const message = input.trim();
    if (!message) return;
    setInput("");
    addMsg("user", message);

    try {
      setLoading(true);
      const response = await chatWithAssistantAgentic({
        message,
        session_id:           "WEB-CHAT",
        conversation_history: conversationHistory,
      });

      if (response.updated_history) setConversationHistory(response.updated_history);

      if (response.response) {
        const showCard = needsEscalationCard(response.response);
        addMsg("assistant", response.response, { showEscalation: showCard });
      }

      if (response.action?.type === "navigate") {
        const s = response.action.booking_state;
        applyBookingState(s);
        addMsg("assistant", "✅ All details captured! Taking you to the summary page to review and pay.");
        setTimeout(() => { onClose(); setPage("summary"); }, 1500);
        return;
      }

      const flights = response.context?.flights || [];
      if (flights.length > 0) {
        addMsg("assistant", `I found **${flights.length} flight${flights.length > 1 ? "s" : ""}** on this route. Please select one:`);
        setInlineFlights(flights);
        setStep("flights");
      }

    } catch {
      addMsg("assistant",
        "I'm having trouble connecting right now.\n\n" +
        "Please try again in a moment, or contact our team directly:",
        { showEscalation: true }
      );
    } finally {
      setLoading(false);
    }
  }

  function applyBookingState(s) {
    if (s.selectedFlight       && setSelectedFlight)       setSelectedFlight(s.selectedFlight);
    if (s.selectedReturnFlight && setSelectedReturnFlight) setSelectedReturnFlight(s.selectedReturnFlight);
    if (s.selectedFare         && setSelectedFare)         setSelectedFare(s.selectedFare);
    if (s.passengerDetails     && setPassengerDetails)     setPassengerDetails(s.passengerDetails);
    if (s.contactDetails       && setContactDetails)       setContactDetails(s.contactDetails);
    if (s.search               && setSearch)               setSearch((p) => ({ ...p, ...s.search }));
    if (s.addons               && setAddons)               setAddons(s.addons);
  }

  function handleFlightSelect(flight) {
    setBookingData((b) => ({ ...b, flight }));
    if (setResults)        setResults([flight]);
    if (setSelectedFlight) setSelectedFlight(flight);
    if (setSearch)         setSearch((p) => ({ ...p, origin: flight.origin, destination: flight.destination }));
    addMsg("user",      `✓ Selected: **${flight.flight_number}** — ${flight.origin} → ${flight.destination}  |  ${flight.departure_time} → ${flight.arrival_time}`);
    addMsg("assistant", "Great choice! Now please select a fare package:");
    setStep("fares");
  }

  function handleFareSelect(fare) {
    setBookingData((b) => ({ ...b, fare }));
    if (setSelectedFare) setSelectedFare(fare);
    addMsg("user",      `✓ Fare: **${fare.name}**${fare.amount ? `  —  ${kes(fare.amount)}` : ""}`);
    addMsg("assistant",
      "Now I need your **passenger details**.\n\n" +
      "Please fill in the form below. All fields marked * are required.\n" +
      "Your name must match exactly what's on your travel document."
    );
    setStep("passenger");
  }

  function handlePassengerSubmit(passenger) {
    setBookingData((b) => ({ ...b, passenger }));
    addMsg("user",
      `✓ Passenger details saved:\n` +
      `**Name:** ${passenger.title} ${passenger.firstName} ${passenger.lastName}\n` +
      `**DOB:** ${passenger.dateOfBirth}  ·  **${passenger.documentType}:** ${passenger.documentNumber}\n` +
      `**Phone:** ${passenger.phone}  ·  **Email:** ${passenger.email}`
    );
    addMsg("assistant",
      "Details saved! ✅\n\n" +
      "Would you like to add any optional extras?\n\n" +
      "**Seat preference** — Window, Aisle or Front of cabin\n" +
      "**Extra baggage** — 23 kg, 32 kg or 2 × 23 kg (fee applies)\n" +
      "**Meal** — Tropical breakfast, Vegetarian, Child meal or Premium platter\n\n" +
      "Select below or click **Skip** if you don't need any."
    );
    setStep("addons");
  }

  function handleAddonSubmit(addons) {
    const { flight, fare, passenger } = { ...bookingData };
    const passengerList = [{ ...passenger, category: "adult", passengerKey: "adult-1", label: "Adult 1" }];
    const contactDetails = {
      title: passenger?.title || "", firstName: passenger?.firstName || "",
      lastName: passenger?.lastName || "", email: passenger?.email || "",
      confirmEmail: passenger?.email || "", phone: passenger?.phone || "",
      country: "Kenya", city: "", address: "",
    };

    if (setSelectedFlight)   setSelectedFlight(flight);
    if (setSelectedFare)     setSelectedFare(fare);
    if (setPassengerDetails) setPassengerDetails(passengerList);
    if (setContactDetails)   setContactDetails(contactDetails);
    if (setAddons)           setAddons(addons);

    setBookingData((b) => ({ ...b, addons }));
    setMessages((m) => [
      ...m,
      { role: "summary_card", flight, fare, passenger, addons },
      { role: "assistant", text: "Here's your full booking summary above. ☝️\n\nEverything looks good? Click **Proceed to payment** to review and pay on the next page." },
    ]);
    setStep("ready");
  }

  function handleProceedToPayment() {
    addMsg("assistant", "Taking you to the review page…");
    setTimeout(() => { onClose(); setPage("summary"); }, 600);
  }

  function renderStep() {
    switch (step) {
      case "flights":  return (<><StepBadge step={1} total={4} label="Select your flight" /><div style={{ padding: "0.5rem" }}><FlightCards flights={inlineFlights} onSelect={handleFlightSelect} /></div></>);
      case "fares":    return (<><StepBadge step={2} total={4} label="Choose a fare" /><div style={{ padding: "0.5rem" }}><FareCards fares={availableFares} onSelect={handleFareSelect} /></div></>);
      case "passenger":return (<><StepBadge step={3} total={4} label="Passenger details" /><div style={{ padding: "0.5rem" }}><PassengerFormInline onSubmit={handlePassengerSubmit} /></div></>);
      case "addons":   return (<><StepBadge step={4} total={4} label="Add-on services (optional)" /><div style={{ padding: "0.5rem" }}><AddonFormInline onSubmit={handleAddonSubmit} /></div></>);
      case "ready":    return (<div style={{ padding: "0.5rem" }}><button type="button" style={{ ...primaryBtn, fontSize: "0.92rem", padding: "0.65rem" }} onClick={handleProceedToPayment}>✈️ Proceed to payment →</button></div>);
      default: return null;
    }
  }

  const stepEl = renderStep();

  return (
    <div className="chatbot-overlay">
      <section className="chatbot-panel">

        <header className="chatbot-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bot size={18} color={GOLD} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Travel Assistant</div>
              <div style={{ fontSize: "0.65rem", color: GOLD }}>● Online — powered by AI</div>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#fff" }}>
            <X size={18} />
          </button>
        </header>

        {/* Listening banner */}
        {isListening && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            padding: "0.4rem 0.9rem", background: "#fee2e2",
            borderBottom: "1px solid #fca5a5", fontSize: "0.78rem", color: "#991b1b",
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: "50%", background: "#dc2626",
              animation: "pulse 1s infinite", flexShrink: 0,
              boxShadow: "0 0 0 0 rgba(220,38,38,0.4)",
            }} />
            <span><strong>Listening…</strong> Speak now. Click the mic again to stop.</span>
          </div>
        )}

        <div className="chatbot-messages">
          {messages.map((msg, i) => {
            if (msg.role === "summary_card") {
              return (
                <div key={i} style={{ padding: "0.4rem 0.5rem" }}>
                  <ChatSummaryCard flight={msg.flight} fare={msg.fare}
                    passenger={msg.passenger} addons={msg.addons} />
                </div>
              );
            }
            return (
              <div key={i} className={msg.role === "user" ? "chat-message user-message" : "chat-message assistant-message"}>
                {msg.role === "assistant" && <Bot size={15} style={{ flexShrink: 0, marginTop: 2 }} />}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, lineHeight: 1.55 }}>
                    <MessageText text={msg.text} />
                  </p>
                  {msg.showEscalation && <EscalationCard />}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="chat-message assistant-message">
              <Bot size={15} />
              <p style={{ margin: 0, color: "#999", fontStyle: "italic" }}>Thinking…</p>
            </div>
          )}

          {stepEl && <div style={{ margin: "0.25rem 0" }}>{stepEl}</div>}
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div className="chatbot-input-row"
          style={{ padding: "0.65rem 0.75rem", gap: "0.5rem", alignItems: "center",
                   borderTop: "1px solid #e5e7eb", background: "#fff" }}>

          {/* Mic button — changes appearance when listening */}
          <button type="button" onClick={handleVoice} aria-label={isListening ? "Stop recording" : "Start voice input"}
            title={isListening ? "Click to stop recording" : "Click to speak"}
            style={{
              flexShrink: 0, border: "none", borderRadius: 8, cursor: "pointer",
              padding: "0.45rem", display: "flex", alignItems: "center", justifyContent: "center",
              background: isListening ? "#fee2e2" : "none",
              color: isListening ? "#dc2626" : BURGUNDY,
              transition: "background 0.2s, color 0.2s",
            }}>
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={
              isListening      ? "Listening — speak now…" :
              step === "chat"  ? "Ask about flights, baggage, check-in…" :
              step === "ready" ? "Any questions before you pay?" :
                                 "Type a message or use the form above"
            }
            style={{
              flex: 1, fontSize: "1rem", padding: "0.6rem 0.85rem",
              borderRadius: 8, border: `1.5px solid ${isListening ? "#fca5a5" : "#ddd"}`,
              outline: "none", lineHeight: 1.4, transition: "border-color 0.2s",
              background: isListening ? "#fff7f7" : "#fff",
            }}
          />

          <button type="button" onClick={sendMessage} aria-label="Send"
            style={{ flexShrink: 0, background: BURGUNDY, border: "none",
                     borderRadius: 8, padding: "0.55rem 0.7rem",
                     cursor: "pointer", color: "#fff", display: "flex", alignItems: "center" }}>
            <Send size={18} />
          </button>
        </div>

        {/* Pulse animation for the listening dot */}
        <style>{`
          @keyframes pulse {
            0%   { box-shadow: 0 0 0 0 rgba(220,38,38,0.5); }
            70%  { box-shadow: 0 0 0 8px rgba(220,38,38,0); }
            100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
          }
        `}</style>

      </section>
    </div>
  );
}
