from fastapi import APIRouter

from src.routers.forum import forum_router
from src.routers.admin import admin_router
from src.routers.auth import router as auth_router

main_router = APIRouter(prefix="/api")

main_router.include_router(forum_router)
main_router.include_router(admin_router)
main_router.include_router(auth_router)
