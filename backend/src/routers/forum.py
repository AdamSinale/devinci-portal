from __future__ import annotations

from typing import List, Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_db
from src.controllers.forum import (
    list_forum_events_controller, future_forum_events_controller, create_forum_event_controller, team_forum_ideas_controller, update_forum_event_controller, delete_forum_event_controller,
    list_forum_ideas_controller, team_forum_ideas_controller, create_forum_idea_controller, update_forum_idea_controller, delete_forum_idea_controller,
    future_forum_schedule_controller, get_forum_settings_controller, patch_forum_settings_controller,
)
from src.entities.forum_event import ForumEventResult
from src.entities.forum_idea import ForumIdeaResult
from src.entities.forum_settings import ForumScheduleResult

forum_events_router = APIRouter(prefix="/forum", tags=["forum"])
forum_ideas_router = APIRouter(prefix="/forum", tags=["forum"])
forum_settings_router = APIRouter(prefix="/forum", tags=["forum"])

# ForumEvents
@forum_events_router.get("")
async def list_forum_events(db: AsyncSession = Depends(get_db)):
    return await list_forum_events_controller(db)

@forum_events_router.get("/futureForumEvents", response_model=List[ForumEventResult])
async def future_forum_events(db: Session = Depends(get_db)):
    return await future_forum_events_controller(db=db)

@forum_events_router.post("")
async def create_forum_event(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await create_forum_event_controller(db, payload)

@forum_events_router.patch("/{id}")
async def update_forum_event(id: int, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await update_forum_event_controller(db, id, payload)

@forum_events_router.delete("/{id}")
async def delete_forum_event(id: int, db: AsyncSession = Depends(get_db)):
    return await delete_forum_event_controller(db, id)

# ForumIdeas
@forum_ideas_router.get("")
async def list_forum_ideas(db: AsyncSession = Depends(get_db)):
    return await list_forum_ideas_controller(db)

@forum_ideas_router.get("/teamForumIdeas", response_model=List[ForumIdeaResult])
async def team_forum_ideas(team_name: str, db: Session = Depends(get_db)):
    return await team_forum_ideas_controller(db=db, team_name=team_name)

@forum_ideas_router.post("")
async def create_forum_idea(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await create_forum_idea_controller(db, payload)

@forum_ideas_router.patch("/{id}")
async def update_forum_idea(id: int, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await update_forum_idea_controller(db, id, payload)

@forum_ideas_router.delete("/{id}")
async def delete_forum_idea(id: int, db: AsyncSession = Depends(get_db)):
    return await delete_forum_idea_controller(db, id)

# ForumSettings (singleton)
@forum_settings_router.get("/futureForumSchedule", response_model=List[ForumScheduleResult])
async def future_forum_schedule(db: Session = Depends(get_db)):
    return await future_forum_schedule_controller(db=db)

@forum_settings_router.get("")
async def get_forum_settings(db: AsyncSession = Depends(get_db)):
    return await get_forum_settings_controller(db)

@forum_settings_router.patch("")
async def patch_forum_settings(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await patch_forum_settings_controller(db, payload)