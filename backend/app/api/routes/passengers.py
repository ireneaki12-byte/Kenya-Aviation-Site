from fastapi import APIRouter
from app.domain.rules.passenger_rules import validate_passengers, requires_unmr
router = APIRouter()
@router.post("/validate")
def validate(payload: dict):
    error = validate_passengers(payload)
    return {"valid": not bool(error), "error": error, "requires_unmr": requires_unmr(payload)}
