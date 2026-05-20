import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_optional_user
from app.core.database import get_db
from app.crud.movie import crud_movie
from app.crud.review import crud_review
from app.models.user import User
from app.schemas.review import PaginatedReviews, ReviewCreate, ReviewRead, ReviewUpdate

router = APIRouter()


@router.get("/movie/{movie_id}", response_model=PaginatedReviews)
async def get_movie_reviews(
    movie_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    movie = await crud_movie.get(db, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    reviews, total = await crud_review.get_by_movie(db, movie_id, page, page_size)
    total_pages = (total + page_size - 1) // page_size
    return PaginatedReviews(
        items=reviews,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/user/{user_id}", response_model=PaginatedReviews)
async def get_user_reviews(
    user_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    reviews, total = await crud_review.get_by_user(db, user_id, page, page_size)
    total_pages = (total + page_size - 1) // page_size
    return PaginatedReviews(
        items=reviews,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/movie/{movie_id}/my", response_model=ReviewRead | None)
async def get_my_review_for_movie(
    movie_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return await crud_review.get_user_review_for_movie(db, current_user.id, movie_id)


@router.post("/movie/{movie_id}", response_model=ReviewRead, status_code=201)
async def create_review(
    movie_id: uuid.UUID,
    review_in: ReviewCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    movie = await crud_movie.get(db, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    existing = await crud_review.get_user_review_for_movie(db, current_user.id, movie_id)
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this movie")

    review = await crud_review.create(db, review_in, current_user.id, movie_id)
    await crud_movie.update_rating(db, movie_id)
    return review


@router.patch("/{review_id}", response_model=ReviewRead)
async def update_review(
    review_id: uuid.UUID,
    review_in: ReviewUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    review = await crud_review.get(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    updated = await crud_review.update(db, review, review_in)
    await crud_movie.update_rating(db, review.movie_id)
    return updated


@router.delete("/{review_id}", status_code=204)
async def delete_review(
    review_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    review = await crud_review.get(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    movie_id = review.movie_id
    await crud_review.delete(db, review)
    await crud_movie.update_rating(db, movie_id)
