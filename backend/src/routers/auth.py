from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_db
from src.controllers.auth import login_controller
from src.services.auth import LoginResult, LoginIn

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=LoginResult)
async def login(payload: LoginIn, db: AsyncSession = Depends(get_db)):
    return await login_controller(db=db, payload=payload)

