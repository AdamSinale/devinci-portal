# src/routers/users.py
from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_db
from src.controllers.user import (
    list_users_controller, create_user_controller, update_user_controller, delete_user_controller,
    list_messages_controller, create_message_controller, update_message_controller, delete_message_controller,
    list_user_events_controller, create_user_event_controller, update_user_event_controller, delete_user_event_controller,
    list_roles_controller, create_role_controller, update_role_controller, delete_role_controller,
    list_user_roles_controller, create_user_role_controller, update_user_role_controller, delete_user_role_controller,
)

users_router = APIRouter(prefix="/users", tags=["users"])
messages_router = APIRouter(prefix="/messages", tags=["messages"])
user_events_router = APIRouter(prefix="/user-events", tags=["user_events"])
roles_router = APIRouter(prefix="/roles", tags=["roles"])
user_roles_router = APIRouter(prefix="/user-roles", tags=["user_roles"])

# Users
@users_router.get("")
async def list_users(db: AsyncSession = Depends(get_db)):
    return await list_users_controller(db)

@users_router.post("")
async def create_user(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await create_user_controller(db, payload)

@users_router.patch("/{t_name}")
async def update_user(t_name: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await update_user_controller(db, t_name, payload)

@users_router.delete("/{t_name}")
async def delete_user(t_name: str, db: AsyncSession = Depends(get_db)):
    return await delete_user_controller(db, t_name)

# Messages
@messages_router.get("")
async def list_messages(db: AsyncSession = Depends(get_db)):
    return await list_messages_controller(db)

@messages_router.post("")
async def create_message(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await create_message_controller(db, payload)

@messages_router.patch("/{id}")
async def update_message(id: int, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await update_message_controller(db, id, payload)

@messages_router.delete("/{id}")
async def delete_message(id: int, db: AsyncSession = Depends(get_db)):
    return await delete_message_controller(db, id)

# UserEvents
@user_events_router.get("")
async def list_user_events(db: AsyncSession = Depends(get_db)):
    return await list_user_events_controller(db)

@user_events_router.post("")
async def create_user_event(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await create_user_event_controller(db, payload)

@user_events_router.patch("/{id}")
async def update_user_event(id: int, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await update_user_event_controller(db, id, payload)

@user_events_router.delete("/{id}")
async def delete_user_event(id: int, db: AsyncSession = Depends(get_db)):
    return await delete_user_event_controller(db, id)

# Roles
@roles_router.get("")
async def list_roles(db: AsyncSession = Depends(get_db)):
    return await list_roles_controller(db)

@roles_router.post("")
async def create_role(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await create_role_controller(db, payload)

@roles_router.patch("/{name}")
async def update_role(name: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await update_role_controller(db, name, payload)

@roles_router.delete("/{name}")
async def delete_role(name: str, db: AsyncSession = Depends(get_db)):
    return await delete_role_controller(db, name)

# UserRoles (composite pk)
@user_roles_router.get("")
async def list_user_roles(db: AsyncSession = Depends(get_db)):
    return await list_user_roles_controller(db)

@user_roles_router.post("")
async def create_user_role(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await create_user_role_controller(db, payload)

@user_roles_router.patch("/{user_t_name}/{role_name}")
async def update_user_role(user_t_name: str, role_name: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    return await update_user_role_controller(db, user_t_name, role_name, payload)

@user_roles_router.delete("/{user_t_name}/{role_name}")
async def delete_user_role(user_t_name: str, role_name: str, db: AsyncSession = Depends(get_db)):
    return await delete_user_role_controller(db, user_t_name, role_name)
