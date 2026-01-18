# main.py
from datetime import date

from fastapi import FastAPI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from contextlib import asynccontextmanager
from src.routers.main import main_router

from src.entities.base import Base
from src.entities.user.user import User 
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@db:5432/postgres",  # חשוב: db ולא localhost
)
engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def init_db_and_seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        unique_username = "adam sin"

        existing = await session.scalar(select(User).where(User.name == unique_username))
        if existing:
            return

        session.add(User(id = 1, name="adam sin", birthday=date(2004,2,2), release_date=date(2031,10,18), joined_date=date(2025,10,14)))
        await session.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_and_seed()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(main_router)