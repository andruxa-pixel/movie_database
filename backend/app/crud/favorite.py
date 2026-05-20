import uuid
from typing import Optional

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.favorite import Favorite, WatchList
from app.models.movie import Movie


class CRUDFavorite:
    async def get(
        self, db: AsyncSession, user_id: uuid.UUID, movie_id: uuid.UUID
    ) -> Optional[Favorite]:
        result = await db.execute(
            select(Favorite)
            .options(selectinload(Favorite.movie).selectinload(Movie.genres))
            .where(Favorite.user_id == user_id, Favorite.movie_id == movie_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user(
        self, db: AsyncSession, user_id: uuid.UUID, page: int = 1, page_size: int = 20
    ) -> tuple[list[Favorite], int]:
        count = await db.scalar(
            select(func.count()).where(Favorite.user_id == user_id)
        )
        result = await db.execute(
            select(Favorite)
            .options(selectinload(Favorite.movie).selectinload(Movie.genres))
            .where(Favorite.user_id == user_id)
            .order_by(desc(Favorite.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars().all()), count or 0

    async def add(
        self, db: AsyncSession, user_id: uuid.UUID, movie_id: uuid.UUID
    ) -> Favorite:
        favorite = Favorite(user_id=user_id, movie_id=movie_id)
        db.add(favorite)
        await db.commit()
        await db.refresh(favorite)
        return await self.get(db, user_id, movie_id)

    async def remove(self, db: AsyncSession, favorite: Favorite) -> None:
        await db.delete(favorite)
        await db.commit()

    async def is_favorited(
        self, db: AsyncSession, user_id: uuid.UUID, movie_id: uuid.UUID
    ) -> bool:
        count = await db.scalar(
            select(func.count()).where(
                Favorite.user_id == user_id, Favorite.movie_id == movie_id
            )
        )
        return (count or 0) > 0


class CRUDWatchList:
    async def get(
        self, db: AsyncSession, user_id: uuid.UUID, movie_id: uuid.UUID
    ) -> Optional[WatchList]:
        result = await db.execute(
            select(WatchList)
            .options(selectinload(WatchList.movie).selectinload(Movie.genres))
            .where(WatchList.user_id == user_id, WatchList.movie_id == movie_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[WatchList], int]:
        query = select(WatchList).options(
            selectinload(WatchList.movie).selectinload(Movie.genres)
        ).where(WatchList.user_id == user_id)

        if status:
            query = query.where(WatchList.status == status)

        count_query = select(func.count()).select_from(query.subquery())
        count = await db.scalar(count_query)

        result = await db.execute(
            query.order_by(desc(WatchList.updated_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars().all()), count or 0

    async def add_or_update(
        self, db: AsyncSession, user_id: uuid.UUID, movie_id: uuid.UUID, status: str
    ) -> WatchList:
        entry = await self.get(db, user_id, movie_id)
        if entry:
            entry.status = status
            await db.commit()
            await db.refresh(entry)
        else:
            entry = WatchList(user_id=user_id, movie_id=movie_id, status=status)
            db.add(entry)
            await db.commit()
            await db.refresh(entry)
        return await self.get(db, user_id, movie_id)

    async def remove(self, db: AsyncSession, entry: WatchList) -> None:
        await db.delete(entry)
        await db.commit()


crud_favorite = CRUDFavorite()
crud_watchlist = CRUDWatchList()
