import pytest
from app.domain.booking.booking_state import (
    can_transition, assert_transition, InvalidTransitionError,
)


def test_legal_transitions():
    assert can_transition("Draft", "Pending Payment")
    assert can_transition("Pending Payment", "Confirmed")
    assert can_transition("Confirmed", "Checked In")


def test_illegal_transitions():
    assert not can_transition("Draft", "Confirmed")           # cannot skip payment
    assert not can_transition("Payment Failed", "Confirmed")  # must retry first
    assert not can_transition("Confirmed", "Draft")


def test_assert_transition_raises_on_illegal():
    with pytest.raises(InvalidTransitionError):
        assert_transition("Pending Payment", "Checked In")
