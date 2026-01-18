from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.base import get_db
from src.controllers.admin import (
    list_entities_controller,
    list_rows_controller,
    create_row_controller,
    update_row_controller,
    delete_row_controller,
)

admin_router = APIRouter(prefix="/admin", tags=["admin"])


@admin_router.get("/entities")
async def list_entities() -> Dict[str, Any]:
    return await list_entities_controller()


@admin_router.get("/{entity}/rows")
async def list_rows(
    entity: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    return await list_rows_controller(db=db, entity=entity, limit=limit, offset=offset)


@admin_router.post("/{entity}/rows")
async def create_row(
    entity: str,
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    return await create_row_controller(db=db, entity=entity, payload=payload)


@admin_router.patch("/{entity}/rows/{row_id}")
async def update_row(
    entity: str,
    row_id: str,
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    return await update_row_controller(db=db, entity=entity, row_id=row_id, payload=payload)


@admin_router.delete("/{entity}/rows/{row_id}")
async def delete_row(
    entity: str,
    row_id: str,
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    return await delete_row_controller(db=db, entity=entity, row_id=row_id)
