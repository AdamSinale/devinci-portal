# src/admin/schemas.py
from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


class AdminBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- USERS ----------
class UserCreate(AdminBase):
    name: str
    birthday: Optional[date] = None
    release_date: Optional[date] = None
    joined_date: Optional[date] = None
    team_id: Optional[int] = None

class UserUpdate(AdminBase):
    name: Optional[str] = None
    birthday: Optional[date] = None
    release_date: Optional[date] = None
    joined_date: Optional[date] = None
    team_id: Optional[int] = None

class UserOut(AdminBase):
    id: int
    name: str
    birthday: Optional[date]
    release_date: Optional[date]
    joined_date: Optional[date]
    team_id: Optional[int]


# ---------- TEAMS ----------
class TeamCreate(AdminBase):
    name: str
    description: Optional[str] = None

class TeamUpdate(AdminBase):
    name: Optional[str] = None
    description: Optional[str] = None

class TeamOut(AdminBase):
    id: int
    name: str
    description: Optional[str]


# ---------- ROLES ----------
class RoleCreate(AdminBase):
    name: str

class RoleUpdate(AdminBase):
    name: Optional[str] = None

class RoleOut(AdminBase):
    id: int
    name: str


# ---------- USER_ROLES (join table, composite pk) ----------
class UserRoleCreate(AdminBase):
    user_id: int
    role_id: int

class UserRoleOut(AdminBase):
    user_id: int
    role_id: int


# ---------- MESSAGES ----------
class MessageCreate(AdminBase):
    title: str
    message: str
    user_id: int
    date_time: datetime

class MessageUpdate(AdminBase):
    title: Optional[str] = None
    message: Optional[str] = None
    user_id: Optional[int] = None
    date_time: Optional[datetime] = None

class MessageOut(AdminBase):
    id: int
    title: str
    message: str
    user_id: int
    date_time: datetime


# ---------- USER_EVENTS ----------
class UserEventCreate(AdminBase):
    user_id: int
    event: str
    start_date_time: datetime
    end_date_time: datetime

class UserEventUpdate(AdminBase):
    user_id: Optional[int] = None
    event: Optional[str] = None
    start_date_time: Optional[datetime] = None
    end_date_time: Optional[datetime] = None

class UserEventOut(AdminBase):
    id: int
    user_id: int
    event: str
    start_date_time: datetime
    end_date_time: datetime


# ---------- TEAM_LINKS ----------
class TeamLinkCreate(AdminBase):
    link: str
    name: str
    team_id: int

class TeamLinkUpdate(AdminBase):
    link: Optional[str] = None
    name: Optional[str] = None
    team_id: Optional[int] = None

class TeamLinkOut(AdminBase):
    id: int
    link: str
    name: str
    team_id: int


# ---------- FORUM_IDEAS ----------
class ForumIdeaCreate(AdminBase):
    idea: str
    user_id: int
    team_id: int

class ForumIdeaUpdate(AdminBase):
    idea: Optional[str] = None
    user_id: Optional[int] = None
    team_id: Optional[int] = None

class ForumIdeaOut(AdminBase):
    id: int
    idea: str
    user_id: int
    team_id: int


# ---------- FORUM_EVENTS ----------
class ForumEventCreate(AdminBase):
    date_time: datetime
    name: str
    team_id: int

class ForumEventUpdate(AdminBase):
    date_time: Optional[datetime] = None
    name: Optional[str] = None
    team_id: Optional[int] = None

class ForumEventOut(AdminBase):
    id: int
    date_time: datetime
    name: str
    team_id: int


# ---------- FORUM_SETTINGS (singleton) ----------
class ForumSettingsUpsert(AdminBase):
    first_forum_datetime: datetime
    forum_minute_length: int = 60
    teams_order_ids: List[int] = Field(default_factory=list)

class ForumSettingsOut(AdminBase):
    id: int
    first_forum_datetime: datetime
    forum_minute_length: int
    teams_order_ids: List[int]
