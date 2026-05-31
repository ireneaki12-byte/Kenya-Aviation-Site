"""Resolves a customer's selection into catalogue prices, then asks the pure
domain to compute the total. This is the only place a charged total is produced.
"""

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core import config
from app.domain.booking import pricing
from app.infrastructure.repositories import postgres_repository as repo


def _as_list(value):
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def resolve_fees(db: Session, flight_id: str, fare_type: str, addons: dict | None) -> pricing.LineItemFees:
    addons = addons or {}

    # Seat: waived on Fare Plus+, otherwise the seat's catalogue price.
    seat_fee = 0
    seat = addons.get("seat")
    if seat and fare_type != config.FARE_PLUS_ID:
        price = repo.get_seat_price(db, flight_id, seat)
        seat_fee = price if price is not None else config.DEFAULT_SEAT_FEE

    prices = repo.get_addon_prices(
        db,
        _as_list(addons.get("extraBaggage"))
        + _as_list(addons.get("specialBaggage"))
        + _as_list(addons.get("specialAssistance"))
        + _as_list(addons.get("meal")),
    )

    def sum_ids(ids):
        return sum(prices.get(i, 0) for i in _as_list(ids))

    return pricing.LineItemFees(
        seat_fee=seat_fee,
        extra_baggage_fee=sum_ids(addons.get("extraBaggage")),
        special_baggage_fee=sum_ids(addons.get("specialBaggage")),
        assistance_fee=sum_ids(addons.get("specialAssistance")),
        meal_fee=sum_ids(addons.get("meal")),
    )


def quote_selection(db: Session, flight_id: str, fare_type: str, passengers: dict, addons: dict) -> dict:
    flight = repo.get_flight(db, flight_id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    fare_amount = flight["plus_fare"] if fare_type == config.FARE_PLUS_ID else flight["basic_fare"]
    counts = pricing.PassengerCounts.from_dict(passengers)
    fees = resolve_fees(db, flight_id, fare_type, addons)
    return pricing.quote(fare_amount, counts, fees)
