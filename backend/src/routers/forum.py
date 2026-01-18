from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.db import get_db
from src.controllers.forum import (team_forum_ideas_controller, future_forum_events_controller, add_forum_event_controller, future_forum_schedule_controller)
from src.entities.forum_event import ForumEventResult
from src.entities.forum_idea import ForumIdeaResult
from src.entities.forum_settings import ForumScheduleResult
from src.services.forum import AddForumEventIn


forum_router = APIRouter(prefix="/forum", tags=["forum"])

@forum_router.get("/teamForumIdeas", response_model=List[ForumIdeaResult])
async def team_forum_ideas(team_name: str, db: Session = Depends(get_db)):
    return await team_forum_ideas_controller(db=db, team_name=team_name)

@forum_router.get("/futureForumEvents", response_model=List[ForumEventResult])
async def future_forum_events(db: Session = Depends(get_db)):
    return await future_forum_events_controller(db=db)

@forum_router.post("/addForumEvent", response_model=ForumEventResult, status_code=201)
async def add_forum_event(payload: AddForumEventIn, db: Session = Depends(get_db)):
    return await add_forum_event_controller(db=db, payload=payload)

@forum_router.get("/futureForumSchedule", response_model=List[ForumScheduleResult])
async def future_forum_schedule(db: Session = Depends(get_db)):
    return await future_forum_schedule_controller(db=db)
