# src/services/crud.py
from __future__ import annotations

from typing import Any, Dict, List, Type, TypeVar
from sqlalchemy import select, inspect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
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
        await db.commit()      # upload session changes to DB
        await db.refresh(obj)  # update obj with DB changes
        return obj             # return the created DB object
    except IntegrityError as e:
        await db.rollback()    # deletes session changes
        status, msg = _translate_error(e)
        raise SystemError(status, msg)


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
        await db.refresh(obj)
        return obj
    except IntegrityError as e:
        await db.rollback()
        status, msg = _translate_error(e)
        raise SystemError(status, msg)


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

def _translate_error(e: IntegrityError):
    orig = getattr(e, "orig", None)
    inner = getattr(orig, "orig", None) or getattr(orig, "__cause__", None) or orig
    code = getattr(inner, "sqlstate", None) or getattr(inner, "pgcode", None) or getattr(orig, "sqlstate", None)

    if code == "23505":
        return 409, "Already exists (unique constraint)."
    if code == "23503":
        return 409, "Invalid reference (foreign key)."
    if code == "23502":
        return 422, "Missing required field (not null)."
    if code == "23514":
        return 422, "Invalid value (check constraint)."

    return 400, "Database constraint error."