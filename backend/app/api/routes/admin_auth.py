import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage
from random import randint
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.core import config
from app.core.security import issue_admin_token

router = APIRouter()

# In-memory OTP store is acceptable for the demo. For multi-worker production
# this should move to Redis or the database (noted in the design document).
OTP_STORE: dict = {}


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminOtpVerifyRequest(BaseModel):
    session_id: str
    otp: str


def _send_otp_email(to_email: str, otp: str) -> None:
    body = (f"Your Kenya Aviation admin verification code is {otp}.\n\n"
            f"This code expires in {config.OTP_TTL_MINUTES} minutes.")
    if not (config.SMTP_HOST and config.SMTP_USERNAME and config.SMTP_PASSWORD):
        print(f"[DEV OTP] {to_email}: {otp}")
        return
    msg = EmailMessage()
    msg["Subject"] = "Kenya Aviation Admin OTP"
    msg["From"] = config.SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg.set_content(body)
    with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
        server.starttls()
        server.login(config.SMTP_USERNAME, config.SMTP_PASSWORD)
        server.send_message(msg)


@router.post("/login")
def admin_login(payload: AdminLoginRequest):
    if not config.ADMIN_PASSWORD:
        raise HTTPException(status_code=500, detail="Admin auth is not configured")
    if payload.email.lower() != config.ADMIN_EMAIL.lower() or payload.password != config.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    otp = str(randint(100000, 999999))
    session_id = f"ADM-{uuid4().hex[:12].upper()}"
    OTP_STORE[session_id] = {
        "email": payload.email,
        "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=config.OTP_TTL_MINUTES),
    }
    _send_otp_email(payload.email, otp)
    return {"otp_required": True, "session_id": session_id,
            "message": "OTP has been sent to the admin email address."}


@router.post("/verify-otp")
def verify_admin_otp(payload: AdminOtpVerifyRequest):
    session = OTP_STORE.get(payload.session_id)
    if not session:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP session")
    if datetime.utcnow() > session["expires_at"]:
        OTP_STORE.pop(payload.session_id, None)
        raise HTTPException(status_code=400, detail="OTP has expired")
    if payload.otp != session["otp"]:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    OTP_STORE.pop(payload.session_id, None)
    return {
        "authenticated": True,
        "admin_email": session["email"],
        "token": issue_admin_token(session["email"]),
        "message": "Admin authentication successful.",
    }
