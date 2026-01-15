
from fastapi import FastAPI
from src.routers.forum import router as forum_router

app = FastAPI(title="DevInci Portal API")

app.include_router(forum_router)

