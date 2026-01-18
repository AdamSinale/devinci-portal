from datetime import datetime
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.routers.system_error import SystemError
from src.entities.user import User

class LoginIn(BaseModel):
    name: str

class LoginResult(BaseModel):
    name: str
    team_name: str|None
    release_date: datetime

async def login_service(db: AsyncSession, payload: LoginIn) -> LoginResult:
    name = payload.name
    if not name or not str(name).strip():
        raise SystemError(400, "Send {t_name} or {name}")

    name = str(name).strip()
    user = await db.get(User, name)
    if user is None:
        res = await db.execute(select(User).where(User.name == name))
        user = res.scalars().first()

    if not user:
        raise SystemError(401, "User not found")

    return LoginResult(name=user.t_name, team_name=user.team_name, release_date=user.release_date)
