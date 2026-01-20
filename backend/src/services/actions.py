# src/services/crud.py
from __future__ import annotations

from typing import Any, Dict, List, Type, TypeVar
from sqlalchemy import select, inspect
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from src.entities.system_error import SystemError

T = TypeVar("T")

class ListAllResult(BaseModel):
    items: List[Dict[str, Any]]
    columns: List[str]
    primary_keys: List[str]

async def list_all(db: AsyncSession, Model: Type[T]) -> ListAllResult:
    mapper = inspect(Model)
    columns = [c.key for c in mapper.columns]
    pk_cols = [c.key for c in mapper.primary_key]

    res = await db.execute(select(Model))
    objs = list(res.scalars().all())
    items = [ {col: getattr(obj, col) for col in columns} for obj in objs ]

    return ListAllResult(items=items, columns=columns, primary_keys=pk_cols)

async def create_one(db: AsyncSession, Model: Type[T], payload: BaseModel) -> T:
    obj = Model(**payload.model_dump())
    db.add(obj)
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise SystemError(400, f"Create failed: {str(e)}")

    try:
        await db.refresh(obj)
    except Exception:
        pass
    return obj


async def update_one(db: AsyncSession, Model: Type[T], pk: int|str|Dict[str, Any], payload: BaseModel) -> T: 
    obj = await db.get(Model, pk)
    if not obj:
        raise SystemError(404, "Row not found")

    # set attrs that exist
    for k, v in payload.model_dump().items():
        if hasattr(obj, k):
            setattr(obj, k, v)

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise SystemError(400, f"Update failed: {str(e)}")

    try:
        await db.refresh(obj)
    except Exception:
        pass

    return obj


async def delete_one(db: AsyncSession, Model: Type[T], pk: int|str|Dict[str, Any]) -> None:
    obj = await db.get(Model, pk)
    if not obj:
        raise SystemError(404, "Row not found")

    await db.delete(obj)
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise SystemError(400, f"Delete failed: {str(e)}")
