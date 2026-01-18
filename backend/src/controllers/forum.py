from __future__ import annotations

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.base import get_db
from src.routers.forum_results import AddForumEventIn
from src.services.forum import (
    get_team_forum_ideas,
    get_future_forum_events,
    create_forum_event,
)

async def team_forum_ideas_controller(team_id: int = Query(..., ge=1), db: AsyncSession = Depends(get_db)):
    return await get_team_forum_ideas(db=db, team_id=team_id)

async def future_forum_events_controller(db: AsyncSession = Depends(get_db)):
    return await get_future_forum_events(db=db)

async def add_forum_event_controller(payload: AddForumEventIn, db: AsyncSession = Depends(get_db)):
    return await create_forum_event(db=db, payload=payload)
