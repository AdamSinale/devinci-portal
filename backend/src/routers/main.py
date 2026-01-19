from fastapi import APIRouter

from src.auth.auth import router as auth_router
from src.routers.user import users_router, messages_router, user_events_router, roles_router, user_roles_router
from src.routers.team import teams_router, team_links_router
from src.routers.forum import forum_events_router, forum_ideas_router, forum_settings_router

main_router = APIRouter(prefix="/api")

main_router.include_router(forum_events_router)
main_router.include_router(forum_ideas_router)
main_router.include_router(forum_settings_router)
main_router.include_router(users_router)
main_router.include_router(messages_router)
main_router.include_router(user_events_router)
main_router.include_router(roles_router)
main_router.include_router(user_roles_router)
main_router.include_router(teams_router)
main_router.include_router(team_links_router)
main_router.include_router(auth_router)
