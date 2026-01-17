from __future__ import annotations
from datetime import datetime
from fastapi import HTTPException
from pydantic import BaseModel, Field


class SystemError(HTTPException):
    def __init__(self, err_code: int = 500, err_detail: str = "Internal Server Error"):
        raise HTTPException(status_code=err_code, detail=err_detail)

class ForumIdeaOut(BaseModel):
    id: int
    idea: str
    user_id: int
    team_id: int

    class Config:
        from_attributes = True

class ForumEventOut(BaseModel):
    id: int
    name: str
    date_time: datetime
    team_id: int

    class Config:
        from_attributes = True

class ForumSettingsOut(BaseModel):
    first_forum_datetime: datetime
    participants_order: list[str] = Field(default_factory=list)


class AddForumEventIn(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    date_time: datetime
    team_id: int
