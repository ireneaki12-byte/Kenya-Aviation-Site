"""Authoritative price calculation — pure and data-driven.

The domain receives *already-resolved* fees (looked up from the addon/seat
tables by pricing_service). It never hard-codes catalogue prices, so it cannot
drift from the database the way the four old copies did.
"""

from dataclasses import dataclass

from app.core import config


@dataclass(frozen=True)
class PassengerCounts:
    adult: int = 0
    child: int = 0
    infant: int = 0
    unmr: int = 0

    @property
    def total(self) -> int:
        return self.adult + self.child + self.infant + self.unmr

    @property
    def full_fare(self) -> int:
        """Everyone except infants pays a full fare."""
        return self.adult + self.child + self.unmr

    @classmethod
    def from_dict(cls, data: dict | None) -> "PassengerCounts":
        data = data or {}
        return cls(
            adult=int(data.get("adult", 0)),
            child=int(data.get("child", 0)),
            infant=int(data.get("infant", 0)),
            unmr=int(data.get("unmr", 0)),
        )


@dataclass(frozen=True)
class LineItemFees:
    seat_fee: int = 0
    extra_baggage_fee: int = 0
    special_baggage_fee: int = 0
    assistance_fee: int = 0
    meal_fee: int = 0

    @property
    def total(self) -> int:
        return (
            self.seat_fee
            + self.extra_baggage_fee
            + self.special_baggage_fee
            + self.assistance_fee
            + self.meal_fee
        )


def quote(fare_amount: float, passengers: PassengerCounts, fees: LineItemFees) -> dict:
    fare_amount = float(fare_amount or 0)

    full_passenger_fare = passengers.full_fare * fare_amount
    infant_fare = passengers.infant * fare_amount * config.INFANT_FARE_MULTIPLIER
    taxes_and_fees = passengers.total * config.TAX_PER_PASSENGER
    total = full_passenger_fare + infant_fare + taxes_and_fees + fees.total

    return {
        "fare_amount": fare_amount,
        "full_passenger_fare": round(full_passenger_fare),
        "infant_fare": round(infant_fare),
        "taxes_and_fees": taxes_and_fees,
        "ancillary": {
            "seat_fee": fees.seat_fee,
            "extra_baggage_fee": fees.extra_baggage_fee,
            "special_baggage_fee": fees.special_baggage_fee,
            "assistance_fee": fees.assistance_fee,
            "meal_fee": fees.meal_fee,
            "total": fees.total,
        },
        "total": round(total),
    }
