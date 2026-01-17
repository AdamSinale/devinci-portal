from __future__ import annotations

from typing import Any, Dict, List

from fastapi import HTTPException, Query
from sqlalchemy import MetaData, Table, delete, insert, select, update
from sqlalchemy.engine import Result
from sqlalchemy.exc import NoSuchTableError
from sqlalchemy.ext.asyncio import AsyncSession


# ✅ תחליף לפי הטבלאות שאתה מרשה לערוך
ALLOWED_TABLES = {
    "ForumIdeas",
    "ForumEvents",
    "ForumConstants",
    # "Users", "Teams", ...
}


def _load_table(name: str, session: AsyncSession) -> Table:
    if name not in ALLOWED_TABLES:
        raise HTTPException(status_code=403, detail="Table not allowed")

    md = MetaData()
    try:
        # async engine -> משתמשים ב sync_engine לרפלקציה
        return Table(name, md, autoload_with=session.bind.sync_engine)  # type: ignore[union-attr]
    except NoSuchTableError:
        raise HTTPException(status_code=404, detail="Table not found")


def _get_pk_column(table: Table):
    pk_cols = list(table.primary_key.columns)
    if not pk_cols:
        raise HTTPException(status_code=400, detail="Table has no primary key (not supported)")
    if len(pk_cols) != 1:
        raise HTTPException(status_code=400, detail="Composite PK not supported in this simple admin")
    return pk_cols[0]


def _serialize_row(row: Any) -> Dict[str, Any]:
    return dict(row._mapping)


async def list_tables_service() -> List[str]:
    return sorted(ALLOWED_TABLES)


async def table_schema_service(table: str, db: AsyncSession) -> Dict[str, Any]:
    tbl = _load_table(table, db)
    pk = _get_pk_column(tbl)

    cols: List[Dict[str, Any]] = []
    for c in tbl.columns:
        cols.append(
            {
                "name": c.name,
                "nullable": c.nullable,
                "primary_key": c.name == pk.name,
                "type": str(c.type),
            }
        )

    return {"table": tbl.name, "primary_key": pk.name, "columns": cols}


async def list_rows_service(
    table: str,
    db: AsyncSession,
    limit: int,
    offset: int,
) -> Dict[str, Any]:
    tbl = _load_table(table, db)

    stmt = select(tbl).limit(limit).offset(offset)
    res: Result = await db.execute(stmt)
    rows = [_serialize_row(r) for r in res.fetchall()]
    return {"items": rows, "limit": limit, "offset": offset}


async def create_row_service(table: str, payload: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
    tbl = _load_table(table, db)

    clean = {k: v for k, v in payload.items() if k in tbl.c}

    stmt = insert(tbl).values(**clean).returning(tbl)
    res = await db.execute(stmt)
    await db.commit()

    created = res.fetchone()
    return {"item": _serialize_row(created)}


async def update_row_service(
    table: str,
    row_id: str,
    payload: Dict[str, Any],
    db: AsyncSession,
) -> Dict[str, Any]:
    tbl = _load_table(table, db)
    pk = _get_pk_column(tbl)

    clean = {k: v for k, v in payload.items() if k in tbl.c and k != pk.name}

    stmt = update(tbl).where(pk == row_id).values(**clean).returning(tbl)
    res = await db.execute(stmt)
    updated = res.fetchone()
    if not updated:
        raise HTTPException(status_code=404, detail="Row not found")

    await db.commit()
    return {"item": _serialize_row(updated)}


async def delete_row_service(table: str, row_id: str, db: AsyncSession) -> Dict[str, Any]:
    tbl = _load_table(table, db)
    pk = _get_pk_column(tbl)

    stmt = delete(tbl).where(pk == row_id).returning(pk)
    res = await db.execute(stmt)
    deleted = res.fetchone()
    if not deleted:
        raise HTTPException(status_code=404, detail="Row not found")

    await db.commit()
    return {"deleted": True, "id": row_id}
