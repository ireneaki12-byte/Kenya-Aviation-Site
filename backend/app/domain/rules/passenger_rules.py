"""Single authoritative passenger-eligibility rule set (the React copies should
call /api/passengers/validate or share these messages, not re-implement them).
"""


def validate_passengers(passengers: dict) -> str:
    adult = int(passengers.get("adult", 0))
    child = int(passengers.get("child", 0))
    infant = int(passengers.get("infant", 0))
    unmr = int(passengers.get("unmr", 0))

    if infant > 0 and adult < 1:
        return "An infant cannot travel without an adult."
    if adult + child < 1 and unmr < 1:
        return "Add at least one adult/child or one child travelling alone."
    if adult + child > 9:
        return "Adults and children cannot exceed 9 passengers."
    if infant > adult:
        return "Infants cannot exceed adults."
    return ""


def requires_unmr(passengers: dict) -> bool:
    return int(passengers.get("unmr", 0)) > 0
