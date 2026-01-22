# main.py
from datetime import date

from fastapi import FastAPI
from sqlalchemy import select
from contextlib import asynccontextmanager
from src.routers.main import main_router

from src.entities.base import Base
from src.entities.user import User 
from src.entities.forum_settings import ForumSettings 
from src.db import AsyncSessionLocal, engine
from src.auth.auth import hash_password
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@db:5432/postgres",
)
ADMIN_T_NANE = os.getenv("ADMIN_T_NANE")
ADMIN_NAME = os.getenv("ADMIN_NAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")


async def init_db_and_seed() -> None:
    if not all([ADMIN_T_NANE, ADMIN_NAME, ADMIN_PASSWORD]):
        raise ValueError("Admin credentials are not fully set in environment variables.")
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        existing = await db.scalar(select(User).where(User.t_name == ADMIN_T_NANE))
        if not existing:
            db.add(User(t_name=ADMIN_T_NANE, name=ADMIN_NAME, password_hash=hash_password(ADMIN_PASSWORD)))

        existing = await db.scalar(select(ForumSettings))
        if not existing:
            db.add(ForumSettings(id=1, first_forum_datetime=date.today(), forum_minute_length=60))

            ##########  DELETE  #############
            ##########  DELETE  #############
            ##########  DELETE  #############
            from src.entities.team import Team
            from src.entities.message import Message
            from src.entities.user_update import UserUpdate
            from datetime import datetime
            db.add(Team(name="team1", description="Team 1 Description", order=1))
            db.add(Team(name="team2", description="Team 2 Description", order=2))
            db.add(Team(name="team3", description="Team 3 Description", order=3))
            db.add(Team(name="team4", description="Team 4 Description", order=4))
            db.add(User(t_name="t_idan", name="idan g", password_hash=hash_password("idan1234"), birthday=date(1990, 1, 1), release_date=date(2030, 1, 1), joined_date=date(2020, 1, 1)))
            db.add(User(t_name="t_haim", name="haim n", password_hash=hash_password("haim1234"), birthday=date(1990, 1, 1), release_date=date(2030, 2, 2), joined_date=date(2020, 2, 2), team_name="team1"))
            db.add(Message(title="hi1", message="hello1", user_t_name="t_haim", date_time=datetime(2024, 1, 1, 10, 0, 0)))
            db.add(Message(title="hi2", message="hello2", user_t_name="t_idan", date_time=datetime(2024, 1, 1, 11, 0, 0)))
            db.add(UserUpdate(user_t_name="t_adam_si", update="agnash", start_date_time=datetime(2026, 1, 15, 7, 0), end_date_time=datetime(2026, 1, 22, 17, 0)))
            db.add(UserUpdate(user_t_name="t_haim", update="gimelim", start_date_time=datetime(2026, 1, 11, 7, 0), end_date_time=datetime(2026, 1, 13, 17, 0)))
            ##########  DELETE  #############
            ##########  DELETE  #############
            ##########  DELETE  #############

        await db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_and_seed()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(main_router)