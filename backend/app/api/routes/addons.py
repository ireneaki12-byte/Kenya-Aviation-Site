from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.infrastructure.repositories import postgres_repository as repo

router = APIRouter()


@router.get(
    "/seats/{flight_id}",
    summary="List seats for a flight",
    description="Returns the seat map for the selected flight from PostgreSQL.",
)
def seats(flight_id: str, db: Session = Depends(get_db)):
    return {"seats": repo.list_seats(db, flight_id)}


@router.get(
    "/extra-baggage",
    summary="List extra baggage options",
)
def extra_baggage(db: Session = Depends(get_db)):
    return {"extra_baggage": repo.list_addons_by_category(db, "extra_baggage")}


@router.get(
    "/special-baggage",
    summary="List special baggage options",
)
def special_baggage(db: Session = Depends(get_db)):
    return {"special_baggage": repo.list_addons_by_category(db, "special_baggage")}


@router.get(
    "/special-assistance",
    summary="List special assistance options",
)
def special_assistance(db: Session = Depends(get_db)):
    return {"special_assistance": repo.list_addons_by_category(db, "special_assistance")}


@router.get(
    "/meals",
    summary="List meal options",
)
def meals(db: Session = Depends(get_db)):
    return {"meals": repo.list_addons_by_category(db, "meal")}