from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from src.db import get_db
from src.routers.resultModels import ForumIdeaOut, ForumEventOut, ForumConstantsOut, AddForumEventIn
from src.controllers.forum import (
    team_forum_ideas_controller,
    future_forum_events_controller,
    forum_constants_controller,
    add_forum_event_controller,
)

router = APIRouter(prefix="/api/forum", tags=["forum"])


@router.get("/teamForumIdeas", response_model=List[ForumIdeaOut])
async def team_forum_ideas(team_id: int = Query(..., ge=1), db: Session = Depends(get_db)):
    return await team_forum_ideas_controller(db=db, team_id=team_id)


@router.get("/futureForumEvents", response_model=List[ForumEventOut])
async def future_forum_events(db: Session = Depends(get_db)):
    return await future_forum_events_controller(db=db)


@router.get("/forumConstants", response_model=ForumConstantsOut)
async def forum_constants(db: Session = Depends(get_db)):
    return await forum_constants_controller(db=db)


@router.post("/addForumEvent", response_model=ForumEventOut, status_code=201)
async def add_forum_event(payload: AddForumEventIn, db: Session = Depends(get_db)):
    return await add_forum_event_controller(db=db, payload=payload)
