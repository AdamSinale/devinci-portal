from sqlalchemy.ext.asyncio import AsyncSession
from src.services.auth import login_service

async def login_controller(db: AsyncSession, payload: dict):
    return await login_service(db=db, payload=payload)
