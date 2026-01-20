
from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import require_admin
from src.entities.team import Team

from src.services.actions import (list_all, create_one, update_one, delete_one)

from src.db import get_db

class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None
    order: int

class TeamUpdate(BaseModel):
    description: Optional[str] = None
    order: Optional[int] = None
    
teams_router = APIRouter(prefix="/teams", tags=["teams"])


@teams_router.get("")
async def list_teams(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await list_all(db, Team)

@teams_router.post("")
async def create_team(payload: TeamCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await create_one(db, Team, payload)

@teams_router.patch("/{name}")
async def update_team(name: str, payload: TeamUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await update_one(db, Team, name, payload)

@teams_router.delete("/{name}")
async def delete_team(name: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await delete_one(db, Team, name)
    return {"deleted": True, "id": name}
