import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.movie import MovieListItem


class FavoriteRead(BaseModel):
    id: uuid.UUID
    movie_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    movie: MovieListItem

    model_config = {"from_attributes": True}


class WatchListRead(BaseModel):
    id: uuid.UUID
    movie_id: uuid.UUID
    user_id: uuid.UUID
    status: str
    created_at: datetime
    movie: MovieListItem

    model_config = {"from_attributes": True}


class WatchListUpdate(BaseModel):
    status: str  # want_to_watch, watching, watched
