# backend/src/init_db.py
from src.db.base import engine
from src.entities.base import Base
from src import entities

async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("DB init done")

