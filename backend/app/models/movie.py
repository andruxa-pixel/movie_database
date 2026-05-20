import uuid
from datetime import date, datetime

from sqlalchemy import (
    BigInteger,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

# Association table: Movie <-> Genre
movie_genres = Table(
    "movie_genres",
    Base.metadata,
    Column("movie_id", UUID(as_uuid=True), ForeignKey("movies.id", ondelete="CASCADE")),
    Column("genre_id", UUID(as_uuid=True), ForeignKey("genres.id", ondelete="CASCADE")),
)

# Association table: Movie <-> Person (cast/crew)
movie_cast = Table(
    "movie_cast",
    Base.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("movie_id", UUID(as_uuid=True), ForeignKey("movies.id", ondelete="CASCADE")),
    Column("person_id", UUID(as_uuid=True), ForeignKey("persons.id", ondelete="CASCADE")),
    Column("role", String(50), nullable=False),  # director, actor, writer, producer
    Column("character_name", String(100), nullable=True),
    Column("order_index", Integer, default=0),
)


class Genre(Base):
    __tablename__ = "genres"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)

    movies: Mapped[list["Movie"]] = relationship(
        "Movie", secondary=movie_genres, back_populates="genres"
    )

    def __repr__(self) -> str:
        return f"<Genre {self.name}>"


class Person(Base):
    __tablename__ = "persons"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    birth_place: Mapped[str | None] = mapped_column(String(200), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<Person {self.name}>"


class Movie(Base):
    __tablename__ = "movies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    original_title: Mapped[str | None] = mapped_column(String(300), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    release_year: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    release_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    duration: Mapped[int | None] = mapped_column(Integer, nullable=True)  # minutes
    poster_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    backdrop_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    trailer_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    language: Mapped[str | None] = mapped_column(String(100), nullable=True)
    age_rating: Mapped[str | None] = mapped_column(String(20), nullable=True)  # PG-13, R, etc.
    status: Mapped[str] = mapped_column(
        String(20), default="released", nullable=False
    )  # released, upcoming, announced
    imdb_id: Mapped[str | None] = mapped_column(String(20), nullable=True)
    budget: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    box_office: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    avg_rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    ratings_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    genres: Mapped[list["Genre"]] = relationship(
        "Genre", secondary=movie_genres, back_populates="movies"
    )
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="movie", cascade="all, delete-orphan"
    )
    favorites: Mapped[list["Favorite"]] = relationship(
        "Favorite", back_populates="movie", cascade="all, delete-orphan"
    )
    watchlist_entries: Mapped[list["WatchList"]] = relationship(
        "WatchList", back_populates="movie", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Movie {self.title} ({self.release_year})>"
