"""Admin token issuing and verification.

The previous implementation returned a random UUID as a "token" that no endpoint
ever checked, so every /api/admin/* route was effectively public. This issues a
signed, expiring JWT and gives the admin routes something they can actually
verify (see app/api/dependencies.require_admin).
"""

from datetime import datetime, timedelta, timezone

import jwt  # PyJWT

from app.core import config


def _require_secret() -> str:
    if not config.JWT_SECRET:
        raise RuntimeError(
            "JWT_SECRET is not configured. Set it in the environment before "
            "issuing admin tokens."
        )
    return config.JWT_SECRET


def issue_admin_token(email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "role": "admin",
        "iat": now,
        "exp": now + timedelta(minutes=config.ADMIN_TOKEN_TTL_MINUTES),
    }
    return jwt.encode(payload, _require_secret(), algorithm=config.JWT_ALGORITHM)


def verify_admin_token(token: str) -> dict | None:
    """Return the decoded claims if valid and admin-scoped, else None."""
    try:
        claims = jwt.decode(token, _require_secret(), algorithms=[config.JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None

    if claims.get("role") != "admin":
        return None

    return claims
