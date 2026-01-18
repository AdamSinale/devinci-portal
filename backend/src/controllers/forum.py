from __future__ import annotations
from typing import List

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.entities.forum_event import ForumEventResult
from src.entities.forum_idea import ForumIdeaResult
from src.entities.forum_settings import ForumScheduleResult
from src.db import get_db
from src.services.forum import (get_team_forum_ideas, get_future_forum_events, create_forum_event, get_future_forum_schedule, AddForumEventIn)


async def team_forum_ideas_controller(team_name: str, db: AsyncSession = Depends(get_db)) -> List[ForumIdeaResult]:
    return await get_team_forum_ideas(db=db, team_name=team_name)

async def future_forum_events_controller(db: AsyncSession = Depends(get_db)) -> List[ForumEventResult]:
    return await get_future_forum_events(db=db)

async def add_forum_event_controller(payload: AddForumEventIn, db: AsyncSession = Depends(get_db)) -> ForumEventResult:
    return await create_forum_event(db=db, payload=payload)

async def future_forum_schedule_controller(db: AsyncSession = Depends(get_db)) -> List[ForumScheduleResult]:
    return await get_future_forum_schedule(db=db, weeks=54)