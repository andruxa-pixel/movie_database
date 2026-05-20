import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class GenreBase(BaseModel):
    name: str = Field(..., max_length=100)
    slug: str = Field(..., max_length=100)


class GenreCreate(GenreBase):
    pass


class GenreRead(GenreBase):
    id: uuid.UUID
    model_config = {"from_attributes": True}


class PersonBase(BaseModel):
    name: str = Field(..., max_length=200)
    photo_url: Optional[str] = None
    birth_date: Optional[date] = None
    birth_place: Optional[str] = Field(None, max_length=200)
    bio: Optional[str] = None


class PersonCreate(PersonBase):
    pass


class PersonRead(PersonBase):
    id: uuid.UUID
    model_config = {"from_attributes": True}


class CastMember(BaseModel):
    person: PersonRead
    role: str
    character_name: Optional[str] = None
    order_index: int = 0


class MovieBase(BaseModel):
    title: str = Field(..., max_length=300)
    original_title: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    release_year: Optional[int] = Field(None, ge=1888, le=2100)
    release_date: Optional[date] = None
    duration: Optional[int] = Field(None, ge=1)  # minutes
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    trailer_url: Optional[str] = None
    country: Optional[str] = Field(None, max_length=100)
    language: Optional[str] = Field(None, max_length=100)
    age_rating: Optional[str] = Field(None, max_length=20)
    status: str = Field("released", pattern=r"^(released|upcoming|announced)$")
    imdb_id: Optional[str] = Field(None, max_length=20)
    budget: Optional[int] = None
    box_office: Optional[int] = None


class MovieCreate(MovieBase):
    genre_ids: list[uuid.UUID] = []


class MovieUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=300)
    original_title: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    release_year: Optional[int] = Field(None, ge=1888, le=2100)
    release_date: Optional[date] = None
    duration: Optional[int] = Field(None, ge=1)
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    trailer_url: Optional[str] = None
    country: Optional[str] = Field(None, max_length=100)
    language: Optional[str] = Field(None, max_length=100)
    age_rating: Optional[str] = Field(None, max_length=20)
    status: Optional[str] = Field(None, pattern=r"^(released|upcoming|announced)$")
    budget: Optional[int] = None
    box_office: Optional[int] = None
    genre_ids: Optional[list[uuid.UUID]] = None


class MovieRead(MovieBase):
    id: uuid.UUID
    avg_rating: float
    ratings_count: int
    genres: list[GenreRead] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MovieListItem(BaseModel):
    id: uuid.UUID
    title: str
    original_title: Optional[str]
    release_year: Optional[int]
    poster_url: Optional[str]
    avg_rating: float
    ratings_count: int
    duration: Optional[int]
    genres: list[GenreRead] = []
    status: str

    model_config = {"from_attributes": True}


class MovieFilters(BaseModel):
    query: Optional[str] = None
    genre_slug: Optional[str] = None
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    rating_min: Optional[float] = None
    status: Optional[str] = None
    sort_by: str = "created_at"  # created_at, avg_rating, release_year, title
    sort_order: str = "desc"  # asc, desc
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


class PaginatedMovies(BaseModel):
    items: list[MovieListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
