"""Unit tests for the pure pricing domain (no DB)."""
from app.domain.booking.pricing import PassengerCounts, LineItemFees, quote
from app.core import config


def test_basic_single_adult_no_addons():
    counts = PassengerCounts(adult=1)
    result = quote(7800, counts, LineItemFees())
    assert result["full_passenger_fare"] == 7800
    assert result["taxes_and_fees"] == config.TAX_PER_PASSENGER
    assert result["total"] == 7800 + config.TAX_PER_PASSENGER


def test_infant_priced_at_ten_percent_and_taxed():
    counts = PassengerCounts(adult=1, infant=1)
    result = quote(10000, counts, LineItemFees())
    assert result["infant_fare"] == 1000           # 10% of fare
    assert result["taxes_and_fees"] == 2 * config.TAX_PER_PASSENGER
    assert result["total"] == 10000 + 1000 + 2 * config.TAX_PER_PASSENGER


def test_unmr_pays_full_fare():
    counts = PassengerCounts(unmr=1)
    result = quote(6800, counts, LineItemFees())
    assert result["full_passenger_fare"] == 6800


def test_ancillary_fees_are_summed():
    fees = LineItemFees(seat_fee=750, extra_baggage_fee=2500, meal_fee=900)
    result = quote(8000, PassengerCounts(adult=1), fees)
    assert result["ancillary"]["total"] == 4150
    assert result["total"] == 8000 + config.TAX_PER_PASSENGER + 4150


def test_passenger_counts_from_dict():
    counts = PassengerCounts.from_dict({"adult": 2, "child": 1, "infant": 1})
    assert counts.total == 4
    assert counts.full_fare == 3
