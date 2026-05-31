from typing import Optional, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.application.services.ai_conversation_service import handle_chat
from app.database.connection import get_db

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default-session"

    # Avoid using [] as a default because it is mutable.
    # Field(default_factory=list) creates a fresh list for each request.
    conversation_history: list[Any] = Field(default_factory=list)


@router.post(
    "",
    summary="Chat with the agentic travel assistant",
    description=(
        "Processes customer messages through the Claude-powered travel assistant. "
        "The agent can search flights, collect passenger details, and navigate the "
        "customer to the booking summary page automatically."
    ),
)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    try:
        return handle_chat(
            db=db,
            message=payload.message,
            session_id=payload.session_id or "default-session",
            conversation_history=payload.conversation_history or [],
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Chat service error: {str(exc)}",
        )