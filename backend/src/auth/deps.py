from __future__ import annotations
import os

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.auth.token import verify_token
from src.entities.system_error import SystemError

security = HTTPBearer(auto_error=False)

ADMIN_T_NANE = os.getenv("ADMIN_T_NANE")

async def get_current_identity(creds: HTTPAuthorizationCredentials | None = Depends(security)):
    if not creds or not creds.credentials:
        raise SystemError(401, "Unauthorized")

    payload = verify_token(creds.credentials)
    return payload

async def require_adam_sin(identity = Depends(get_current_identity)):
    if identity.get("t_name") != ADMIN_T_NANE:
        raise SystemError(403, "Forbidden")
    return identity
