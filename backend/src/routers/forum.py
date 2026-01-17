from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from src.db.base import get_db
from src.routers.resultModels import ForumIdeaOut, ForumEventOut, ForumSettingsOut, AddForumEventIn
from src.controllers.forum import (team_forum_ideas_controller, future_forum_events_controller, forum_constants_controller, add_forum_event_controller)

forum_router = APIRouter(prefix="/forum", tags=["forum"])


@forum_router.get("/teamForumIdeas", response_model=List[ForumIdeaOut])
async def team_forum_ideas(team_id: int = Query(..., ge=1), db: Session = Depends(get_db)):
    return await team_forum_ideas_controller(db=db, team_id=team_id)

@forum_router.get("/futureForumEvents", response_model=List[ForumEventOut])
async def future_forum_events(db: Session = Depends(get_db)):
    return await future_forum_events_controller(db=db)

@forum_router.get("/ForumSettings", response_model=ForumSettingsOut)
async def forum_constants(db: Session = Depends(get_db)):
    return await forum_constants_controller(db=db)

@forum_router.post("/addForumEvent", response_model=ForumEventOut, status_code=201)
async def add_forum_event(payload: AddForumEventIn, db: Session = Depends(get_db)):
    return await add_forum_event_controller(db=db, payload=payload)
