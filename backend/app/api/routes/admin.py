from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.infrastructure.repositories import postgres_repository as repo

router = APIRouter()


@router.get("/analytics", summary="Dashboard analytics")
def analytics(db: Session = Depends(get_db)):
    bookings = repo.list_bookings(db)
    chat_logs = repo.list_chat_logs(db)
    notifications = repo.list_notifications(db)
    revenue = sum(int(b.get("total") or 0) for b in bookings)
    return {
        "booking_count": len(bookings),
        "revenue": revenue,
        "chat_log_count": len(chat_logs),
        "notification_count": len(notifications),
        "bookings": bookings,
        "chat_logs": chat_logs,
        "notifications": notifications,
    }


@router.get("/bookings")
def bookings(db: Session = Depends(get_db)):
    return {"bookings": repo.list_bookings(db)}


@router.get("/chat-logs")
def chat_logs(db: Session = Depends(get_db)):
    return {"chat_logs": repo.list_chat_logs(db)}


@router.get("/notifications")
def notifications(db: Session = Depends(get_db)):
    return {"notifications": repo.list_notifications(db)}


@router.get("/export/bookings")
def export_bookings(db: Session = Depends(get_db)):
    return repo.list_bookings(db)


@router.get("/export/chat-logs")
def export_chat_logs(db: Session = Depends(get_db)):
    return repo.list_chat_logs(db)
