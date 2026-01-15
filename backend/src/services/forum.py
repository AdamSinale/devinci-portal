# backend/src/services/forum_service.py
from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from src.entities.forum import ForumIdea, ForumEvent, ForumConstant
from src.routers.resultModels import AddForumEventIn, ForumConstantsOut  # לפי המבנה שלך

async def get_team_forum_ideas(*, db: AsyncSession, team_id: int):
    stmt = select(ForumIdea).where(ForumIdea.team_id == team_id).order_by(ForumIdea.id.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

async def get_future_forum_events(*, db: AsyncSession):
    now = datetime.now(timezone.utc)
    stmt = select(ForumEvent).where(ForumEvent.date_time > now).order_by(ForumEvent.date_time.asc())
    res = await db.execute(stmt)
    return res.scalars().all()

async def get_forum_constants(*, db: AsyncSession) -> ForumConstantsOut:
    stmt = select(ForumConstant).order_by(ForumConstant.id.desc()).limit(1)
    res = await db.execute(stmt)
    const = res.scalars().first()
    if not const:
        raise HTTPException(status_code=404, detail="Forum constants not found")

    participants = [x.strip() for x in const.participants_order_csv.split(",") if x.strip()]
    return ForumConstantsOut(
        first_forum_datetime=const.first_forum_datetime,
        participants_order=participants,
    )

async def create_forum_event(*, db: AsyncSession, payload: AddForumEventIn):
    event = ForumEvent(name=payload.name, date_time=payload.date_time, team_id=payload.team_id)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event
