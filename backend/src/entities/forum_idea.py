
from __future__ import annotations
from pydantic import BaseModel
from pydantic import BaseModel
from sqlalchemy import ForeignKey, Integer, Text
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship, mapped_column  # mapped_column newer,better than Column (defines python type, defines DB column)

from src.entities.base import Base
if TYPE_CHECKING:
    from src.entities.team import Team
    from src.entities.user import User


class ForumIdea(Base):
    __tablename__ = "forum_ideas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    idea: Mapped[str] = mapped_column(Text, nullable=False)

    user_t_name: Mapped[str] = mapped_column(ForeignKey("users.t_name", ondelete="CASCADE"), nullable=False)
    team_name: Mapped[str] = mapped_column(ForeignKey("teams.name", ondelete="CASCADE"), nullable=False)

    user: Mapped["User"] = relationship(back_populates="forum_ideas")
    team: Mapped["Team"] = relationship(back_populates="forum_ideas")


class ForumIdeaResult(BaseModel):
    def __init__(self, fi: ForumIdea):
        self.id = fi.id
        self.idea = fi.idea
        self.user_t_name = fi.user_t_name
        self.team_name = fi.team_name
