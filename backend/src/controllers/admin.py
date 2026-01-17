from __future__ import annotations

from typing import Any, Dict, List

from sqlalchemy.ext.asyncio import AsyncSession

from src.services.admin import (list_tables_service, table_schema_service, list_rows_service, create_row_service, update_row_service, delete_row_service,)

async def list_tables_controller() -> List[str]:
    return await list_tables_service()

async def table_schema_controller(db: AsyncSession, table: str) -> Dict[str, Any]:
    return await table_schema_service(table=table, db=db)

async def list_rows_controller(db: AsyncSession, table: str, limit: int, offset: int) -> Dict[str, Any]:
    return await list_rows_service(table=table, db=db, limit=limit, offset=offset)

async def create_row_controller(db: AsyncSession, table: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    return await create_row_service(table=table, payload=payload, db=db)

async def update_row_controller(db: AsyncSession, table: str, row_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    return await update_row_service(table=table, row_id=row_id, payload=payload, db=db)

async def delete_row_controller(db: AsyncSession, table: str, row_id: str) -> Dict[str, Any]:
    return await delete_row_service(table=table, row_id=row_id, db=db)
