
from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING, Optional
from sqlalchemy import ForeignKey, UniqueConstraint 
from sqlalchemy.orm import Mapped, relationship, mapped_column  # mapped_column newer,better than Column (defines python type, defines DB column)

from src.entities.base import Base
if TYPE_CHECKING:
    from src.entities.user import User
    from src.entities.role import Role

class UserRole(Base):
    __tablename__ = "user_roles"
    __table_args__ = (
        UniqueConstraint("user_t_name", "role_name", name="uq_user_roles_user_role"),
    )

    user_t_name: Mapped[str] = mapped_column(ForeignKey("users.t_name", ondelete="CASCADE"), primary_key=True)
    role_name: Mapped[str] = mapped_column(ForeignKey("roles.name", ondelete="CASCADE"), primary_key=True)

    start_date: Mapped[Optional[date]] = mapped_column(nullable=False)

    user: Mapped["User"] = relationship(back_populates="roles_link")
    role: Mapped["Role"] = relationship(back_populates="users_link")
