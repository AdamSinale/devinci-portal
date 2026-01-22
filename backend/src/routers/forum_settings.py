from __future__ import annotations

from typing import List
from datetime import datetime

from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import require_admin
from src.entities.forum_settings import ForumSettings, ForumScheduleResult
from src.db import get_db

from src.services.unique_actions import (get_future_forum_schedule)
from src.services.common_actions import (list_all, update_one)

class ForumSettingsUpdate(BaseModel):
    first_forum_datetime: datetime | None = None
    forum_minute_length: int | None = None

forum_settings_router = APIRouter(prefix="/forum_settings", tags=["forum"])


@forum_settings_router.get("/futureForumSchedule", response_model=List[ForumScheduleResult])
async def future_forum_schedule(db: Session = Depends(get_db)):
    return await get_future_forum_schedule(db=db, weeks=54)

@forum_settings_router.get("")
async def get_forum_settings(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await list_all(db, ForumSettings)

@forum_settings_router.patch("/{id}")
async def update_forum_settings(id: int, payload: ForumSettingsUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await update_one(db, ForumSettings, id, payload)
