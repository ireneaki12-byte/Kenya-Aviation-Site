from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.application.services.payment_service import process_payment
from app.database.connection import get_db
from app.domain.models.schemas import PaymentRequest

router = APIRouter()


@router.post("/simulate", summary="Process a simulated payment")
def simulate_payment(payload: PaymentRequest, db: Session = Depends(get_db)):
    if not payload.booking_reference:
        raise HTTPException(status_code=400, detail="booking_reference is required")

    # The charged amount is taken from the stored booking total, not the client.
    result = process_payment(db, payload.booking_reference, payload.method)
    if not result["success"]:
        raise HTTPException(status_code=402, detail=result["message"])
    return result
