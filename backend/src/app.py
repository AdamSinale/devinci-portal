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

        await db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_and_seed()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(main_router)