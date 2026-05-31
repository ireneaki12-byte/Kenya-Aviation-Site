import uuid

def simulate_payment(amount: int, method: str) -> dict:
    if amount <= 0:
        return {"status": "Failed", "reason": "Invalid amount"}
    return {"status": "Succeeded", "method": method, "transaction_reference": f"PAY-{uuid.uuid4().hex[:8].upper()}"}
