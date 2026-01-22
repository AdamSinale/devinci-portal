
from __future__ import annotations

from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import require_admin
from src.db import get_db

from src.entities.user_role import UserRole

from backend.src.services.common_actions import (list_all, create_one, update_one, delete_one)

class UserRoleCreate(BaseModel):
    user_t_name: str
    role_name: str
    start_date: Optional[date] = None

class UserRoleUpdate(BaseModel):
    start_date: Optional[date] = None

user_roles_router = APIRouter(prefix="/user_roles", tags=["user_roles"])


@user_roles_router.get("")
async def list_user_roles(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await list_all(db, UserRole)

@user_roles_router.post("")
async def create_user_role(payload: UserRoleCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await create_one(db, UserRole, payload)

@user_roles_router.patch("/{user_t_name}/{role_name}")
async def update_user_role(user_t_name: str, role_name: str, payload: UserRoleUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    pk = {"user_t_name": user_t_name, "role_name": role_name}
    return await update_one(db, UserRole, pk, payload)

@user_roles_router.delete("/{user_t_name}/{role_name}")
async def delete_user_role(user_t_name: str, role_name: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    pk = {"user_t_name": user_t_name, "role_name": role_name}
    await delete_one(db, UserRole, pk)
    return {"deleted": True, "id": f"{user_t_name}/{role_name}"}

