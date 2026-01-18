from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, Field


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

class AddForumEventIn(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    date_time: datetime
    team_id: int
