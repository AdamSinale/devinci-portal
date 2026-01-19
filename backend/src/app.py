# main.py
from datetime import date

from fastapi import FastAPI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from contextlib import asynccontextmanager
from src.routers.main import main_router

from src.entities.base import Base
from src.entities.user import User 
from src.auth.auth import hash_password
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@db:5432/postgres",
)
ADMIN_T_NANE = os.getenv("ADMIN_T_NANE")
ADMIN_NAME = os.getenv("ADMIN_NAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def init_db_and_seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        existing = await session.scalar(select(User).where(User.t_name == ADMIN_T_NANE))
        if existing:
            return

        session.add(User(t_name=ADMIN_T_NANE, name=ADMIN_NAME, password_hash=hash_password(ADMIN_PASSWORD)))
        await session.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_and_seed()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(main_router)