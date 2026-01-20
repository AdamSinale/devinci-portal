
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import require_admin
from src.db import get_db

from src.entities.user_event import UserEvent

from src.services.actions import (list_all, create_one, update_one, delete_one)

class UserEventCreate(BaseModel):
    user_t_name: str
    event: str
    start_date_time: datetime
    end_date_time: datetime

class UserEventUpdate(BaseModel):
    event: str | None = None
    start_date_time: datetime | None = None
    end_date_time: datetime | None = None

user_events_router = APIRouter(prefix="/user_events", tags=["user_events"])


@user_events_router.get("")
async def list_user_events(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await list_all(db, UserEvent)

@user_events_router.post("")
async def create_user_event(payload: UserEventCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await create_one(db, UserEvent, payload)

@user_events_router.patch("/{id}")
async def update_user_event(id: int, payload: UserEventUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await update_one(db, UserEvent, id, payload)

@user_events_router.delete("/{id}")
async def delete_user_event(id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await delete_one(db, UserEvent, id)
    return {"deleted": True, "id": id}
