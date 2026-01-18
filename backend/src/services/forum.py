
from __future__ import annotations

from typing import List
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.entities.forum_settings import ForumScheduleResult, ForumSettings
from src.entities.forum_idea import ForumIdea, ForumIdeaResult
from src.entities.forum_event import ForumEvent, ForumEventResult
from zoneinfo import ZoneInfo

from datetime import datetime
from pydantic import BaseModel, Field

class AddForumEventIn(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    date_time: datetime
    team_name: str


async def get_team_forum_ideas(*, db: AsyncSession, team_name: str) -> List[ForumIdeaResult]:
    stmt = select(ForumIdea).where(ForumIdea.team_name == team_name).order_by(ForumIdea.id.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

async def get_future_forum_events(*, db: AsyncSession) -> List[ForumEventResult]:
    now = datetime.now(timezone.utc)
    stmt = select(ForumEvent).where(ForumEvent.date_time > now).order_by(ForumEvent.date_time.asc())
    res = await db.execute(stmt)
    return res.scalars().all()

async def create_forum_event(*, db: AsyncSession, payload: AddForumEventIn) -> ForumEventResult:
    event = ForumEvent(name=payload.name, date_time=payload.date_time, team_name=payload.team_name)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


LOCAL_TZ = ZoneInfo("Asia/Jerusalem")
def _week_key_sun_to_sat(dt: datetime) -> str:
    local = dt.astimezone(LOCAL_TZ)
    days_since_sunday = (local.weekday() + 1) % 7
    week_start = (local.date() - timedelta(days=days_since_sunday))
    return week_start.isoformat()

async def get_future_forum_schedule(*, db, weeks: int = 54) -> List[ForumScheduleResult]:
    now_utc = datetime.now(timezone.utc)
    end_utc = now_utc + timedelta(weeks=weeks)

    settings_stmt = select(ForumSettings).order_by(ForumSettings.id.desc()).limit(1)
    settings_res = await db.execute(settings_stmt)
    settings = settings_res.scalars().first()
    if not settings:
        return []

    base_dt = settings.first_forum_datetime
    team_cycle = settings.teams_order or []
    if len(team_cycle) == 0:
        return []

    minute_length = settings.forum_minute_length

    overrides_stmt = (
        select(ForumEvent)
        .where(ForumEvent.date_time >= now_utc, ForumEvent.date_time <= end_utc)
        .order_by(ForumEvent.date_time.asc())
    )
    overrides_res = await db.execute(overrides_stmt)
    overrides = overrides_res.scalars().all()

    override_by_week = {}
    for ev in overrides:
        k = _week_key_sun_to_sat(ev.date_time)
        if k not in override_by_week:
            override_by_week[k] = ev

    schedule = []
    for i in range(weeks):
        generated_dt = base_dt + timedelta(weeks=i)

        if generated_dt < now_utc:
            continue

        k = _week_key_sun_to_sat(generated_dt)
        ov = override_by_week.get(k)

        if ov:
            schedule.append({
                "id": ov.id,
                "name": ov.name,
                "date_time": ov.date_time,
                "team_name": ov.team_name,
                "minute_length": minute_length,
                "source": "override",
            })
        else:
            team_name = team_cycle[i % len(team_cycle)]
            schedule.append({
                "id": None,
                "name": "Forum",
                "date_time": generated_dt,
                "team_name": team_name,
                "minute_length": minute_length,
                "source": "generated",
            })
    schedule.sort(key=lambda x: x["date_time"])
    return schedule