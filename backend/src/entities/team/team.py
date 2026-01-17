
from __future__ import annotations
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Integer, String, Text 
from sqlalchemy.orm import Mapped, relationship, mapped_column  # mapped_column newer,better than Column (defines python type, defines DB column)

from src.entities.base import Base
if TYPE_CHECKING:
    from src.entities.user.user import User
    from src.entities.team.team_link import TeamLink
    from src.entities.forum.forum_idea import ForumIdea
    from src.entities.forum.forum_event import ForumEvent


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    users: Mapped[List["User"]] = relationship(back_populates="team")
    links: Mapped[List["TeamLink"]] = relationship(back_populates="team")
    forum_ideas: Mapped[List["ForumIdea"]] = relationship(back_populates="team")
    forum_events: Mapped[List["ForumEvent"]] = relationship(back_populates="team")
