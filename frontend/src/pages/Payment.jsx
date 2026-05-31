import React, { useState } from "react";
import PageTitle from "../components/common/PageTitle.jsx";
import ProgressSteps from "../components/common/ProgressSteps.jsx";
import Button from "../components/common/Button.jsx";
import { simulatePayment } from "../services/apiClient";
import { useMoney } from "../hooks/useMoney.js";

export default function Payment({ booking, setBooking, setPage }) {
  const money = useMoney();
  const [method, setMethod] = useState("card");
  const [phone, setPhone] = useState("0712345678");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    setError("");

    // A real draft must exist (created on the summary step). No demo-PNR fallback.
    if (!booking.bookingReference) {
      setError("Your booking session expired. Please go back and review your summary again.");
      return;
    }

    try {
      setProcessing(true);

      // Amount is no longer sent as the source of truth; the server charges the
      // stored booking total. We still pass it for the audit trail.
      const response = await simulatePayment({
        booking_reference: booking.bookingReference,
        amount: Number(booking.totalAmount || 0),
        method,
      });

      setBooking((current) => ({
        ...current,
        paymentStatus: response.payment_status,
        paymentMethod: method,
        transactionReference: response.transaction_reference,
        totalAmount: response.amount,
        status: "Confirmed",
      }));

      setPage("confirmation");
    } catch (err) {
      console.error("Payment failed:", err);
      // A failed payment must NOT confirm the booking.
      setBooking((current) => ({ ...current, paymentStatus: "Failed", status: "Payment Failed" }));
      setError("Your payment could not be completed. Please try again or use a different method.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <main className="section">
      <div className="container">
        <ProgressSteps current={5} />
        <PageTitle
          eyebrow="Payment"
          title="Complete your payment"
          text="Choose your preferred payment method to complete your booking."
        />

        <div className="booking-layout">
          <section className="flight-results-column">
            <div className="card form-card">
              <h3>Payment method</h3>
              <div className="payment-options">
                <button type="button"
                  className={method === "card" ? "payment-option selected" : "payment-option"}
                  onClick={() => setMethod("card")}>Card payment</button>
                <button type="button"
                  className={method === "mpesa" ? "payment-option selected" : "payment-option"}
                  onClick={() => setMethod("mpesa")}>M-Pesa</button>
              </div>

              {method === "card" ? (
                <div className="form-grid">
                  <label className="form-field"><span>Card number</span>
                    <input value="4111 1111 1111 1111" readOnly /></label>
                  <label className="form-field"><span>Expiry</span>
                    <input value="12/30" readOnly /></label>
                  <label className="form-field"><span>Security code</span>
                    <input value="123" readOnly /></label>
                </div>
              ) : (
                <label className="form-field"><span>M-Pesa phone number</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
              )}

              {error && <div className="alert alert-danger">{error}</div>}
            </div>
          </section>

          <aside className="card summary-card">
            <h3>Amount due</h3>
            <h2>{money(booking.totalAmount || 0)}</h2>
            <p>Payment method: {method === "card" ? "Card payment" : "M-Pesa"}</p>
            <div className="summary-actions">
              <Button variant="secondary" onClick={() => setPage("summary")}>Back</Button>
              <Button onClick={handlePayment} disabled={processing}>
                {processing ? "Processing..." : "Pay now"}
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
