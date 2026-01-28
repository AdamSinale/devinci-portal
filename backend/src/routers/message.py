
from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.deps import require_admin
from src.db import get_db

from src.entities.message import Message
from src.services.common_actions import (list_all, create_one, update_one, delete_one)

class MessageCreate(BaseModel):
    title: str
    message: str
    user_t_name: str
    date_time: datetime

class MessageUpdate(BaseModel):
    title: str | None = None
    message: str | None = None
    user_t_name: str | None = None
    date_time: datetime | None = None

messages_router = APIRouter(prefix="/messages", tags=["messages"])


@messages_router.get("")
async def list_messages(db: AsyncSession = Depends(get_db)):
    return await list_all(db, Message)

@messages_router.post("")
async def create_message(payload: MessageCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await create_one(db, Message, payload)

@messages_router.patch("/{id}")
async def update_message(id: int, payload: MessageUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return await update_one(db, Message, id, payload)

@messages_router.delete("/{id}")
async def delete_message(id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await delete_one(db, Message, id)
    return {"deleted": True, "id": id}
