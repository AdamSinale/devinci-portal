
from __future__ import annotations
from datetime import date
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, relationship, mapped_column

from src.entities.base import Base

if TYPE_CHECKING:
    from src.entities.role import Role
    from src.entities.user_role import UserRole
    from src.entities.user import User



class Cleaning(Base):
    __tablename__ = "users"

    t_name: Mapped[str] = mapped_column(String(20), primary_key=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

