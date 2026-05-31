"""Reusable FastAPI dependencies.

Attach `Depends(require_admin)` to every /api/admin/* route so the dashboard
data is no longer served to anonymous callers.
"""

from fastapi import Header, HTTPException

from app.core.security import verify_admin_token


def require_admin(authorization: str = Header(default="")) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing admin bearer token")

    token = authorization.removeprefix("Bearer ").strip()
    claims = verify_admin_token(token)

    if not claims:
        raise HTTPException(status_code=401, detail="Invalid or expired admin token")

    return claims
