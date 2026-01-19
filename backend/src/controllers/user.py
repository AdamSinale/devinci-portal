# src/controllers/users.py
from __future__ import annotations

from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession

from src.entities.user import User
from src.entities.message import Message
from src.entities.user_event import UserEvent
from src.entities.user_role import UserRole
from src.entities.role import Role

from src.services.actions import (_list_all, _create_one, _update_one, _delete_one)

# Users
async def list_users_controller(db: AsyncSession):
    return await _list_all(db, User)

async def create_user_controller(db: AsyncSession, payload: Dict[str, Any]):
    return await _create_one(db, User, payload)

async def update_user_controller(db: AsyncSession, t_name: str, payload: Dict[str, Any]):
    return await _update_one(db, User, t_name, payload, pk_fields=["t_name"])

async def delete_user_controller(db: AsyncSession, t_name: str):
    await _delete_one(db, User, t_name)
    return {"deleted": True, "id": t_name}

# Messages
async def list_messages_controller(db: AsyncSession):
    return await _list_all(db, Message)

async def create_message_controller(db: AsyncSession, payload: Dict[str, Any]):
    return await _create_one(db, Message, payload)

async def update_message_controller(db: AsyncSession, id: int, payload: Dict[str, Any]):
    return await _update_one(db, Message, id, payload, pk_fields=["id"])

async def delete_message_controller(db: AsyncSession, id: int):
    await _delete_one(db, Message, id)
    return {"deleted": True, "id": id}

# UserEvents
async def list_user_events_controller(db: AsyncSession):
    return await _list_all(db, UserEvent)

async def create_user_event_controller(db: AsyncSession, payload: Dict[str, Any]):
    return await _create_one(db, UserEvent, payload)

async def update_user_event_controller(db: AsyncSession, id: int, payload: Dict[str, Any]):
    return await _update_one(db, UserEvent, id, payload, pk_fields=["id"])

async def delete_user_event_controller(db: AsyncSession, id: int):
    await _delete_one(db, UserEvent, id)
    return {"deleted": True, "id": id}

# Roles
async def list_roles_controller(db: AsyncSession):
    return await _list_all(db, Role)

async def create_role_controller(db: AsyncSession, payload: Dict[str, Any]):
    return await _create_one(db, Role, payload)

async def update_role_controller(db: AsyncSession, name: str, payload: Dict[str, Any]):
    return await _update_one(db, Role, name, payload, pk_fields=["name"])

async def delete_role_controller(db: AsyncSession, name: str):
    await _delete_one(db, Role, name)
    return {"deleted": True, "id": name}

# UserRoles
async def list_user_roles_controller(db: AsyncSession):
    return await _list_all(db, UserRole)

async def create_user_role_controller(db: AsyncSession, payload: Dict[str, Any]):
    return await _create_one(db, UserRole, payload)

def _user_role_pk(user_t_name: str, role_name: str) -> Dict[str, Any]:
    return {"user_t_name": user_t_name, "role_name": role_name}

async def update_user_role_controller(db: AsyncSession, user_t_name: str, role_name: str, payload: Dict[str, Any]):
    pk = _user_role_pk(user_t_name, role_name)
    return await _update_one(db, UserRole, pk, payload, pk_fields=["user_t_name", "role_name"])

async def delete_user_role_controller(db: AsyncSession, user_t_name: str, role_name: str):
    pk = _user_role_pk(user_t_name, role_name)
    await _delete_one(db, UserRole, pk)
    return {"deleted": True, "id": f"{user_t_name}/{role_name}"}
