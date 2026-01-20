from __future__ import annotations

import hashlib
import hmac
import os
from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_db
from src.entities.system_error import SystemError
from src.entities.user import User
from src.auth.token import mint_token

router = APIRouter(prefix="/auth", tags=["auth"])

_ITER = int(os.getenv("PWD_ITER", "210000"))
_SALT = os.getenv("PWD_SALT", "change-me-salt").encode("utf-8")

def hash_password(password: str) -> str:
    pw = password.encode("utf-8")
    dk = hashlib.pbkdf2_hmac("sha256", pw, _SALT, _ITER)
    return dk.hex()

def verify_password(password: str, password_hash: str) -> bool:
    return hmac.compare_digest(hash_password(password), password_hash)

class LoginIn(BaseModel):
    t_name: str
    password: str

class LoginResult(BaseModel):
    t_name: str
    name: str
    team_name: str | None
    release_date: datetime | None
    access_token: str
    token_type: str = "bearer"

@router.post("/login", response_model=LoginResult)
async def login(payload: LoginIn, db: AsyncSession = Depends(get_db)):
    t_name = (payload.t_name or "").strip()
    password = payload.password or ""

    if not t_name or not password:
        raise SystemError(400, "Send {t_name} and {password}")

    user = await db.get(User, t_name)
    if not user:
        raise SystemError(401, "User not found")

    if not verify_password(password, user.password_hash):
        raise SystemError(401, "Bad credentials")

    token = mint_token(t_name=user.t_name)
    return LoginResult(
        t_name=user.t_name,
        name=user.name,
        team_name=user.team_name,
        release_date=user.release_date,
        access_token=token,
    )
