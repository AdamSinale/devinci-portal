
from __future__ import annotations

from typing import Any, Dict, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import require_admin
from src.db import get_db

from src.entities.role import Role

from src.services.actions import (list_all, create_one, update_one, delete_one)

class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None

class RoleUpdate(BaseModel):
    description: Optional[str] = None

roles_router = APIRouter(prefix="/roles", tags=["roles"])


@roles_router.get("")
async def list_roles(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await list_all(db, Role)

@roles_router.post("")
async def create_role(payload: RoleCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await create_one(db, Role, payload)

@roles_router.patch("/{name}")
async def update_role(name: str, payload: RoleUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await update_one(db, Role, name, payload)

@roles_router.delete("/{name}")
async def delete_role(name: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await delete_one(db, Role, name)
    return {"deleted": True, "id": name}
