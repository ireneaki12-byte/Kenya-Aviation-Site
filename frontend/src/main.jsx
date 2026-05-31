import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";

import "./styles/global.css";

import AppShell         from "./components/common/AppShell.jsx";
import ChatbotWidget    from "./components/chatbot/ChatbotWidget.jsx";
import PageBannerCommon from "./components/common/PageBannerCommon.jsx";

import Home             from "./pages/Home.jsx";
import FlightSearch     from "./pages/FlightSearch.jsx";
import FlightResults    from "./pages/FlightResults.jsx";
import PassengerDetails from "./pages/PassengerDetails.jsx";
import AddOns           from "./pages/AddOns.jsx";
import BookingSummary   from "./pages/BookingSummary.jsx";
import Payment          from "./pages/Payment.jsx";
import Confirmation     from "./pages/Confirmation.jsx";
import CheckIn          from "./pages/CheckIn.jsx";
import AdminDashboard   from "./pages/AdminDashboard.jsx";

// ── Route map ──────────────────────────────────────────────────────────────
const pageRoutes = {
  home: "/", search: "/search", results: "/results",
  passengers: "/passengers", addons: "/addons", summary: "/summary",
  payment: "/payment", confirmation: "/confirmation",
  checkin: "/checkin", admin: "/admin",
};

const routePages = Object.fromEntries(
  Object.entries(pageRoutes).map(([k, v]) => [v, k])
);

const bannerContent = {
  search:       { eyebrow: "Book a flight",     title: "Search flights",            text: "Find available flights, compare fares and continue your journey." },
  results:      { eyebrow: "Flight selection",  title: "Choose your flights",       text: "Select your outbound flight — and your return flight if travelling both ways." },
  passengers:   { eyebrow: "Passenger details", title: "Tell us who is travelling", text: "Enter passenger and contact details exactly as they appear on your travel document." },
  addons:       { eyebrow: "Add-on services",   title: "Customise your journey",    text: "Select seats, baggage, assistance and meals where available." },
  summary:      { eyebrow: "Booking summary",   title: "Review before payment",     text: "Confirm your itinerary, passenger details, add-ons and total cost before proceeding." },
  payment:      { eyebrow: "Payment",           title: "Complete your payment",     text: "Choose your preferred payment method to complete your booking." },
  confirmation: { eyebrow: "Booking confirmed", title: "Your journey is confirmed", text: "Your booking has been completed successfully." },
  checkin:      { eyebrow: "Online check-in",   title: "Prepare for your journey",  text: "Enter your booking reference and last name to check in." },
  admin:        { eyebrow: "Admin portal",      title: "Secure dashboard access",   text: "Sign in to view booking activity, chatbot logs and operational insights." },
};

// ── Default state values — used on first load and after reset ──────────────
const DEFAULT_SEARCH = {
  tripType: "one-way", origin: "", destination: "",
  departureDate: "", returnDate: "",
  passengers: { adult: 1, child: 0, infant: 0, unmr: 0 },
};

const DEFAULT_CONTACT = {
  title: "Ms", firstName: "", lastName: "",
  phone: "", email: "", confirmEmail: "",
  address: "", country: "Kenya", city: "",
};

const DEFAULT_ADDONS = {
  seat: "", seats: [], extraBaggage: [], specialBaggage: [],
  specialAssistance: [], meal: "",
  passengerMeals: [], passengerBaggage: [],
  lumpExtraBaggageQty: 0, lumpExtraBaggageType: "",
  lumpMealQty: 0, lumpMealType: "",
};

const DEFAULT_BOOKING = {
  bookingReference: "", status: "Draft", paymentStatus: "Not Paid",
  totalAmount: 0, paymentMethod: "", transactionReference: "",
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  // ── All booking state uses plain useState — no sessionStorage ─────────────
  // Plain useState means:
  //   • Data is NOT written to disk / sessionStorage
  //   • A page refresh clears everything automatically
  //   • Different customers using the same browser get a clean slate on refresh
  //   • Navigation within the same tab keeps state (needed during booking flow)

  const [search,        setSearch]        = useState(DEFAULT_SEARCH);
  const [results,       setResults]       = useState([]);
  const [returnResults, setReturnResults] = useState([]);

  const [selectedFlight,       setSelectedFlight]       = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  const [selectedFare,         setSelectedFare]         = useState(null);

  const [passengerDetails, setPassengerDetails] = useState([]);
  const [contactDetails,   setContactDetails]   = useState(DEFAULT_CONTACT);
  const [addons,           setAddons]           = useState(DEFAULT_ADDONS);

  const [booking, setBooking] = useState(DEFAULT_BOOKING);

  // ── Reset — wipes all booking data back to defaults ───────────────────────
  // Called automatically when the customer leaves the confirmation page,
  // so the next customer always starts with a clean form.
  function resetBookingState() {
    setSearch(DEFAULT_SEARCH);
    setResults([]);
    setReturnResults([]);
    setSelectedFlight(null);
    setSelectedReturnFlight(null);
    setSelectedFare(null);
    setPassengerDetails([]);
    setContactDetails(DEFAULT_CONTACT);
    setAddons(DEFAULT_ADDONS);
    setBooking(DEFAULT_BOOKING);
  }

  // startNewBooking: resets state AND navigates to search
  function startNewBooking() {
    resetBookingState();
    navigate(pageRoutes.search);
  }

  const page          = routePages[location.pathname] || "home";
  const currentBanner = bannerContent[page];

  function setPage(pageName) {
    navigate(pageRoutes[pageName] || "/");
  }

  const commonProps = {
    page, setPage,
    startNewBooking,
    resetBookingState,    // passed through so Confirmation can call it on exit
    search, setSearch,
    results, setResults,
    returnResults, setReturnResults,
    selectedFlight,       setSelectedFlight,
    selectedReturnFlight, setSelectedReturnFlight,
    selectedFare,         setSelectedFare,
    passengerDetails,     setPassengerDetails,
    contactDetails,       setContactDetails,
    addons,               setAddons,
    booking,              setBooking,
    openChat: () => setChatOpen(true),
  };

  return (
    <AppShell page={page} setPage={setPage} openChat={() => setChatOpen(true)}>
      {page !== "home" && currentBanner && (
        <div className="global-page-banner-wrap">
          <PageBannerCommon
            eyebrow={currentBanner.eyebrow}
            title={currentBanner.title}
            text={currentBanner.text}
          />
        </div>
      )}

      <Routes>
        <Route path="/"             element={<Home             {...commonProps} />} />
        <Route path="/search"       element={<FlightSearch     {...commonProps} />} />
        <Route path="/results"      element={<FlightResults    {...commonProps} />} />
        <Route path="/passengers"   element={<PassengerDetails {...commonProps} />} />
        <Route path="/addons"       element={<AddOns           {...commonProps} />} />
        <Route path="/summary"      element={<BookingSummary   {...commonProps} />} />
        <Route path="/payment"      element={<Payment          {...commonProps} />} />
        <Route path="/confirmation" element={<Confirmation     {...commonProps} />} />
        <Route path="/checkin"      element={<CheckIn          {...commonProps} />} />
        <Route path="/admin"        element={<AdminDashboard   {...commonProps} />} />
      </Routes>

      <ChatbotWidget
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        setPage={setPage}
        setSearch={setSearch}
        setResults={setResults}
        setSelectedFlight={setSelectedFlight}
        setSelectedReturnFlight={setSelectedReturnFlight}
        setSelectedFare={setSelectedFare}
        setPassengerDetails={setPassengerDetails}
        setContactDetails={setContactDetails}
        setAddons={setAddons}
      />
    </AppShell>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
