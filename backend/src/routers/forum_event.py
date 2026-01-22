from __future__ import annotations

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import require_admin
from src.entities.forum_event import ForumEvent, ForumEventResult
from src.db import get_db

from src.services.unique_actions import (get_future_forum_events)
from src.services.common_actions import (list_all, create_one, update_one, delete_one)

class ForumEventCreate(BaseModel):
    date_time: datetime
    name: str
    team_name: str

class ForumEventUpdate(BaseModel):
    date_time: datetime | None = None
    name: str | None = None
    team_name: str | None = None

forum_events_router = APIRouter(prefix="/forum_events", tags=["forum"])


@forum_events_router.get("")
async def list_forum_events(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await list_all(db, ForumEvent)

@forum_events_router.get("/futureForumEvents", response_model=List[ForumEventResult])
async def future_forum_events(db: Session = Depends(get_db)):
    return await get_future_forum_events(db=db)

@forum_events_router.post("")
async def create_forum_event(payload: ForumEventCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await create_one(db, ForumEvent, payload)

@forum_events_router.patch("/{id}")
async def update_forum_event(id: int, payload: ForumEventUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await update_one(db, ForumEvent, id, payload)

@forum_events_router.delete("/{id}")
async def delete_forum_event(id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await delete_one(db, ForumEvent, id)
    return {"deleted": True, "id": id}

