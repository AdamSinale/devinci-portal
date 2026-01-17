from fastapi import APIRouter

from src.routers.forum import forum_router

main_router = APIRouter(prefix="/api")

main_router.include_router(forum_router)
