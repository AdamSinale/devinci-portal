
from __future__ import annotations
from sqlalchemy import ForeignKey, Integer, Text
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship, mapped_column  # mapped_column newer,better than Column (defines python type, defines DB column)

from src.entities.base import Base
if TYPE_CHECKING:
    from src.entities.team.team import Team
    from src.entities.user.user import User


class ForumIdea(Base):
    __tablename__ = "forum_ideas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    idea: Mapped[str] = mapped_column(Text, nullable=False)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)

    user: Mapped["User"] = relationship(back_populates="forum_ideas")
    team: Mapped["Team"] = relationship(back_populates="forum_ideas")
