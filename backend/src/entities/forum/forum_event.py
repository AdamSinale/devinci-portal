from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from src.entities.base import Base

class ForumEvent(Base):
    __tablename__ = "forum_events"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    date_time = Column(DateTime(timezone=True), nullable=False)
    team_id = Column(Integer, ForeignKey("Teams.id"), nullable=False)
