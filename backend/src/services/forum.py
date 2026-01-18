
from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.entities.forum.forum_idea import ForumIdea
from src.entities.forum.forum_event import ForumEvent
from src.routers.forum_results import AddForumEventIn

async def get_team_forum_ideas(*, db: AsyncSession, team_id: int):
    stmt = select(ForumIdea).where(ForumIdea.team_id == team_id).order_by(ForumIdea.id.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

async def get_future_forum_events(*, db: AsyncSession):
    now = datetime.now(timezone.utc)
    stmt = select(ForumEvent).where(ForumEvent.date_time > now).order_by(ForumEvent.date_time.asc())
    res = await db.execute(stmt)
    return res.scalars().all()

async def create_forum_event(*, db: AsyncSession, payload: AddForumEventIn):
    event = ForumEvent(name=payload.name, date_time=payload.date_time, team_id=payload.team_id)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event
