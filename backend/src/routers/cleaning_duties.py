from __future__ import annotations

from datetime import date
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import require_admin
from src.db import get_db

from src.entities.cleaning_duties import CleaningDuty
from src.services.common_actions import (list_all, create_one, update_one, delete_one)

class CleaningDutyCreate(BaseModel):
    name1: str
    name2: str
    start_date: date
    end_date: date

class CleaningDutyUpdate(BaseModel):
    name1: str | None = None
    name2: str | None = None
    start_date: date | None = None
    end_date: date | None = None

cleaning_duties_router = APIRouter(prefix="/cleaning_duties", tags=["cleaning_duties"])


@cleaning_duties_router.get("")
async def list_cleaning_duties(db: AsyncSession = Depends(get_db)):
    return await list_all(db, CleaningDuty)

@cleaning_duties_router.post("")
async def create_cleaning_duty(payload: CleaningDutyCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await create_one(db, CleaningDuty, payload)

@cleaning_duties_router.patch("/{id}")
async def update_cleaning_duty(id: int, payload: CleaningDutyUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await update_one(db, CleaningDuty, id, payload)

@cleaning_duties_router.delete("/{id}")
async def delete_cleaning_duty(id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await delete_one(db, CleaningDuty, id)
    return {"deleted": True, "id": id}
