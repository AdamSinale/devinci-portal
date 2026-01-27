from __future__ import annotations

from datetime import date
from sqlalchemy import Date, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from src.entities.base import Base


class CleaningDuty(Base):
    __tablename__ = "cleaning_duties"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    name1: Mapped[str] = mapped_column(String(200))
    name2: Mapped[str] = mapped_column(String(200))

    start_date: Mapped[date] = mapped_column(Date, nullable=True)
    end_date: Mapped[date] = mapped_column(Date, nullable=True)
