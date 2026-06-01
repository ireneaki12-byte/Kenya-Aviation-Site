// Renamed from emailservice.js (case-sensitive imports break on Linux hosts)
// and fixed to use the real export name from apiClient.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://kenya-aviation-backend.onrender.com";

export async function sendItineraryEmail(payload) {
  const response = await fetch(`${API_BASE_URL}/api/email/itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || err.message || "Failed to send itinerary email.");
  }
  return response.json();
}
