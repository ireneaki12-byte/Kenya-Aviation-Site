from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.application.services import booking_service, pricing_service
from app.database.connection import get_db
from app.domain.models.schemas import (
    BookingDraftRequest,
    ContactDetailsRequest,
    PassengerDetailsRequest,
)

router = APIRouter()


@router.post("/quote", summary="Price a selection without persisting it")
def quote(payload: BookingDraftRequest, db: Session = Depends(get_db)):
    return pricing_service.quote_selection(
        db, payload.flight_id, payload.fare_type,
        payload.passengers.model_dump(), payload.addons,
    )


@router.post("/draft", summary="Create a booking draft with a server-priced total")
def create_draft(payload: BookingDraftRequest, db: Session = Depends(get_db)):
    return booking_service.create_draft(
        db, payload.flight_id, payload.fare_type,
        payload.passengers.model_dump(), payload.addons,
    )


@router.post("/{reference}/passengers", summary="Add a passenger to a booking")
def add_passenger(reference: str, payload: PassengerDetailsRequest, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["passenger_type"] = "adult"
    passenger_id = booking_service.add_passenger(db, reference, data)
    return {"booking_reference": reference, "passenger_id": passenger_id}


@router.post("/{reference}/contact", summary="Add contact details")
def add_contact(reference: str, payload: ContactDetailsRequest, db: Session = Depends(get_db)):
    if payload.email != payload.confirm_email:
        raise HTTPException(status_code=400, detail="Email and confirm email do not match")
    data = payload.model_dump()
    data.pop("confirm_email", None)
    contact_id = booking_service.add_contact(db, reference, data)
    return {"booking_reference": reference, "contact_id": contact_id}


@router.post("/{reference}/confirm", summary="Confirm a paid booking")
def confirm(reference: str, db: Session = Depends(get_db)):
    booking = booking_service.confirm(db, reference)
    return {
        "booking_reference": booking["pnr"],
        "status": booking["status"],
        "payment_status": booking["payment_status"],
        "total_amount": booking["total"],
    }


@router.get("/{reference}", summary="Retrieve a booking")
def get_booking(reference: str, db: Session = Depends(get_db)):
    booking = booking_service.retrieve_booking(db, reference)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
