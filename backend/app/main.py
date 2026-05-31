from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import config
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

# add_middleware is the correct FastAPI pattern — `app` stays the FastAPI
# instance so uvicorn, docs, and health checks all use the same object.
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(flights.router,    prefix="/api/flights",     tags=["flights"])
app.include_router(bookings.router,   prefix="/api/bookings",    tags=["bookings"])
app.include_router(addons.router,     prefix="/api/addons",      tags=["addons"])
app.include_router(chat.router,       prefix="/api/chat",        tags=["chat"])
app.include_router(payments.router,   prefix="/api/payments",    tags=["payments"])
app.include_router(checkin.router,    prefix="/api/checkin",     tags=["checkin"])
app.include_router(passengers.router, prefix="/api/passengers",  tags=["passengers"])
app.include_router(email.router,      prefix="/api/email",       tags=["email"])
app.include_router(admin_auth.router, prefix="/api/admin-auth",  tags=["admin-auth"])
app.include_router(admin.router,      prefix="/api/admin",       tags=["admin"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
