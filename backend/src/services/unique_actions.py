
from __future__ import annotations

from typing import List
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.entities.team import Team
from src.entities.team import Team
from src.entities.forum_settings import ForumScheduleResult, ForumSettings
from src.entities.forum_idea import ForumIdea, ForumIdeaResult
from src.entities.forum_event import ForumEvent, ForumEventResult
from src.entities.team_link import TeamLink, TeamLinkResult
from zoneinfo import ZoneInfo

from datetime import datetime


async def get_teams_links(*, db: AsyncSession, team_name: str) -> List[TeamLinkResult]:
    stmt = select(TeamLink).where(TeamLink.team_name == team_name)
    res = await db.execute(stmt)
    return [TeamLinkResult(tl) for tl in res.scalars().all()]

async def get_team_forum_ideas(*, db: AsyncSession, team_name: str) -> List[ForumIdeaResult]:
    stmt = select(ForumIdea).where(ForumIdea.team_name == team_name).order_by(ForumIdea.id.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

async def get_future_forum_events(*, db: AsyncSession) -> List[ForumEventResult]:
    now = datetime.now(timezone.utc)
    stmt = select(ForumEvent).where(ForumEvent.date_time > now).order_by(ForumEvent.date_time.asc())
    res = await db.execute(stmt)
    return res.scalars().all()

LOCAL_TZ = ZoneInfo("Asia/Jerusalem")
def _week_key_sun_to_sat(dt: datetime) -> str:
    local = dt.astimezone(LOCAL_TZ)
    days_since_sunday = (local.weekday() + 1) % 7
    week_start = (local.date() - timedelta(days=days_since_sunday))
    return week_start.isoformat()

async def get_future_forum_schedule(*, db, weeks: int = 54) -> List[ForumScheduleResult]:
    settings = await db.scalar(select(ForumSettings).order_by(ForumSettings.id.desc()).limit(1))
    if not settings:
        return []

    base_dt = settings.first_forum_datetime
    minute_length = settings.forum_minute_length
    team_cycle = (await db.scalars(select(Team.name).order_by(Team.order.asc()))).all()
    if not team_cycle:
        return []

    overrides = await get_future_forum_events(db=db)

    override_by_week = {}
    for ev in overrides:
        k = _week_key_sun_to_sat(ev.date_time)
        if k not in override_by_week:
            override_by_week[k] = ev

    now_utc = datetime.now(timezone.utc)
    schedule = []
    for i in range(weeks):
        generated_dt = base_dt + timedelta(weeks=i)

        if generated_dt < now_utc:
            continue

        k = _week_key_sun_to_sat(generated_dt)
        ov = override_by_week.get(k)

        if ov:
            schedule.append(ForumScheduleResult(id=ov.id, name=ov.name, date_time=ov.date_time, team_name=ov.team_name, minute_length=minute_length, source="override"))
        else:
            team_name = team_cycle[i % len(team_cycle)]
            schedule.append(ForumScheduleResult(id=None, name="Forum", date_time=generated_dt, team_name=team_name, minute_length=minute_length, source="generated"))

    schedule.sort(key=lambda x: x.date_time)
    return schedule