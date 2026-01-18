from sqlalchemy.ext.asyncio import AsyncSession
from src.services.auth import login_service, LoginResult, LoginIn

async def login_controller(db: AsyncSession, payload: LoginIn) -> LoginResult:
    return await login_service(db=db, payload=payload)