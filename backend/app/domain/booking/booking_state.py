"""Booking lifecycle state machine.

Only the transitions listed here are legal. `assert_transition` raises so
callers cannot silently move a booking into an impossible state (e.g. the old
flow that confirmed a booking after a *failed* payment).
"""

VALID_TRANSITIONS = {
    "Draft": ["Pending Payment", "Cancelled"],
    "Pending Payment": ["Payment Failed", "Confirmed"],
    "Payment Failed": ["Pending Payment", "Cancelled"],
    "Confirmed": ["Checked In"],
    "Checked In": ["Boarding Pass Generated"],
}


def can_transition(current: str, new: str) -> bool:
    return new in VALID_TRANSITIONS.get(current, [])


class InvalidTransitionError(Exception):
    pass


def assert_transition(current: str, new: str) -> None:
    if not can_transition(current, new):
        raise InvalidTransitionError(
            f"Illegal booking transition: {current!r} -> {new!r}"
        )
