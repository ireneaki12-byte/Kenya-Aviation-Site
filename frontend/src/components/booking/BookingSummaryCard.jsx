import React from "react";
import Button from "../components/common/Button.jsx";
import { useMoney } from "../hooks/useMoney.js";

function getPassengerCounts(search) {
  const passengers = search?.passengers || {};

  const adult = Number(passengers.adult || passengers.adults || 0);
  const child = Number(passengers.child || passengers.children || 0);
  const infant = Number(passengers.infant || passengers.infants || 0);
  const unmr = Number(passengers.unmr || passengers.childrenTravellingAlone || 0);

  return {
    adult,
    child,
    infant,
    unmr,
    total: adult + child + infant + unmr,
    fullFarePassengers: adult + child + unmr,
  };
}

function calculateAncillaryFees(addons, selectedFare) {
  const seatFee = addons?.seat && selectedFare?.id !== "fare-plus" ? 750 : 0;

  const extraBaggageFee = addons?.extraBaggage?.length
    ? addons.extraBaggage.reduce((total, item) => {
        if (item === "BAG-23") return total + 2500;
        if (item === "BAG-32") return total + 3500;
        if (item === "BAG-46") return total + 5000;
        return total + 2500;
      }, 0)
    : 0;

  const specialBaggageFee = addons?.specialBaggage?.length
    ? addons.specialBaggage.length * 3000
    : 0;

  const assistanceFee = addons?.specialAssistance?.length
    ? addons.specialAssistance.length * 0
    : 0;

  const mealFee = addons?.meal ? 900 : 0;

  return {
    seatFee,
    extraBaggageFee,
    specialBaggageFee,
    assistanceFee,
    mealFee,
    total:
      seatFee +
      extraBaggageFee +
      specialBaggageFee +
      assistanceFee +
      mealFee,
  };
}

function calculateBookingTotal(search, selectedFare, addons) {
  const passengerCounts = getPassengerCounts(search);

  const fareAmount = Number(selectedFare?.amount || 0);

  const fullPassengerFare =
    passengerCounts.fullFarePassengers * fareAmount;

  const infantFare =
    passengerCounts.infant * fareAmount * 0.1;

  const taxesAndFees =
    passengerCounts.total * 2000;

  const ancillaryFees = calculateAncillaryFees(addons, selectedFare);

  const total =
    fullPassengerFare +
    infantFare +
    taxesAndFees +
    ancillaryFees.total;

  return {
    passengerCounts,
    fareAmount,
    fullPassengerFare,
    infantFare,
    taxesAndFees,
    ancillaryFees,
    total,
  };
}

export default function BookingSummary({
  search,
  selectedFlight,
  selectedFare,
  passengerDetails,
  contactDetails,
  addons,
  booking,
  setBooking,
  setPage,
}) {
  const money = useMoney();

  const pricing = calculateBookingTotal(search, selectedFare, addons);

  function continueToPayment() {
    setBooking((current) => ({
      ...current,
      totalAmount: pricing.total,
      status: "Pending Payment",
      paymentStatus: "Not Paid",
    }));

    setPage("payment");
  }

  return (
    <main className="section flight-search-page summary-page">
      <div className="container">
        <section className="booking-panel">
          <div className="booking-layout">
            <section className="flight-results-column">
              <div className="card form-card">
                <h3>Flight</h3>

                <p>
                  <strong>{selectedFlight?.flight_number || "Selected flight"}</strong>
                </p>

                <p>
                  {selectedFlight?.origin || search?.origin} →{" "}
                  {selectedFlight?.destination || search?.destination}
                </p>

                <p>
                  {selectedFlight?.departure_time || "Departure time"} →{" "}
                  {selectedFlight?.arrival_time || "Arrival time"}
                </p>
              </div>

              <div className="card form-card">
                <h3>Passengers</h3>

                <p>
                  <strong>Adults:</strong> {pricing.passengerCounts.adult}
                </p>

                <p>
                  <strong>Children:</strong> {pricing.passengerCounts.child}
                </p>

                <p>
                  <strong>Infants:</strong> {pricing.passengerCounts.infant}
                </p>

                <p>
                  <strong>Children travelling alone:</strong>{" "}
                  {pricing.passengerCounts.unmr}
                </p>

                <p>
                  <strong>Total passengers:</strong>{" "}
                  {pricing.passengerCounts.total}
                </p>
              </div>

              <div className="card form-card">
                <h3>Passenger details</h3>

                <p>
                  {passengerDetails?.title} {passengerDetails?.firstName}{" "}
                  {passengerDetails?.lastName}
                </p>

                <p>{passengerDetails?.nationality}</p>

                <p>
                  {passengerDetails?.documentType}:{" "}
                  {passengerDetails?.documentNumber}
                </p>
              </div>

              <div className="card form-card">
                <h3>Contact details</h3>

                <p>{contactDetails?.email}</p>
                <p>{contactDetails?.phone}</p>
                <p>
                  {contactDetails?.city}, {contactDetails?.country}
                </p>
              </div>

              <div className="card form-card">
                <h3>Add-ons</h3>

                <p>
                  <strong>Seat:</strong> {addons?.seat || "Not selected"}
                </p>

                <p>
                  <strong>Extra baggage:</strong>{" "}
                  {addons?.extraBaggage?.[0] || "None"}
                </p>

                <p>
                  <strong>Special baggage:</strong>{" "}
                  {addons?.specialBaggage?.[0] || "None"}
                </p>

                <p>
                  <strong>Assistance:</strong>{" "}
                  {addons?.specialAssistance?.[0] || "None"}
                </p>

                <p>
                  <strong>Meal:</strong> {addons?.meal || "None"}
                </p>
              </div>
            </section>

            <aside className="card summary-card">
              <h3>Price summary</h3>

              <p>
                <strong>Fare package:</strong>{" "}
                {selectedFare?.name || "Not selected"}
              </p>

              <p>
                <strong>Fare per passenger:</strong>{" "}
                {money(pricing.fareAmount)}
              </p>

              <hr />

              <p>
                <strong>Full-fare passengers:</strong>{" "}
                {pricing.passengerCounts.fullFarePassengers} ×{" "}
                {money(pricing.fareAmount)}
              </p>

              <p>
                <strong>Full passenger fare:</strong>{" "}
                {money(pricing.fullPassengerFare)}
              </p>

              <p>
                <strong>Infant fare:</strong>{" "}
                {pricing.passengerCounts.infant} × 10% ={" "}
                {money(pricing.infantFare)}
              </p>

              <p>
                <strong>Taxes and fees:</strong>{" "}
                {pricing.passengerCounts.total} × {money(2000)} ={" "}
                {money(pricing.taxesAndFees)}
              </p>

              <hr />

              <p>
                <strong>Seat fee:</strong>{" "}
                {money(pricing.ancillaryFees.seatFee)}
              </p>

              <p>
                <strong>Extra baggage:</strong>{" "}
                {money(pricing.ancillaryFees.extraBaggageFee)}
              </p>

              <p>
                <strong>Special baggage:</strong>{" "}
                {money(pricing.ancillaryFees.specialBaggageFee)}
              </p>

              <p>
                <strong>Meal:</strong>{" "}
                {money(pricing.ancillaryFees.mealFee)}
              </p>

              <hr />

              <h2>{money(pricing.total)}</h2>

              <div className="summary-actions">
                <Button variant="secondary" onClick={() => setPage("addons")}>
                  Back
                </Button>

                <Button onClick={continueToPayment}>
                  Continue to payment
                </Button>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}