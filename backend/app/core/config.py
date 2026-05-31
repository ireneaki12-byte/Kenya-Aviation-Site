"""Central application configuration.

load_dotenv() is called HERE, before any os.getenv() reads, so that .env
values are available for every subsequent config constant.
"""

import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


# ---------------------------------------------------------------------------
# Anthropic API (powers the agentic chatbot)
# ---------------------------------------------------------------------------
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")   # required for AI chat


# ---------------------------------------------------------------------------
# Pricing rules (data-independent — per-item prices live in the DB)
# ---------------------------------------------------------------------------
FARE_PLUS_ID           = "fare-plus"
TAX_PER_PASSENGER      = 2000
INFANT_FARE_MULTIPLIER = 0.10
FULL_FARE_CATEGORIES   = ("adult", "child", "unmr")
DEFAULT_SEAT_FEE       = 750


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/kenya_aviation_site",
)


# ---------------------------------------------------------------------------
# Security / admin authentication
# ---------------------------------------------------------------------------
ADMIN_EMAIL             = os.getenv("ADMIN_EMAIL", "admin@kenyaaviation.example")
ADMIN_PASSWORD          = os.getenv("ADMIN_PASSWORD")
JWT_SECRET              = os.getenv("JWT_SECRET")
JWT_ALGORITHM           = "HS256"
ADMIN_TOKEN_TTL_MINUTES = int(os.getenv("ADMIN_TOKEN_TTL_MINUTES", "60"))
OTP_TTL_MINUTES         = int(os.getenv("OTP_TTL_MINUTES", "5"))


# ---------------------------------------------------------------------------
# SMTP
# ---------------------------------------------------------------------------
SMTP_HOST       = os.getenv("SMTP_HOST")
SMTP_PORT       = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME   = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD   = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USERNAME or ADMIN_EMAIL)


# ---------------------------------------------------------------------------
# CORS — all four local dev origins so the airport dropdown is never blocked
# ---------------------------------------------------------------------------
_default_origins = ",".join([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
])
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if o.strip()
]
