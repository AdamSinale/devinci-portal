from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Tuple

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.engine import Result
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.inspection import inspect
from sqlalchemy.sql.sqltypes import (
    Integer, BigInteger, SmallInteger,
    Boolean, Date, DateTime
)

try:
    # Postgres ARRAY type (for int[] etc.)
    from sqlalchemy.dialects.postgresql import ARRAY  # type: ignore
except Exception:  # pragma: no cover
    ARRAY = None  # fallback

# === Import your ORM models ===
from src.entities.user.user import User
from src.entities.user.role import Role
from src.entities.user.user_role import UserRole
from src.entities.user.user_event import UserEvent
from src.entities.user.message import Message

from src.entities.team.team import Team
from src.entities.team.team_link import TeamLink

from src.entities.forum.forum_event import ForumEvent
from src.entities.forum.forum_idea import ForumIdea
from src.entities.forum.forum_settings import ForumSettings


# ✅ Simple allowlist mapping (not a registry framework, just a dict)
ENTITY_MODELS: Dict[str, Any] = {
    "users": User,
    "roles": Role,
    "user_roles": UserRole,
    "user_events": UserEvent,
    "messages": Message,
    "teams": Team,
    "team_links": TeamLink,
    "forum_events": ForumEvent,
    "forum_ideas": ForumIdea,
    "forum_settings": ForumSettings,
}


def _get_model(entity: str):
    Model = ENTITY_MODELS.get(entity)
    if not Model:
        raise HTTPException(404, "Unknown entity")
    return Model


def _pk_columns(Model) -> List[Any]:
    mapper = inspect(Model)
    return list(mapper.primary_key)


def _parse_row_id(pk_cols: List[Any], row_id: str) -> Dict[str, Any]:
    """
    - Single PK: row_id="123"
    - Composite PK: row_id="12:5" (in the same pk columns order)
    """
    if len(pk_cols) == 1:
        return {pk_cols[0].name: row_id}

    parts = row_id.split(":")
    if len(parts) != len(pk_cols):
        raise HTTPException(400, f"Composite id must have {len(pk_cols)} parts joined by ':'")

    return {pk_cols[i].name: parts[i] for i in range(len(pk_cols))}


def _coerce_scalar(col_type: Any, v: Any, col_name: str) -> Any:
    if v is None:
        return None

    # ints
    if isinstance(col_type, (Integer, BigInteger, SmallInteger)):
        if isinstance(v, int):
            return v
        if isinstance(v, str):
            s = v.strip()
            if s == "":
                return None
            try:
                return int(s)
            except ValueError:
                raise HTTPException(400, f"Invalid integer for '{col_name}'")
        raise HTTPException(400, f"Invalid integer for '{col_name}'")

    # bool
    if isinstance(col_type, Boolean):
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            s = v.strip().lower()
            if s in ("true", "1", "yes", "y", "on"):
                return True
            if s in ("false", "0", "no", "n", "off"):
                return False
            if s == "":
                return None
        raise HTTPException(400, f"Invalid boolean for '{col_name}'")

    # date
    if isinstance(col_type, Date):
        if isinstance(v, date) and not isinstance(v, datetime):
            return v
        if isinstance(v, str):
            s = v.strip()
            if s == "":
                return None
            try:
                return date.fromisoformat(s)  # YYYY-MM-DD
            except ValueError:
                raise HTTPException(400, f"Invalid date for '{col_name}' (expected YYYY-MM-DD)")
        raise HTTPException(400, f"Invalid date for '{col_name}'")

    # datetime
    if isinstance(col_type, DateTime):
        if isinstance(v, datetime):
            return v
        if isinstance(v, str):
            s = v.strip()
            if s == "":
                return None
            # Accept ISO; allow "YYYY-MM-DDTHH:MM" etc.
            try:
                return datetime.fromisoformat(s)
            except ValueError:
                raise HTTPException(400, f"Invalid datetime for '{col_name}' (expected ISO format)")
        raise HTTPException(400, f"Invalid datetime for '{col_name}'")

    # default: leave as-is
    return v


