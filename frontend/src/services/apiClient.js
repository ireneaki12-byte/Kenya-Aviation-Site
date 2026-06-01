const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://kenya-aviation-backend.onrender.com";

// Admin JWT — set after OTP verification; attached to /api/admin/* calls.
let adminToken = "";
export function setAdminToken(token) {
  adminToken = token || "";
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "API request failed");
  }
  return response.json();
}

/* Flights */
export const getAirports     = ()         => request("/api/flights/airports");
export const getFlights      = ()         => request("/api/flights");
export const searchFlights   = (payload) => request("/api/flights/search",  { method: "POST", body: JSON.stringify(payload) });
export const getFlightFares  = (flightId) => request(`/api/flights/${flightId}/fares`);

/* Bookings */
export const getBookingQuote     = (payload)      => request("/api/bookings/quote",                  { method: "POST", body: JSON.stringify(payload) });
export const createBookingDraft  = (payload)      => request("/api/bookings/draft",                  { method: "POST", body: JSON.stringify(payload) });
export const addBookingPassenger = (ref, payload) => request(`/api/bookings/${ref}/passengers`,      { method: "POST", body: JSON.stringify(payload) });
export const addBookingContact   = (ref, payload) => request(`/api/bookings/${ref}/contact`,         { method: "POST", body: JSON.stringify(payload) });
export const confirmBooking      = (ref)          => request(`/api/bookings/${ref}/confirm`,         { method: "POST" });

/* Chatbot (standard + agentic) */
export const chatWithAssistant        = (payload) => request("/api/chat", { method: "POST", body: JSON.stringify(payload) });
export const chatWithAssistantAgentic = (payload) => request("/api/chat", { method: "POST", body: JSON.stringify(payload) });

/* Payments */
export const simulatePayment = (payload) => request("/api/payments/simulate", { method: "POST", body: JSON.stringify(payload) });

/* Admin */
export const adminLogin        = (payload) => request("/api/admin-auth/login",      { method: "POST", body: JSON.stringify(payload) });
export const verifyAdminOtp    = (payload) => request("/api/admin-auth/verify-otp", { method: "POST", body: JSON.stringify(payload) });
export const getAdminAnalytics = ()        => request("/api/admin/analytics");
export const getChatLogs       = ()        => request("/api/admin/chat-logs");
export const getBookings       = ()        => request("/api/admin/bookings");

/* Pricing */
export const fetchQuote = (payload) => request("/api/bookings/quote", { method: "POST", body: JSON.stringify(payload) });
