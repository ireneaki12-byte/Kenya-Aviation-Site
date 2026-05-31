"""Orchestrates the booking lifecycle: create a real draft (unique PNR, server
total), persist passengers/contact, and confirm only after a successful payment.
"""

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.application.services import pricing_service
from app.infrastructure.repositories import postgres_repository as repo


def create_draft(db: Session, flight_id: str, fare_type: str, passengers: dict, addons: dict) -> dict:
    quote = pricing_service.quote_selection(db, flight_id, fare_type, passengers, addons)
    pnr = repo.generate_pnr(db)
    booking = repo.create_booking(db, pnr, flight_id, fare_type, quote["total"])
    return {
        "booking_reference": booking["pnr"],
        "status": booking["status"],
        "payment_status": booking["payment_status"],
        "total_amount": booking["total"],
        "quote": quote,
    }


def add_passenger(db: Session, pnr: str, payload: dict) -> int:
    if not repo.get_booking(db, pnr):
        raise HTTPException(status_code=404, detail="Booking not found")
    return repo.add_passenger(db, pnr, payload)


def add_contact(db: Session, pnr: str, payload: dict) -> int:
    if not repo.get_booking(db, pnr):
        raise HTTPException(status_code=404, detail="Booking not found")
    return repo.add_contact(db, pnr, payload)


def confirm(db: Session, pnr: str) -> dict:
    booking = repo.get_booking(db, pnr)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking["payment_status"] not in ("Succeeded", "Paid"):
        raise HTTPException(status_code=400, detail="Booking cannot be confirmed before successful payment")
    # State is already moved to Confirmed by payment; this is idempotent.
    return repo.get_booking(db, pnr)


def retrieve_booking(db: Session, reference: str):
    return repo.get_booking(db, reference)


def list_all_bookings(db: Session):
    return repo.list_bookings(db)
