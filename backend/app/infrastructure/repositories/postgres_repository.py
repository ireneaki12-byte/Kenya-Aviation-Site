"""Persistence gateway. Reads return plain dicts; writes go through here too so
the routers/services never touch the ORM session directly.
"""

import random
import string

from sqlalchemy.orm import Session  # type: ignore[import]

from app.database.models import (
    AddOn,
    Airport,
    Booking,
    ChatLog,
    Contact,
    Flight,
    NotificationLog,
    Passenger,
    Payment,
    Seat,
)


def model_to_dict(model):
    if model is None:
        return None
    return {
        column.name: getattr(model, column.name)
        for column in model.__table__.columns
    }


# --- Reads -----------------------------------------------------------------
def list_airports(db: Session):
    return [model_to_dict(r) for r in db.query(Airport).all()]


def list_flights(db: Session):
    return [model_to_dict(r) for r in db.query(Flight).all()]


def get_flight(db: Session, flight_id: str):
    return model_to_dict(db.query(Flight).filter(Flight.id == flight_id).first())


def search_flights(db: Session, origin: str, destination: str):
    rows = (
        db.query(Flight)
        .filter(Flight.origin == origin, Flight.destination == destination)
        .all()
    )
    return [model_to_dict(r) for r in rows]


def list_seats(db: Session, flight_id: str):
    rows = db.query(Seat).filter(Seat.flight_id == flight_id).all()
    return [model_to_dict(r) for r in rows]


def list_addons_by_category(db: Session, category: str):
    rows = db.query(AddOn).filter(AddOn.category == category).all()
    return [model_to_dict(r) for r in rows]


def list_bookings(db: Session):
    return [model_to_dict(r) for r in db.query(Booking).all()]


def get_booking(db: Session, pnr: str):
    return model_to_dict(db.query(Booking).filter(Booking.pnr == pnr).first())


def list_chat_logs(db: Session):
    return [model_to_dict(r) for r in db.query(ChatLog).all()]


def list_notifications(db: Session):
    return [model_to_dict(r) for r in db.query(NotificationLog).all()]


# --- Price lookups (catalogue is the source of truth) ----------------------
def get_addon_prices(db: Session, addon_ids) -> dict:
    """Return {addon_id: price} for the requested ids."""
    ids = [i for i in (addon_ids or []) if i]
    if not ids:
        return {}
    rows = db.query(AddOn).filter(AddOn.id.in_(ids)).all()
    return {row.id: int(row.price or 0) for row in rows}


def get_seat_price(db: Session, flight_id: str, seat_number: str):
    if not seat_number:
        return None
    row = (
        db.query(Seat)
        .filter(Seat.flight_id == flight_id, Seat.seat_number == seat_number)
        .first()
    )
    return int(row.price or 0) if row else None


# --- Writes ----------------------------------------------------------------
def generate_pnr(db: Session) -> str:
    """Unique customer-facing booking reference (e.g. KAS7K9PQ)."""
    while True:
        candidate = "KAS" + "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
        if not db.query(Booking).filter(Booking.pnr == candidate).first():
            return candidate


def create_booking(db: Session, pnr: str, flight_id: str, fare_type: str, total: int) -> dict:
    booking = Booking(
        pnr=pnr,
        status="Draft",
        payment_status="Not Paid",
        flight_id=flight_id,
        fare_type=fare_type,
        total=total,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return model_to_dict(booking)


def add_passenger(db: Session, pnr: str, passenger: dict) -> int:
    row = Passenger(booking_pnr=pnr, **passenger)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row.id


def add_contact(db: Session, pnr: str, contact: dict) -> int:
    row = Contact(booking_pnr=pnr, **contact)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row.id


def record_payment(db: Session, pnr: str, method: str, amount: int, status: str, reference: str) -> None:
    db.add(Payment(
        booking_pnr=pnr,
        method=method,
        amount=amount,
        status=status,
        transaction_reference=reference,
    ))
    db.commit()


def update_booking(db: Session, pnr: str, **fields) -> dict | None:
    booking = db.query(Booking).filter(Booking.pnr == pnr).first()
    if not booking:
        return None
    for key, value in fields.items():
        setattr(booking, key, value)
    db.commit()
    db.refresh(booking)
    return model_to_dict(booking)
