from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.base import get_db
from src.controllers.auth import login_controller

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(payload: dict, db: AsyncSession = Depends(get_db)):
    return await login_controller(db=db, payload=payload)
