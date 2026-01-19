# src/controllers/team.py
from __future__ import annotations

from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession

from src.entities.team import Team
from src.entities.team_link import TeamLink

from src.services.actions import (_list_all, _create_one, _update_one, _delete_one)

# Teams
async def list_teams_controller(db: AsyncSession):
    return await _list_all(db, Team)

async def create_team_controller(db: AsyncSession, payload: Dict[str, Any]):
    return await _create_one(db, Team, payload)

async def update_team_controller(db: AsyncSession, name: str, payload: Dict[str, Any]):
    return await _update_one(db, Team, name, payload, pk_fields=["name"])

async def delete_team_controller(db: AsyncSession, name: str):
    await _delete_one(db, Team, name)
    return {"deleted": True, "id": name}

# TeamLinks
async def list_team_links_controller(db: AsyncSession):
    return await _list_all(db, TeamLink)

async def create_team_link_controller(db: AsyncSession, payload: Dict[str, Any]):
    return await _create_one(db, TeamLink, payload)

async def update_team_link_controller(db: AsyncSession, id: int, payload: Dict[str, Any]):
    return await _update_one(db, TeamLink, id, payload, pk_fields=["id"])

async def delete_team_link_controller(db: AsyncSession, id: int):
    await _delete_one(db, TeamLink, id)
    return {"deleted": True, "id": id}
