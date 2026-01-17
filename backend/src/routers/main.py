from fastapi import APIRouter

from src.routers.forum import forum_router
from src.routers.admin import admin_router

main_router = APIRouter(prefix="/api")

main_router.include_router(forum_router)
main_router.include_router(admin_router)
