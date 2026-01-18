from __future__ import annotations

from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from src.services.admin import (
    list_entities_service,
    list_rows_service,
    create_row_service,
    update_row_service,
    delete_row_service,
)

async def list_entities_controller() -> Dict[str, Any]:
    return await list_entities_service()

async def list_rows_controller(db: AsyncSession, entity: str, limit: int, offset: int) -> Dict[str, Any]:
    return await list_rows_service(db=db, entity=entity, limit=limit, offset=offset)

async def create_row_controller(db: AsyncSession, entity: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    return await create_row_service(db=db, entity=entity, payload=payload)

async def update_row_controller(db: AsyncSession, entity: str, row_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    return await update_row_service(db=db, entity=entity, row_id=row_id, payload=payload)

async def delete_row_controller(db: AsyncSession, entity: str, row_id: str) -> Dict[str, Any]:
    return await delete_row_service(db=db, entity=entity, row_id=row_id)
