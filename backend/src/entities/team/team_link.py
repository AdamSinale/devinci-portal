
from __future__ import annotations
from sqlalchemy import ForeignKey, Integer, String 
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from src.entities.team.team import Team


class TeamLink(Base):
    __tablename__ = "team_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    link: Mapped[str] = mapped_column(String(500), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)

    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    team: Mapped[Team] = relationship(back_populates="links")
