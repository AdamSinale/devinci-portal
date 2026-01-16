
from fastapi import FastAPI
from src.routers.forum import router as forum_router
from contextlib import asynccontextmanager
from src.db.init import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="DevInci Portal API", lifespan=lifespan)

app.include_router(forum_router)

