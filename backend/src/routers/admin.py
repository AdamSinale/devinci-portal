from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.base import get_db
from src.controllers.admin import (list_tables_controller, table_schema_controller, list_rows_controller, create_row_controller, update_row_controller, delete_row_controller)

admin_router = APIRouter(prefix="/admin", tags=["admin"])

@admin_router.get("/tables")
async def list_tables() -> List[str]:
    return await list_tables_controller()

@admin_router.get("/tables/{table}/schema")
async def table_schema(table: str, db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    return await table_schema_controller(db=db, table=table)

@admin_router.get("/tables/{table}/rows")
async def list_rows(table: str, limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0), db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    return await list_rows_controller(db=db, table=table, limit=limit, offset=offset)

@admin_router.post("/tables/{table}/rows")
async def create_row(table: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    return await create_row_controller(db=db, table=table, payload=payload)

@admin_router.patch("/tables/{table}/rows/{row_id}")
async def update_row(table: str, row_id: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    return await update_row_controller(db=db, table=table, row_id=row_id, payload=payload)

@admin_router.delete("/tables/{table}/rows/{row_id}")
async def delete_row(table: str, row_id: str, db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    return await delete_row_controller(db=db, table=table, row_id=row_id)
