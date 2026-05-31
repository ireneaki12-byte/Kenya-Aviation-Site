from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.application.services.ai_conversation_service import handle_chat
from app.database.connection import get_db

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default-session"
    # Full conversation history sent from the frontend so the agent
    # has context across multiple turns.
    conversation_history: Optional[list] = []


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
    return handle_chat(
        db=db,
        message=payload.message,
        session_id=payload.session_id or "default-session",
        conversation_history=payload.conversation_history or [],
    )
