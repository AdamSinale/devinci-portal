# src/routers/team.py
from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_db
from src.controllers.team import (
    list_teams_controller, create_team_controller, update_team_controller, delete_team_controller,
    list_team_links_controller, create_team_link_controller, update_team_link_controller, delete_team_link_controller,
)

teams_router = APIRouter(prefix="/teams", tags=["teams"])
team_links_router = APIRouter(prefix="/team-links", tags=["team_links"])

# Teams
@teams_router.get("")
async def list_teams(db: AsyncSession = Depends(get_db)):
    return await list_teams_controller(db)

@teams_router.post("")
async def create_team(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await create_team_controller(db, payload)

@teams_router.patch("/{name}")
async def update_team(name: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await update_team_controller(db, name, payload)

@teams_router.delete("/{name}")
async def delete_team(name: str, db: AsyncSession = Depends(get_db)):
    return await delete_team_controller(db, name)

# TeamLinks
@team_links_router.get("")
async def list_team_links(db: AsyncSession = Depends(get_db)):
    return await list_team_links_controller(db)

@team_links_router.post("")
async def create_team_link(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await create_team_link_controller(db, payload)

@team_links_router.patch("/{id}")
async def update_team_link(id: int, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await update_team_link_controller(db, id, payload)

@team_links_router.delete("/{id}")
async def delete_team_link(id: int, db: AsyncSession = Depends(get_db)):
    return await delete_team_link_controller(db, id)
