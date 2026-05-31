from app.domain.rules.passenger_rules import validate_passengers, requires_unmr


def test_valid_single_adult():
    assert validate_passengers({"adult": 1}) == ""


def test_infant_without_adult_rejected():
    assert "infant" in validate_passengers({"infant": 1}).lower()


def test_too_many_passengers_rejected():
    assert "exceed" in validate_passengers({"adult": 10}).lower()


def test_infants_cannot_exceed_adults():
    assert "infants" in validate_passengers({"adult": 1, "infant": 2}).lower()


def test_requires_unmr_flag():
    assert requires_unmr({"unmr": 1}) is True
    assert requires_unmr({"adult": 1}) is False
