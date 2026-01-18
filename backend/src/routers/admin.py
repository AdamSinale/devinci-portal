from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import date, datetime

from pydantic import BaseModel, Field, ConfigDict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_db
from src.controllers.admin import (list_entities_controller, list_rows_controller, create_row_controller, update_row_controller, delete_row_controller)

admin_router = APIRouter(prefix="/admin", tags=["admin"])


@admin_router.get("/entities")
async def list_entities() -> Dict[str, Any]:
    return await list_entities_controller()


@admin_router.get("/{entity}/rows")
async def list_rows(entity: str, limit: int = Query(50,ge=1,le=200), offset: int = Query(0,ge=0), db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    return await list_rows_controller(db=db, entity=entity, limit=limit, offset=offset)

@admin_router.post("/{entity}/rows")
async def create_row(entity: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    return await create_row_controller(db=db, entity=entity, payload=payload)

@admin_router.patch("/{entity}/rows/{row_id}")
async def update_row(entity: str, row_id: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    return await update_row_controller(db=db, entity=entity, row_id=row_id, payload=payload)

@admin_router.delete("/{entity}/rows/{row_id}")
async def delete_row(entity: str, row_id: str, db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    return await delete_row_controller(db=db, entity=entity, row_id=row_id)

class AdminBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# ---------- USERS ----------
class UserCreate(AdminBase):
    name: str
    birthday: Optional[date] = None
    release_date: Optional[date] = None
    joined_date: Optional[date] = None
    team_name: Optional[str] = None

class UserUpdate(AdminBase):
    name: Optional[str] = None
    birthday: Optional[date] = None
    release_date: Optional[date] = None
    joined_date: Optional[date] = None
    team_name: Optional[str] = None

class UserOut(AdminBase):
    id: int
    name: str
    birthday: Optional[date]
    release_date: Optional[date]
    joined_date: Optional[date]
    team_name: Optional[str]


# ---------- TEAMS ----------
class TeamCreate(AdminBase):
    name: str
    description: Optional[str] = None

class TeamUpdate(AdminBase):
    name: Optional[str] = None
    description: Optional[str] = None

class TeamOut(AdminBase):
    name: str
    description: Optional[str]


# ---------- ROLES ----------
class RoleCreate(AdminBase):
    name: str

class RoleUpdate(AdminBase):
    name: Optional[str] = None

class RoleOut(AdminBase):
    name: str


# ---------- USER_ROLES (join table, composite pk) ----------
class UserRoleCreate(AdminBase):
    user_t_name: str
    role_name: str

class UserRoleOut(AdminBase):
    user_t_name: str
    role_name: str

# ---------- MESSAGES ----------
class MessageCreate(AdminBase):
    title: str
    message: str
    user_t_name: str
    date_time: datetime

class MessageUpdate(AdminBase):
    title: Optional[str] = None
    message: Optional[str] = None
    user_t_name: Optional[str] = None
    date_time: Optional[datetime] = None

class MessageOut(AdminBase):
    id: int
    title: str
    message: str
    user_t_name: str
    date_time: datetime


# ---------- USER_EVENTS ----------
class UserEventCreate(AdminBase):
    user_t_name: str
    event: str
    start_date_time: datetime
    end_date_time: datetime

class UserEventUpdate(AdminBase):
    user_t_name: Optional[str] = None
    event: Optional[str] = None
    start_date_time: Optional[datetime] = None
    end_date_time: Optional[datetime] = None

class UserEventOut(AdminBase):
    id: int
    user_t_name: str
    event: str
    start_date_time: datetime
    end_date_time: datetime


# ---------- TEAM_LINKS ----------
class TeamLinkCreate(AdminBase):
    link: str
    name: str
    team_name: str

class TeamLinkUpdate(AdminBase):
    link: Optional[str] = None
    name: Optional[str] = None
    team_name: Optional[str] = None

class TeamLinkOut(AdminBase):
    id: int
    link: str
    name: str
    team_name: str


# ---------- FORUM_IDEAS ----------
class ForumIdeaCreate(AdminBase):
    idea: str
    user_t_name: str
    team_name: str

class ForumIdeaUpdate(AdminBase):
    idea: Optional[str] = None
    user_t_name: Optional[str] = None
    team_name: Optional[str] = None

class ForumIdeaOut(AdminBase):
    id: int
    idea: str
    user_t_name: str
    team_name: str


# ---------- FORUM_EVENTS ----------
class ForumEventCreate(AdminBase):
    date_time: datetime
    name: str
    team_name: str

class ForumEventUpdate(AdminBase):
    date_time: Optional[datetime] = None
    name: Optional[str] = None
    team_name: Optional[str] = None

class ForumEventOut(AdminBase):
    id: int
    date_time: datetime
    name: str
    team_name: str


# ---------- FORUM_SETTINGS (singleton) ----------
class ForumSettingsUpsert(AdminBase):
    first_forum_datetime: datetime
    forum_minute_length: int = 60
    teams_order: List[str] = Field(default_factory=list)

class ForumSettingsOut(AdminBase):
    id: int
    first_forum_datetime: datetime
    forum_minute_length: int
    teams_order: List[str]
