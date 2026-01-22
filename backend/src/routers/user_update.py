
from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import require_admin
from src.db import get_db

from src.entities.user_update import UserUpdate

from backend.src.services.common_actions import (list_all, create_one, update_one, delete_one)

class UserUpdateCreate(BaseModel):
    user_t_name: str
    update: str
    start_date_time: datetime
    end_date_time: datetime

class UserUpdateUpdate(BaseModel):
    update: str | None = None
    start_date_time: datetime | None = None
    end_date_time: datetime | None = None

user_updates_router = APIRouter(prefix="/user_updates", tags=["user_updates"])


@user_updates_router.get("")
async def list_user_updates(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await list_all(db, UserUpdate)

@user_updates_router.post("")
async def create_user_update(payload: UserUpdateCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await create_one(db, UserUpdate, payload)

@user_updates_router.patch("/{id}")
async def update_user_update(id: int, payload: UserUpdateUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await update_one(db, UserUpdate, id, payload)

@user_updates_router.delete("/{id}")
async def delete_user_update(id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await delete_one(db, UserUpdate, id)
    return {"deleted": True, "id": id}
