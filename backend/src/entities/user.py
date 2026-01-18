
from __future__ import annotations
from datetime import date
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, relationship, mapped_column

from src.entities.base import Base

if TYPE_CHECKING:
    from src.entities.team import Team
    from src.entities.role import Role
    from src.entities.message import Message
    from src.entities.user_event import UserEvent
    from src.entities.user_role import UserRole
    from src.entities.forum_idea import ForumIdea

class User(Base):
    __tablename__ = "users"

    t_name: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(20), nullable=False)

    birthday: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    release_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    joined_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    team_name: Mapped[Optional[str]] = mapped_column(ForeignKey("teams.name", ondelete="SET NULL"), nullable=True)
    # user.team.name (SQLAlchemy does SELECT * FROM users JOIN teams ON users.team_name = teams.name;)
    team: Mapped[Optional["Team"]] = relationship(back_populates="users")
    # linking table: users <-- user_roles --> roles
    roles_link: Mapped[List["UserRole"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    # SELECT roles.* FROM roles JOIN user_roles ON user_roles.role_name = roles.name WHERE user_roles.user_t_name = ?
    roles: Mapped[List["Role"]] = relationship(secondary="user_roles", back_populates="users", viewonly=True)

    messages: Mapped[List["Message"]] = relationship(back_populates="user")
    user_events: Mapped[List["UserEvent"]] = relationship(back_populates="user")
    forum_ideas: Mapped[List["ForumIdea"]] = relationship(back_populates="user")
