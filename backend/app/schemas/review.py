import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.user import UserPublic


class ReviewBase(BaseModel):
    rating: float = Field(..., ge=1.0, le=10.0)
    title: Optional[str] = Field(None, max_length=200)
    content: str = Field(..., min_length=10, max_length=5000)
    is_spoiler: bool = False


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(BaseModel):
    rating: Optional[float] = Field(None, ge=1.0, le=10.0)
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = Field(None, min_length=10, max_length=5000)
    is_spoiler: Optional[bool] = None


class ReviewRead(ReviewBase):
    id: uuid.UUID
    movie_id: uuid.UUID
    user_id: uuid.UUID
    likes_count: int
    created_at: datetime
    updated_at: datetime
    user: UserPublic

    model_config = {"from_attributes": True}


class PaginatedReviews(BaseModel):
    items: list[ReviewRead]
    total: int
    page: int
    page_size: int
    total_pages: int