def _coerce_value(col, v: Any) -> Any:
    col_type = col.type

    # Postgres arrays, e.g. INTEGER[]
    if ARRAY is not None and isinstance(col_type, ARRAY):
        item_t = col_type.item_type

        # Accept "1,2,3" as string
        if isinstance(v, str):
            s = v.strip()
            if s == "":
                return None
            parts = [p.strip() for p in s.split(",") if p.strip() != ""]
            v = parts

        if isinstance(v, (list, tuple)):
            out = []
            for i, item in enumerate(v):
                # guard against buggy ["1", ",", "2"...]
                if isinstance(item, str) and item.strip() == ",":
                    continue
                out.append(_coerce_scalar(item_t, item, f"{col.name}[{i}]"))
            return out

        raise HTTPException(400, f"Invalid array for '{col.name}' (expected list or comma-separated string)")

    return _coerce_scalar(col_type, v, col.name)


def _serialize(obj) -> Dict[str, Any]:
    """
    Serialize only table columns (not relationships).
    """
    out: Dict[str, Any] = {}
    for c in obj.__table__.columns:
        out[c.name] = getattr(obj, c.name)
    return out


def _clean_payload(Model, payload: Dict[str, Any]) -> Dict[str, Any]:
    cols = {c.name: c for c in Model.__table__.columns}
    out: Dict[str, Any] = {}

    for k, v in payload.items():
        if k not in cols:
            continue
        col = cols[k]
        vv = _coerce_value(col, v)

        # if nullable and empty -> null
        if vv == "" and getattr(col, "nullable", False):
            vv = None

        out[k] = vv

    return out


async def list_entities_service() -> Dict[str, Any]:
    return {"entities": sorted(list(ENTITY_MODELS.keys()))}


async def list_rows_service(db: AsyncSession, entity: str, limit: int, offset: int) -> Dict[str, Any]:
    Model = _get_model(entity)

    stmt = select(Model).limit(limit).offset(offset)
    res: Result = await db.execute(stmt)
    items = [_serialize(x) for x in res.scalars().all()]

    total = await db.scalar(select(func.count()).select_from(Model))
    pk_cols = _pk_columns(Model)
    return {
        "items": items,
        "limit": limit,
        "offset": offset,
        "total": int(total or 0),
        "primary_key": [c.name for c in pk_cols],  # can be composite
        "columns": [c.name for c in Model.__table__.columns],
    }


async def create_row_service(db: AsyncSession, entity: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    Model = _get_model(entity)
    data = _clean_payload(Model, payload)

    obj = Model(**data)
    db.add(obj)

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(400, f"Create failed: {str(e)}")

    # refresh for generated PK/defaults
    try:
        await db.refresh(obj)
    except Exception:
        # some composite/join tables might not refresh well; ignore
        pass

    return {"item": _serialize(obj)}


async def update_row_service(db: AsyncSession, entity: str, row_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    Model = _get_model(entity)
    pk_cols = _pk_columns(Model)

    key_raw = _parse_row_id(pk_cols, row_id)

    # coerce PK values too
    key: Dict[str, Any] = {}
    for c in pk_cols:
        key[c.name] = _coerce_value(c, key_raw[c.name])

    obj = await db.get(Model, key if len(pk_cols) > 1 else list(key.values())[0])
    if not obj:
        raise HTTPException(404, "Row not found")

    data = _clean_payload(Model, payload)

    # don't allow changing PK via update (avoid weirdness)
    for c in pk_cols:
        data.pop(c.name, None)

    for k, v in data.items():
        setattr(obj, k, v)

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(400, f"Update failed: {str(e)}")

    try:
        await db.refresh(obj)
    except Exception:
        pass

    return {"item": _serialize(obj)}


async def delete_row_service(db: AsyncSession, entity: str, row_id: str) -> Dict[str, Any]:
    Model = _get_model(entity)
    pk_cols = _pk_columns(Model)

    key_raw = _parse_row_id(pk_cols, row_id)

    key: Dict[str, Any] = {}
    for c in pk_cols:
        key[c.name] = _coerce_value(c, key_raw[c.name])

    obj = await db.get(Model, key if len(pk_cols) > 1 else list(key.values())[0])
    if not obj:
        raise HTTPException(404, "Row not found")

    await db.delete(obj)
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(400, f"Delete failed: {str(e)}")

    return {"deleted": True, "id": row_id}
