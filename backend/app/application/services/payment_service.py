"""Simulated payment. The charged amount is the booking's *server-stored* total,
never the client-supplied figure, and the lifecycle moves through the state
machine (Draft -> Pending Payment -> Confirmed | Payment Failed).
"""

from uuid import uuid4

from sqlalchemy.orm import Session

from app.domain.booking import booking_state
from app.infrastructure.repositories import postgres_repository as repo


def process_payment(db: Session, booking_reference: str, method: str, succeed: bool = True) -> dict:
    booking = repo.get_booking(db, booking_reference)
    if not booking:
        return {"success": False, "message": "Booking not found", "booking_reference": booking_reference}

    amount = int(booking["total"] or 0)  # authoritative: ignore any client amount

    # Draft -> Pending Payment
    if booking["status"] == "Draft":
        booking_state.assert_transition(booking["status"], "Pending Payment")
        repo.update_booking(db, booking_reference, status="Pending Payment")

    reference = f"PAY-{uuid4().hex[:8].upper()}"

    if not succeed:
        repo.record_payment(db, booking_reference, method, amount, "Failed", reference)
        booking_state.assert_transition("Pending Payment", "Payment Failed")
        repo.update_booking(db, booking_reference, payment_status="Failed", status="Payment Failed")
        return {"success": False, "message": "Payment was declined", "booking_reference": booking_reference}

    repo.record_payment(db, booking_reference, method, amount, "Succeeded", reference)
    booking_state.assert_transition("Pending Payment", "Confirmed")
    repo.update_booking(
        db, booking_reference,
        payment_status="Succeeded", status="Confirmed", payment_reference=reference,
    )
    return {
        "success": True,
        "booking_reference": booking_reference,
        "payment_status": "Succeeded",
        "transaction_reference": reference,
        "amount": amount,
        "method": method,
    }
