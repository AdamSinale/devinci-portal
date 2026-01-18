from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.entities.user.user import User

async def login_service(db: AsyncSession, payload: dict):
    user_id = payload.get("id")
    name = payload.get("name")

    if user_id is None and (not name or not str(name).strip()):
        raise HTTPException(400, "Send {id} or {name}")

    if user_id is not None:
        try:
            user_id = int(user_id)
        except ValueError:
            raise HTTPException(400, "Invalid id")

        user = await db.get(User, user_id)
    else:
        name = str(name).strip()
        res = await db.execute(select(User).where(User.name == name))
        user = res.scalars().first()

    if not user:
        raise HTTPException(401, "User not found")

    return {
        "user": {
            "id": user.id,
            "name": user.name,
        }
    }
