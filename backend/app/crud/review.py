import uuid
from typing import Optional

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewUpdate


class CRUDReview:
    async def get(self, db: AsyncSession, review_id: uuid.UUID) -> Optional[Review]:
        result = await db.execute(
            select(Review)
            .options(selectinload(Review.user))
            .where(Review.id == review_id)
        )
        return result.scalar_one_or_none()

    async def get_by_movie(
        self,
        db: AsyncSession,
        movie_id: uuid.UUID,
        page: int = 1,
        page_size: int = 10,
    ) -> tuple[list[Review], int]:
        count = await db.scalar(
            select(func.count()).where(Review.movie_id == movie_id)
        )
        result = await db.execute(
            select(Review)
            .options(selectinload(Review.user))
            .where(Review.movie_id == movie_id)
            .order_by(desc(Review.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars().all()), count or 0

    async def get_by_user(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        page: int = 1,
        page_size: int = 10,
    ) -> tuple[list[Review], int]:
        count = await db.scalar(
            select(func.count()).where(Review.user_id == user_id)
        )
        result = await db.execute(
            select(Review)
            .options(selectinload(Review.user))
            .where(Review.user_id == user_id)
            .order_by(desc(Review.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars().all()), count or 0

    async def get_user_review_for_movie(
        self, db: AsyncSession, user_id: uuid.UUID, movie_id: uuid.UUID
    ) -> Optional[Review]:
        result = await db.execute(
            select(Review)
            .options(selectinload(Review.user))
            .where(Review.user_id == user_id, Review.movie_id == movie_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self, db: AsyncSession, obj_in: ReviewCreate, user_id: uuid.UUID, movie_id: uuid.UUID
    ) -> Review:
        review = Review(
            **obj_in.model_dump(),
            user_id=user_id,
            movie_id=movie_id,
        )
        db.add(review)
        await db.commit()
        await db.refresh(review)
        return await self.get(db, review.id)

    async def update(
        self, db: AsyncSession, review: Review, obj_in: ReviewUpdate
    ) -> Review:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(review, field, value)
        await db.commit()
        await db.refresh(review)
        return await self.get(db, review.id)

    async def delete(self, db: AsyncSession, review: Review) -> None:
        await db.delete(review)
        await db.commit()


crud_review = CRUDReview()
