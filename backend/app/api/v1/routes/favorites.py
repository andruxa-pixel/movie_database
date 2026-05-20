import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.crud.favorite import crud_favorite, crud_watchlist
from app.crud.movie import crud_movie
from app.models.user import User
from app.schemas.favorite import FavoriteRead, WatchListRead, WatchListUpdate

router = APIRouter()


# ─── Favorites ────────────────────────────────────────────────────────────────

@router.get("/", response_model=dict)
async def get_my_favorites(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    items, total = await crud_favorite.get_by_user(db, current_user.id, page, page_size)
    return {
        "items": [FavoriteRead.model_validate(item) for item in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.post("/movie/{movie_id}", response_model=FavoriteRead, status_code=201)
async def add_to_favorites(
    movie_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    movie = await crud_movie.get(db, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    if await crud_favorite.is_favorited(db, current_user.id, movie_id):
        raise HTTPException(status_code=400, detail="Movie already in favorites")

    return await crud_favorite.add(db, current_user.id, movie_id)


@router.delete("/movie/{movie_id}", status_code=204)
async def remove_from_favorites(
    movie_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    favorite = await crud_favorite.get(db, current_user.id, movie_id)
    if not favorite:
        raise HTTPException(status_code=404, detail="Movie not in favorites")
    await crud_favorite.remove(db, favorite)


@router.get("/movie/{movie_id}/check")
async def check_favorite(
    movie_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    is_fav = await crud_favorite.is_favorited(db, current_user.id, movie_id)
    return {"is_favorited": is_fav}


# ─── Watchlist ────────────────────────────────────────────────────────────────

@router.get("/watchlist", response_model=dict)
async def get_my_watchlist(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    items, total = await crud_watchlist.get_by_user(db, current_user.id, status, page, page_size)
    return {
        "items": [WatchListRead.model_validate(item) for item in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.post("/watchlist/movie/{movie_id}", response_model=WatchListRead)
async def add_to_watchlist(
    movie_id: uuid.UUID,
    obj_in: WatchListUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    movie = await crud_movie.get(db, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return await crud_watchlist.add_or_update(db, current_user.id, movie_id, obj_in.status)


@router.delete("/watchlist/movie/{movie_id}", status_code=204)
async def remove_from_watchlist(
    movie_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    entry = await crud_watchlist.get(db, current_user.id, movie_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Movie not in watchlist")
    await crud_watchlist.remove(db, entry)
