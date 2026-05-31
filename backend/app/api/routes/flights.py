from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.domain.models.schemas import FlightSearchRequest
from app.infrastructure.repositories import postgres_repository as repo

router = APIRouter()

FARE_ITEMS = {
    "basic": [
        "10kg cabin baggage",
        "Seat selection at a fee",
        "Standard change rules apply",
    ],
    "fare-plus": [
        "10kg cabin baggage",
        "23kg hold baggage",
        "Free standard seat selection",
        "First change fee waived; fare difference applies",
    ],
}


@router.get("", summary="List all flights")
def all_flights(db: Session = Depends(get_db)):
    return {"flights": repo.list_flights(db)}


@router.get("/airports", summary="List airports")
def airports(db: Session = Depends(get_db)):
    return {"airports": repo.list_airports(db)}


@router.post("/search", summary="Search available flights")
def search(payload: FlightSearchRequest, db: Session = Depends(get_db)):
    outbound = repo.search_flights(db, payload.origin, payload.destination)

    response = {
        "flights":   outbound,
        "trip_type": payload.trip_type,
    }

    # For return trips also fetch the reverse-direction flights so the
    # frontend can offer a second-leg selection panel.
    if payload.trip_type == "return":
        inbound = repo.search_flights(db, payload.destination, payload.origin)
        response["return_flights"] = inbound

    return response


@router.get("/{flight_id}/fares", summary="Retrieve fares for a flight")
def fares(flight_id: str, db: Session = Depends(get_db)):
    flight = repo.get_flight(db, flight_id)

    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found.")

    return {
        "fares": [
            {
                "id":     "basic",
                "name":   "Basic",
                "amount": flight["basic_fare"],
                "items":  FARE_ITEMS["basic"],
            },
            {
                "id":     "fare-plus",
                "name":   "Fare Plus+",
                "amount": flight["plus_fare"],
                "items":  FARE_ITEMS["fare-plus"],
            },
        ]
    }
