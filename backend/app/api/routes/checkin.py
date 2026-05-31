from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.application.services.booking_service import retrieve_booking
from app.database.connection import get_db
from app.domain.models.schemas import CheckInRequest

router = APIRouter()


@router.post("/search", summary="Check in with PNR and last name")
def checkin(payload: CheckInRequest, db: Session = Depends(get_db)):
    booking = retrieve_booking(db, payload.pnr)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking["status"] not in ("Confirmed", "Checked In", "Boarding Pass Generated"):
        raise HTTPException(status_code=400, detail="Booking is not eligible for check-in")
    return {"booking": booking, "checkin_status": "Eligible", "boarding_pass_available": True}
