import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.core.security import verify_password
from app.crud.user import crud_user
from app.models.user import User
from app.schemas.user import UserPublic, UserRead, UserStats, UserUpdate, UserChangePassword

router = APIRouter()


@router.get("/me", response_model=UserRead)
async def get_my_profile(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return current_user


@router.patch("/me", response_model=UserRead)
async def update_my_profile(
    obj_in: UserUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await crud_user.update(db, current_user, obj_in)


@router.post("/me/change-password")
async def change_password(
    obj_in: UserChangePassword,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if not verify_password(obj_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await crud_user.change_password(db, current_user, obj_in.new_password)
    return {"message": "Password changed successfully"}


@router.get("/me/stats", response_model=UserStats)
async def get_my_stats(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stats = await crud_user.get_stats(db, current_user.id)
    return UserStats(**stats)


@router.get("/{username}", response_model=UserPublic)
async def get_user_profile(
    username: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user = await crud_user.get_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{username}/stats", response_model=UserStats)
async def get_user_stats(
    username: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user = await crud_user.get_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    stats = await crud_user.get_stats(db, user.id)
    return UserStats(**stats)
