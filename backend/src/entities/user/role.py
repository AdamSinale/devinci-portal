
from __future__ import annotations
from typing import List
from sqlalchemy import Integer, String 
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from src.entities.user.user import User
from src.entities.user.user_role import UserRole

class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    users_link: Mapped[List[UserRole]] = relationship(back_populates="role", cascade="all, delete-orphan")
    users: Mapped[List[User]] = relationship(secondary="user_roles", back_populates="roles", viewonly=True)
