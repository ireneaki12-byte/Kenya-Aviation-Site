import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    addons,
    admin,
    admin_auth,
    bookings,
    chat,
    checkin,
    email,
    flights,
    passengers,
    payments,
)

app = FastAPI(title="Kenya Aviation API")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

render_origins = os.getenv("ALLOWED_ORIGINS", "")

if render_origins:
    allowed_origins.extend(
        origin.strip()
        for origin in render_origins.split(",")
        if origin.strip()
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(flights.router, prefix="/api/flights", tags=["flights"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(addons.router, prefix="/api/addons", tags=["addons"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(checkin.router, prefix="/api/checkin", tags=["checkin"])
app.include_router(passengers.router, prefix="/api/passengers", tags=["passengers"])
app.include_router(email.router, prefix="/api/email", tags=["email"])
app.include_router(admin_auth.router, prefix="/api/admin-auth", tags=["admin-auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/")
def root():
    return {
        "message": "Kenya Aviation API is running",
        "health": "/api/health",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}