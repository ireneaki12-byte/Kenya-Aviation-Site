from datetime import datetime
from app.infrastructure.repositories.in_memory_store import add_notification

def log_notification(kind: str, recipient: str, message: str):
    return add_notification({"kind": kind, "recipient": recipient, "message": message, "timestamp": datetime.utcnow().isoformat()})
