
from __future__ import annotations
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String 
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from backend.src.entities.user.user import User


class UserEvent(Base):
    __tablename__ = "user_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    event: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped[User] = relationship(back_populates="user_events")
