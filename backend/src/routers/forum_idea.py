from __future__ import annotations

from typing import List

from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import require_admin
from src.entities.forum_idea import ForumIdea, ForumIdeaResult
from src.db import get_db

from src.services.unique_actions import (get_team_forum_ideas)
from src.services.common_actions import (list_all, create_one, update_one, delete_one)

class ForumIdeaCreate(BaseModel):
    idea: str
    user_t_name: str
    team_name: str

class ForumIdeaUpdate(BaseModel):
    idea: str | None = None
    user_t_name: str | None = None
    team_name: str | None = None


forum_ideas_router = APIRouter(prefix="/forum_ideas", tags=["forum"])


@forum_ideas_router.get("")
async def list_forum_ideas(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await list_all(db, ForumIdea)

@forum_ideas_router.get("/teamForumIdeas", response_model=List[ForumIdeaResult])
async def team_forum_ideas(team_name: str, db: Session = Depends(get_db)):
    return await get_team_forum_ideas(db=db, team_name=team_name)

@forum_ideas_router.post("")
async def create_forum_idea(payload: ForumIdeaCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await create_one(db, ForumIdea, payload)

@forum_ideas_router.patch("/{id}")
async def update_forum_idea(id: int, payload: ForumIdeaUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await update_one(db, ForumIdea, id, payload)

@forum_ideas_router.delete("/{id}")
async def delete_forum_idea(id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await delete_one(db, ForumIdea, id)
    return {"deleted": True, "id": id}
