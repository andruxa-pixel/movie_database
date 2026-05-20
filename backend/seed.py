"""
Seed script to populate the database with sample data.
Run: python seed.py
"""
import asyncio
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.movie import Movie, Genre, movie_genres
import app.models  # noqa: F401


GENRES = [
    ("Action", "action"),
    ("Adventure", "adventure"),
    ("Animation", "animation"),
    ("Comedy", "comedy"),
    ("Crime", "crime"),
    ("Documentary", "documentary"),
    ("Drama", "drama"),
    ("Fantasy", "fantasy"),
    ("Horror", "horror"),
    ("Mystery", "mystery"),
    ("Romance", "romance"),
    ("Sci-Fi", "sci-fi"),
    ("Thriller", "thriller"),
    ("War", "war"),
    ("Western", "western"),
    ("Biography", "biography"),
    ("History", "history"),
    ("Music", "music"),
    ("Sport", "sport"),
    ("Family", "family"),
]

MOVIES = [
    {
        "title": "Побег из Шоушенка",
        "original_title": "The Shawshank Redemption",
        "description": "На протяжении нескольких лет два заключённых сближаются, находя утешение и возможное искупление через акты обычной порядочности.",
        "release_year": 1994,
        "duration": 142,
        "country": "США",
        "language": "Английский",
        "age_rating": "R",
        "status": "released",
        "avg_rating": 9.3,
        "ratings_count": 2800000,
        "poster_url": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
        "genres": ["drama", "crime"],
    },
    {
        "title": "Крёстный отец",
        "original_title": "The Godfather",
        "description": "Стареющий патриарх преступной организации передаёт управление своей тайной империей своему сыну.",
        "release_year": 1972,
        "duration": 175,
        "country": "США",
        "language": "Английский",
        "age_rating": "R",
        "status": "released",
        "avg_rating": 9.2,
        "ratings_count": 1900000,
        "poster_url": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLeMaNMKpxs.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
        "genres": ["crime", "drama"],
    },
    {
        "title": "Тёмный рыцарь",
        "original_title": "The Dark Knight",
        "description": "Когда угроза, известная как Джокер, опустошает Готэм-сити, Бэтмен должен принять одно из самых сложных психологических и физических решений в своей войне с несправедливостью.",
        "release_year": 2008,
        "duration": 152,
        "country": "США",
        "language": "Английский",
        "age_rating": "PG-13",
        "status": "released",
        "avg_rating": 9.0,
        "ratings_count": 2600000,
        "poster_url": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsqX7An9LH.jpg",
        "genres": ["action", "crime", "drama"],
    },
    {
        "title": "Список Шиндлера",
        "original_title": "Schindler's List",
        "description": "В Польше, оккупированной Германией во время Второй мировой войны, промышленник Оскар Шиндлер постепенно проникается заботой о своих еврейских работниках.",
        "release_year": 1993,
        "duration": 195,
        "country": "США",
        "language": "Английский",
        "age_rating": "R",
        "status": "released",
        "avg_rating": 8.9,
        "ratings_count": 1400000,
        "poster_url": "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg",
        "genres": ["biography", "drama", "history"],
    },
    {
        "title": "Властелин колец: Возвращение короля",
        "original_title": "The Lord of the Rings: The Return of the King",
        "description": "Войска Гэндальфа и Арагорна борются против сил Саурона перед вратами Мордора, пока Фродо и Сэм приближаются к горе Судьбы с Голлумом.",
        "release_year": 2003,
        "duration": 201,
        "country": "Новая Зеландия",
        "language": "Английский",
        "age_rating": "PG-13",
        "status": "released",
        "avg_rating": 8.9,
        "ratings_count": 1800000,
        "poster_url": "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/lXhgCODAbBXL5buk9yEmTpOoOgR.jpg",
        "genres": ["action", "adventure", "drama", "fantasy"],
    },
    {
        "title": "Начало",
        "original_title": "Inception",
        "description": "Вор, который проникает в подсознание своих жертв, получает шанс на искупление через имплантацию идеи в разум своей цели.",
        "release_year": 2010,
        "duration": 148,
        "country": "США",
        "language": "Английский",
        "age_rating": "PG-13",
        "status": "released",
        "avg_rating": 8.8,
        "ratings_count": 2400000,
        "poster_url": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        "genres": ["action", "adventure", "sci-fi", "thriller"],
    },
    {
        "title": "Интерстеллар",
        "original_title": "Interstellar",
        "description": "Команда исследователей путешествует через червоточину в космосе в попытке обеспечить выживание человечества.",
        "release_year": 2014,
        "duration": 169,
        "country": "США",
        "language": "Английский",
        "age_rating": "PG-13",
        "status": "released",
        "avg_rating": 8.6,
        "ratings_count": 1900000,
        "poster_url": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
        "genres": ["adventure", "drama", "sci-fi"],
    },
    {
        "title": "Матрица",
        "original_title": "The Matrix",
        "description": "Хакер Нео узнаёт, что его реальность — это симуляция, и присоединяется к восстанию против машин.",
        "release_year": 1999,
        "duration": 136,
        "country": "США",
        "language": "Английский",
        "age_rating": "R",
        "status": "released",
        "avg_rating": 8.7,
        "ratings_count": 1800000,
        "poster_url": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
        "genres": ["action", "sci-fi"],
    },
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Create admin user
        from sqlalchemy import select
        existing_admin = await db.scalar(select(User).where(User.email == "admin@cinerating.com"))
        if not existing_admin:
            admin = User(
                email="admin@cinerating.com",
                username="admin",
                hashed_password=get_password_hash("Admin123"),
                full_name="Administrator",
                is_admin=True,
                is_active=True,
            )
            db.add(admin)

        # Create sample user
        existing_user = await db.scalar(select(User).where(User.email == "user@example.com"))
        if not existing_user:
            user = User(
                email="user@example.com",
                username="cinefan",
                hashed_password=get_password_hash("User1234"),
                full_name="Кино-Фанат",
                bio="Люблю хорошее кино!",
                is_active=True,
            )
            db.add(user)

        await db.commit()

        # Create genres
        genre_map = {}
        for name, slug in GENRES:
            existing = await db.scalar(select(Genre).where(Genre.slug == slug))
            if not existing:
                genre = Genre(name=name, slug=slug)
                db.add(genre)
                await db.flush()
                genre_map[slug] = genre
            else:
                genre_map[slug] = existing

        await db.commit()

        # Create movies
        for movie_data in MOVIES:
            existing = await db.scalar(
                select(Movie).where(Movie.title == movie_data["title"])
            )
            if not existing:
                genre_slugs = movie_data.pop("genres", [])
                movie = Movie(**movie_data)
                movie.genres = [genre_map[s] for s in genre_slugs if s in genre_map]
                db.add(movie)

        await db.commit()
        print("Database seeded successfully!")
        print("   Admin: admin@cinerating.com / Admin123")
        print("   User:  user@example.com / User1234")


if __name__ == "__main__":
    asyncio.run(seed())
