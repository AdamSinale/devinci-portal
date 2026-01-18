
from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text 
from sqlalchemy.orm import Mapped, relationship, mapped_column  # mapped_column newer,better than Column (defines python type, defines DB column)

from src.entities.base import Base
if TYPE_CHECKING:
    from src.entities.user import User

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    user_t_name: Mapped[str] = mapped_column(ForeignKey("users.t_name", ondelete="CASCADE"), nullable=False)
    date_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship(back_populates="messages")