from datetime import datetime
from typing import List

from sqlalchemy import DateTime, Integer
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from src.entities.base import Base

class ForumSettings(Base):
    __tablename__ = "forum_settings"

    id: Mapped[int] = mapped_column(primary_key=True)

    first_forum_datetime: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    forum_minute_length: Mapped[int] = mapped_column(Integer, nullable=False, default=60)

    teams_order_ids: Mapped[List[int]] = mapped_column(
        ARRAY(Integer),
        nullable=False,
        default=list,
    )