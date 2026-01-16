from sqlalchemy import Column, Integer, ForeignKey, Text
from src.entities.base import Base


class ForumIdea(Base):
    __tablename__ = "forum_ideas"
    id = Column(Integer, primary_key=True)
    idea = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("Users.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("Teams.id"), nullable=False)
