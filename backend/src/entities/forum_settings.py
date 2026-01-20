from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel
from sqlalchemy import DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column

from src.entities.base import Base

class ForumSettings(Base):
    __tablename__ = "forum_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    first_forum_datetime: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    forum_minute_length: Mapped[int] = mapped_column(Integer, nullable=False, default=60)


class ForumScheduleResult(BaseModel):
    id: Optional[int] = None       
    date_time: datetime
    team_name: str

    minute_length: int
    source: Literal["generated", "override"]

    class Config:
        from_attributes = True
