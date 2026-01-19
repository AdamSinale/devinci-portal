from __future__ import annotations
from typing import List, Dict, Any

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.entities.forum_event import ForumEvent, ForumEventResult
from src.entities.forum_idea import ForumIdea, ForumIdeaResult
from src.entities.forum_settings import ForumSettings, ForumScheduleResult
from src.db import get_db

from src.services.forum import (get_team_forum_ideas, get_future_forum_events, get_future_forum_schedule)
from src.services.actions import (_list_all, _create_one, _update_one, _delete_one)


# ForumEvents
async def list_forum_events_controller(db: AsyncSession):
    return await _list_all(db, ForumEvent)

async def future_forum_events_controller(db: AsyncSession = Depends(get_db)) -> List[ForumEventResult]:
    return await get_future_forum_events(db=db)

async def create_forum_event_controller(db: AsyncSession, payload: Dict[str, Any]):
    return await _create_one(db, ForumEvent, payload)

async def update_forum_event_controller(db: AsyncSession, id: int, payload: Dict[str, Any]):
    return await _update_one(db, ForumEvent, id, payload, pk_fields=["id"])

async def delete_forum_event_controller(db: AsyncSession, id: int):
    await _delete_one(db, ForumEvent, id)
    return {"deleted": True, "id": id}

# ForumIdeas
async def list_forum_ideas_controller(db: AsyncSession):
    return await _list_all(db, ForumIdea)

async def team_forum_ideas_controller(team_name: str, db: AsyncSession = Depends(get_db)) -> List[ForumIdeaResult]:
    return await get_team_forum_ideas(db=db, team_name=team_name)

async def create_forum_idea_controller(db: AsyncSession, payload: Dict[str, Any]):
    return await _create_one(db, ForumIdea, payload)

async def update_forum_idea_controller(db: AsyncSession, id: int, payload: Dict[str, Any]):
    return await _update_one(db, ForumIdea, id, payload, pk_fields=["id"])

async def delete_forum_idea_controller(db: AsyncSession, id: int):
    await _delete_one(db, ForumIdea, id)
    return {"deleted": True, "id": id}

# ForumSettings (singleton)
async def future_forum_schedule_controller(db: AsyncSession = Depends(get_db)) -> List[ForumScheduleResult]:
    return await get_future_forum_schedule(db=db, weeks=54)

async def get_forum_settings_controller(db: AsyncSession):
    return await _list_all(db, ForumSettings)

async def patch_forum_settings_controller(db: AsyncSession, payload: Dict[str, Any]):
    return await _update_one(db, ForumSettings, id, payload, pk_fields=["id"])
