
from __future__ import annotations
from datetime import date
from typing import List, Optional
from sqlalchemy import Date, ForeignKey, Integer, String 
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from src.entities.team.team import Team
from src.entities.user.user_role import UserRole
from src.entities.user.role import Role
from src.entities.user.message import Message
from src.entities.user.user_event import UserEvent
from src.entities.forum.forum_idea import ForumIdea

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)

    birthday: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    release_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    joined_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    team_id: Mapped[Optional[int]] = mapped_column(ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    # user.team.name (SQLAlchemy does SELECT * FROM users JOIN teams ON users.team_id = teams.id;)
    team: Mapped[Optional[Team]] = relationship(back_populates="users")

    roles_link: Mapped[List[UserRole]] = relationship(back_populates="user", cascade="all, delete-orphan")
    roles: Mapped[List[Role]] = relationship(secondary="user_roles", back_populates="users", viewonly=True)

    messages: Mapped[List[Message]] = relationship(back_populates="user")
    user_events: Mapped[List[UserEvent]] = relationship(back_populates="user")
    forum_ideas: Mapped[List[ForumIdea]] = relationship(back_populates="user")
