
from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Integer, String 
from sqlalchemy.orm import Mapped, relationship, mapped_column  # mapped_column newer,better than Column (defines python type, defines DB column)

from src.entities.base import Base
if TYPE_CHECKING:
    from src.entities.user import User


class UserEvent(Base):
    __tablename__ = "user_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_t_name: Mapped[str] = mapped_column(ForeignKey("users.t_name", ondelete="CASCADE"), nullable=False)

    event: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship(back_populates="user_events")
