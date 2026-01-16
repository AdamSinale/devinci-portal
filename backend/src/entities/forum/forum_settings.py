from sqlalchemy import Column, Integer, String, DateTime
from src.entities.base import Base

class ForumSettings(Base):
    __tablename__ = "forum_settings"
    id = Column(Integer, primary_key=True)
    first_forum_datetime = Column(DateTime(timezone=True), nullable=False)
    participants_order_csv = Column(String(1024), nullable=False)
