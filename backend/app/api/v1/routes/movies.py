import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_current_admin, get_optional_user
from app.core.database import get_db
from app.crud.movie import crud_movie, crud_genre
from app.models.user import User
from app.schemas.movie import (
    GenreRead,
    MovieCreate,
    MovieFilters,
    MovieListItem,
    MovieRead,
    MovieUpdate,
    PaginatedMovies,
)

router = APIRouter()


@router.get("/", response_model=PaginatedMovies)
async def list_movies(
    db: Annotated[AsyncSession, Depends(get_db)],
    query: Optional[str] = Query(None),
    genre_slug: Optional[str] = Query(None),
    year_from: Optional[int] = Query(None),
    year_to: Optional[int] = Query(None),
    rating_min: Optional[float] = Query(None, ge=0, le=10),
    status: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    filters = MovieFilters(
        query=query,
        genre_slug=genre_slug,
        year_from=year_from,
        year_to=year_to,
        rating_min=rating_min,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    movies, total = await crud_movie.get_list(db, filters)
    total_pages = (total + page_size - 1) // page_size
    return PaginatedMovies(
        items=movies,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/top-rated", response_model=list[MovieListItem])
async def top_rated_movies(
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(10, ge=1, le=50),
):
    return await crud_movie.get_top_rated(db, limit)


@router.get("/recent", response_model=list[MovieListItem])
async def recent_movies(
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(10, ge=1, le=50),
):
    return await crud_movie.get_recent(db, limit)


@router.get("/genres", response_model=list[GenreRead])
async def list_genres(db: Annotated[AsyncSession, Depends(get_db)]):
    return await crud_genre.get_all(db)


@router.get("/{movie_id}", response_model=MovieRead)
async def get_movie(
    movie_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    movie = await crud_movie.get(db, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie


@router.post("/", response_model=MovieRead, status_code=201)
async def create_movie(
    movie_in: MovieCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
):
    return await crud_movie.create(db, movie_in)


@router.patch("/{movie_id}", response_model=MovieRead)
async def update_movie(
    movie_id: uuid.UUID,
    movie_in: MovieUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
):
    movie = await crud_movie.get(db, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return await crud_movie.update(db, movie, movie_in)


@router.delete("/{movie_id}", status_code=204)
async def delete_movie(
    movie_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
):
    movie = await crud_movie.get(db, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    await crud_movie.delete(db, movie)
