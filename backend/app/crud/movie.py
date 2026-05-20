import uuid
from typing import Optional

from sqlalchemy import select, func, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.movie import Movie, Genre, Person
from app.schemas.movie import MovieCreate, MovieUpdate, MovieFilters


class CRUDGenre:
    async def get(self, db: AsyncSession, genre_id: uuid.UUID) -> Optional[Genre]:
        result = await db.execute(select(Genre).where(Genre.id == genre_id))
        return result.scalar_one_or_none()

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[Genre]:
        result = await db.execute(select(Genre).where(Genre.slug == slug))
        return result.scalar_one_or_none()

    async def get_all(self, db: AsyncSession) -> list[Genre]:
        result = await db.execute(select(Genre).order_by(Genre.name))
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, name: str, slug: str) -> Genre:
        genre = Genre(name=name, slug=slug)
        db.add(genre)
        await db.commit()
        await db.refresh(genre)
        return genre

    async def get_or_create(self, db: AsyncSession, name: str, slug: str) -> Genre:
        genre = await self.get_by_slug(db, slug)
        if not genre:
            genre = await self.create(db, name, slug)
        return genre


class CRUDPerson:
    async def get(self, db: AsyncSession, person_id: uuid.UUID) -> Optional[Person]:
        result = await db.execute(select(Person).where(Person.id == person_id))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, **kwargs) -> Person:
        person = Person(**kwargs)
        db.add(person)
        await db.commit()
        await db.refresh(person)
        return person

    async def search(self, db: AsyncSession, query: str) -> list[Person]:
        result = await db.execute(
            select(Person).where(Person.name.ilike(f"%{query}%")).limit(20)
        )
        return list(result.scalars().all())


class CRUDMovie:
    async def get(self, db: AsyncSession, movie_id: uuid.UUID) -> Optional[Movie]:
        result = await db.execute(
            select(Movie)
            .options(selectinload(Movie.genres))
            .where(Movie.id == movie_id)
        )
        return result.scalar_one_or_none()

    async def get_list(
        self, db: AsyncSession, filters: MovieFilters
    ) -> tuple[list[Movie], int]:
        query = select(Movie).options(selectinload(Movie.genres))

        # Apply filters
        conditions = []
        if filters.query:
            conditions.append(
                or_(
                    Movie.title.ilike(f"%{filters.query}%"),
                    Movie.original_title.ilike(f"%{filters.query}%"),
                )
            )
        if filters.genre_slug:
            query = query.join(Movie.genres).where(Genre.slug == filters.genre_slug)
        if filters.year_from:
            conditions.append(Movie.release_year >= filters.year_from)
        if filters.year_to:
            conditions.append(Movie.release_year <= filters.year_to)
        if filters.rating_min:
            conditions.append(Movie.avg_rating >= filters.rating_min)
        if filters.status:
            conditions.append(Movie.status == filters.status)

        if conditions:
            query = query.where(*conditions)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query) or 0

        # Apply sorting
        sort_col = getattr(Movie, filters.sort_by, Movie.created_at)
        if filters.sort_order == "asc":
            query = query.order_by(asc(sort_col))
        else:
            query = query.order_by(desc(sort_col))

        # Pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)

        result = await db.execute(query)
        movies = list(result.scalars().all())
        return movies, total

    async def get_top_rated(self, db: AsyncSession, limit: int = 10) -> list[Movie]:
        result = await db.execute(
            select(Movie)
            .options(selectinload(Movie.genres))
            .where(Movie.ratings_count >= 1)
            .order_by(desc(Movie.avg_rating))
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_recent(self, db: AsyncSession, limit: int = 10) -> list[Movie]:
        result = await db.execute(
            select(Movie)
            .options(selectinload(Movie.genres))
            .order_by(desc(Movie.created_at))
            .limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, obj_in: MovieCreate) -> Movie:
        genre_ids = obj_in.genre_ids
        movie_data = obj_in.model_dump(exclude={"genre_ids"})
        movie = Movie(**movie_data)

        if genre_ids:
            genres = await db.execute(
                select(Genre).where(Genre.id.in_(genre_ids))
            )
            movie.genres = list(genres.scalars().all())

        db.add(movie)
        await db.commit()
        await db.refresh(movie)
        return await self.get(db, movie.id)

    async def update(
        self, db: AsyncSession, movie: Movie, obj_in: MovieUpdate
    ) -> Movie:
        update_data = obj_in.model_dump(exclude_unset=True)
        genre_ids = update_data.pop("genre_ids", None)

        for field, value in update_data.items():
            setattr(movie, field, value)

        if genre_ids is not None:
            genres = await db.execute(
                select(Genre).where(Genre.id.in_(genre_ids))
            )
            movie.genres = list(genres.scalars().all())

        await db.commit()
        await db.refresh(movie)
        return await self.get(db, movie.id)

    async def delete(self, db: AsyncSession, movie: Movie) -> None:
        await db.delete(movie)
        await db.commit()

    async def update_rating(self, db: AsyncSession, movie_id: uuid.UUID) -> None:
        from app.models.review import Review

        result = await db.execute(
            select(func.avg(Review.rating), func.count(Review.id)).where(
                Review.movie_id == movie_id
            )
        )
        avg, count = result.one()
        movie = await self.get(db, movie_id)
        if movie:
            movie.avg_rating = round(avg or 0.0, 1)
            movie.ratings_count = count or 0
            await db.commit()


crud_movie = CRUDMovie()
crud_genre = CRUDGenre()
crud_person = CRUDPerson()
