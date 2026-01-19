# src/services/crud.py
from __future__ import annotations

from typing import Any, Dict, Generic, List, Optional, Sequence, Type, TypeVar, Union
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.entities.system_error import SystemError

T = TypeVar("T")

# -----------------------------
# Shared helpers
# -----------------------------
async def _list_all(db: AsyncSession, Model: Type[T]) -> List[T]:
    res = await db.execute(select(Model))
    return list(res.scalars().all())


async def _get_by_pk(db: AsyncSession, Model: Type[T], pk: Union[int, str, Dict[str, Any]]) -> Optional[T]:
    """
    pk can be:
      - int / str (single primary key)
      - dict for composite primary key (e.g. {"user_t_name": "...", "role_name": "..."})
    """
    return await db.get(Model, pk)  # type: ignore[arg-type]


async def _create_one(db: AsyncSession, Model: Type[T], payload: Dict[str, Any]) -> T:
    obj = Model(**payload)  # type: ignore[call-arg]
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


async def _update_one(
    db: AsyncSession,
    Model: Type[T],
    pk: Union[int, str, Dict[str, Any]],
    payload: Dict[str, Any],
    pk_fields: List[str],
) -> T:
    obj = await _get_by_pk(db, Model, pk)
    if not obj:
        raise SystemError(404, "Row not found")

    # don't allow changing PK fields
    for f in pk_fields:
        payload.pop(f, None)

    # set attrs that exist
    for k, v in payload.items():
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


async def _delete_one(
    db: AsyncSession,
    Model: Type[T],
    pk: Union[int, str, Dict[str, Any]],
) -> None:
    obj = await _get_by_pk(db, Model, pk)
    if not obj:
        raise SystemError(404, "Row not found")

    await db.delete(obj)
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise SystemError(400, f"Delete failed: {str(e)}")
