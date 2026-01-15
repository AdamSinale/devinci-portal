# backend/src/entities/forum.py
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text

class Base(DeclarativeBase):
    pass

class ForumIdea(Base):
    __tablename__ = "ForumIdeas"
    id = Column(Integer, primary_key=True)
    idea = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("Users.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("Teams.id"), nullable=False)

class ForumEvent(Base):
    __tablename__ = "ForumEvents"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    date_time = Column(DateTime(timezone=True), nullable=False)
    team_id = Column(Integer, ForeignKey("Teams.id"), nullable=False)

class ForumConstant(Base):
    __tablename__ = "ForumConstants"
    id = Column(Integer, primary_key=True)
    first_forum_datetime = Column(DateTime(timezone=True), nullable=False)
    participants_order_csv = Column(String(1024), nullable=False)
