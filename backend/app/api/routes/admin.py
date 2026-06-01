from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.database.connection import get_db
from app.infrastructure.repositories import postgres_repository as repo

router = APIRouter()


@router.get("/analytics", summary="Dashboard analytics")
def analytics(db: Session = Depends(get_db), _: str = Depends(require_admin)):
    bookings  = repo.list_bookings(db)
    chat_logs = repo.list_chat_logs(db)
    revenue   = sum(int(b.get("total_amount") or b.get("total") or 0) for b in bookings)
    return {
        "booking_count":   len(bookings),
        "revenue":         revenue,
        "chat_log_count":  len(chat_logs),
        "bookings":        bookings,
        "chat_logs":       chat_logs,
    }


@router.get("/bookings", summary="List all bookings")
def bookings(db: Session = Depends(get_db), _: str = Depends(require_admin)):
    return {"bookings": repo.list_bookings(db)}


@router.get("/chat-logs", summary="List chat logs")
def chat_logs(db: Session = Depends(get_db), _: str = Depends(require_admin)):
    return {"chat_logs": repo.list_chat_logs(db)}


@router.get("/export/bookings", summary="Export bookings as JSON")
def export_bookings(db: Session = Depends(get_db), _: str = Depends(require_admin)):
    return repo.list_bookings(db)


@router.get("/export/chat-logs", summary="Export chat logs as JSON")
def export_chat_logs(db: Session = Depends(get_db), _: str = Depends(require_admin)):
    return repo.list_chat_logs(db)
