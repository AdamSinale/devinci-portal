
from __future__ import annotations
from typing import List, Optional
from sqlalchemy import Integer, String, Text 
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from backend.src.entities.user.user import User
from backend.src.entities.team.team_link import TeamLink
from backend.src.entities.forum.forum_idea import ForumIdea
from backend.src.entities.forum.forum_event import ForumEvent


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    users: Mapped[List[User]] = relationship(back_populates="team")
    links: Mapped[List[TeamLink]] = relationship(back_populates="team")
    forum_ideas: Mapped[List["ForumIdea"]] = relationship(back_populates="team")
    forum_events: Mapped[List["ForumEvent"]] = relationship(back_populates="team")
