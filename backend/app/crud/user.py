import uuid
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.models.review import Review
from app.models.favorite import Favorite, WatchList
from app.schemas.user import UserCreate, UserUpdate


class CRUDUser:
    async def get(self, db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, obj_in: UserCreate) -> User:
        user = User(
            email=obj_in.email,
            username=obj_in.username,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            bio=obj_in.bio,
            avatar_url=obj_in.avatar_url,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    async def update(self, db: AsyncSession, user: User, obj_in: UserUpdate) -> User:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        await db.commit()
        await db.refresh(user)
        return user

    async def change_password(
        self, db: AsyncSession, user: User, new_password: str
    ) -> User:
        user.hashed_password = get_password_hash(new_password)
        await db.commit()
        await db.refresh(user)
        return user

    async def authenticate(
        self, db: AsyncSession, email: str, password: str
    ) -> Optional[User]:
        user = await self.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def get_stats(self, db: AsyncSession, user_id: uuid.UUID) -> dict:
        reviews_count = await db.scalar(
            select(func.count()).where(Review.user_id == user_id)
        )
        favorites_count = await db.scalar(
            select(func.count()).where(Favorite.user_id == user_id)
        )
        watchlist_count = await db.scalar(
            select(func.count()).where(WatchList.user_id == user_id)
        )
        return {
            "reviews_count": reviews_count or 0,
            "favorites_count": favorites_count or 0,
            "watchlist_count": watchlist_count or 0,
        }


crud_user = CRUDUser()
