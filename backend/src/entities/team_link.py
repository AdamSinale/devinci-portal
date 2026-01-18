
from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Integer, String 
from sqlalchemy.orm import Mapped, relationship, mapped_column  # mapped_column newer,better than Column (defines python type, defines DB column)

from src.entities.base import Base
if TYPE_CHECKING:
    from src.entities.team import Team


class TeamLink(Base):
    __tablename__ = "team_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    link: Mapped[str] = mapped_column(String(500), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)

    team_name: Mapped[str] = mapped_column(ForeignKey("teams.name", ondelete="CASCADE"), nullable=False)
    team: Mapped["Team"] = relationship(back_populates="links")