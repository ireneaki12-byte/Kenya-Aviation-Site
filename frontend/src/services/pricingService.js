// The backend is authoritative for the charged total. This helper fetches a
// server-computed quote so the UI displays exactly what will be charged.

import { getBookingQuote } from "./apiClient.js";

function getPassengerCategory(passenger) {
  return passenger?.category || passenger?.type || "";
}

function toCounts(passengerDetails = []) {
  const list = Array.isArray(passengerDetails) ? passengerDetails : [];

  const by = (category) =>
    list.filter((passenger) => getPassengerCategory(passenger) === category)
      .length;

  return {
    adult: by("adult"),
    child: by("child"),
    infant: by("infant"),
    unmr: by("unmr") + by("um"),
  };
}

function getFlightId(selectedFlight) {
  return (
    selectedFlight?.id ||
    selectedFlight?.flight_id ||
    selectedFlight?.flightId
  );
}

function getFareType(selectedFare) {
  return (
    selectedFare?.id ||
    selectedFare?.fare_type ||
    selectedFare?.fareType ||
    selectedFare?.fareCode ||
    selectedFare?.code
  );
}

/**
 * Fetch a server-priced breakdown for the current selection.
 * @returns the backend quote object: { total, fare_amount, taxes_and_fees, ancillary, ... }
 */
export function fetchQuote({
  selectedFlight,
  selectedFare,
  passengerDetails = [],
  addons = {},
}) {
  const flightId = getFlightId(selectedFlight);
  const fareType = getFareType(selectedFare);

  if (!flightId) {
    return Promise.reject(
      new Error("Missing flight_id. Please go back and select a flight.")
    );
  }

  if (!fareType) {
    return Promise.reject(
      new Error("Missing fare_type. Please go back and select a fare.")
    );
  }

  return getBookingQuote({
    flight_id: flightId,
    fare_type: fareType,
    passengers: toCounts(passengerDetails),
    addons: addons || {},
  });
}