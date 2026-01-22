
from __future__ import annotations
from typing import List, TYPE_CHECKING
from sqlalchemy import String 
from sqlalchemy.orm import Mapped, relationship, mapped_column  # mapped_column newer,better than Column (defines python type, defines DB column)

from src.entities.base import Base
if TYPE_CHECKING:
    from src.entities.user import User
    from src.entities.user_role import UserRole

class Role(Base):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), primary_key=True)
    
    description: Mapped[str] = mapped_column(String(255), nullable=True)

    users_link: Mapped[List["UserRole"]] = relationship(back_populates="role", cascade="all, delete-orphan")
    users: Mapped[List["User"]] = relationship(secondary="user_roles", back_populates="roles", viewonly=True)
