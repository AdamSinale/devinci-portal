
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import require_admin
from src.entities.team_link import TeamLink

from src.services.common_actions import (list_all, create_one, update_one, delete_one)
from src.services.unique_actions import get_teams_links

from src.db import get_db

class TeamLinkCreate(BaseModel):
    link: str
    name: str
    team_name: str

class TeamLinkUpdate(BaseModel):
    link: str | None = None
    name: str | None = None
    team_name: str | None = None

team_links_router = APIRouter(prefix="/team_links", tags=["team_links"])


@team_links_router.get("")
async def list_team_links(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await list_all(db, TeamLink)

@team_links_router.get("/{team_name}")
async def list_teams_link(team_name: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await get_teams_links(db, team_name)

@team_links_router.post("")
async def create_team_link(payload: TeamLinkCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await create_one(db, TeamLink, payload)

@team_links_router.patch("/{id}")
async def update_team_link(id: int, payload: TeamLinkUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await update_one(db, TeamLink, id, payload)

@team_links_router.delete("/{id}")
async def delete_team_link(id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await delete_one(db, TeamLink, id)
    return {"deleted": True, "id": id}