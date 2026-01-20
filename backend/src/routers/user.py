
from __future__ import annotations

from datetime import date
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import require_admin
from src.db import get_db

from src.auth.auth import hash_password
from src.entities.user import User

from src.services.actions import (list_all, create_one, update_one, delete_one)

class UserCreate(BaseModel):
    t_name: str
    password_hash: str
    name: str
    birthday: Optional[date] = None
    release_date: Optional[date] = None
    joined_date: Optional[date] = None
    team_name: Optional[str] = None

class UserUpdate(BaseModel):
    password_hash: Optional[str] = None
    name: Optional[str] = None
    birthday: Optional[date] = None
    release_date: Optional[date] = None
    joined_date: Optional[date] = None
    team_name: Optional[str] = None

    
users_router = APIRouter(prefix="/users", tags=["users"])


@users_router.get("")
async def list_users(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await list_all(db, User)

@users_router.post("")
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    payload.password_hash = hash_password(payload.password_hash)
    return await create_one(db, User, payload)

@users_router.patch("/{t_name}")
async def update_user(t_name: str, payload: UserUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    if payload.password_hash:
        payload.password_hash = hash_password(payload.password_hash)
    return await update_one(db, User, t_name, payload)

@users_router.delete("/{t_name}")
async def delete_user(t_name: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await delete_one(db, User, t_name)
    return {"deleted": True, "id": t_name}