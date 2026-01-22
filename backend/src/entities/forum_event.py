
from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING
from pydantic import BaseModel
from sqlalchemy import DateTime, ForeignKey, Integer, String 
from sqlalchemy.orm import Mapped, relationship, mapped_column  # mapped_column newer,better than Column (defines python type, defines DB column)

from src.entities.base import Base
if TYPE_CHECKING:
    from src.entities.team import Team

class ForumEvent(Base):
    __tablename__ = "forum_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    date_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    team_name: Mapped[str] = mapped_column(ForeignKey("teams.name", ondelete="CASCADE"), nullable=False)
    team: Mapped["Team"] = relationship(back_populates="forum_events")



class ForumEventResult(BaseModel):
    def __init__(self, fe: ForumEvent):
        self.id = fe.id
        self.name = fe.name
        self.date_time = fe.date_time
        self.team_name = fe.team_name
