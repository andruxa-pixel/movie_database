"""
Quick-fix script: updates movie poster/backdrop URLs in the database
to match the corrected values in seed.py.
Run: python fix_posters.py
"""
import asyncio
from sqlalchemy import update
from app.core.database import AsyncSessionLocal, engine, Base
from app.models.movie import Movie
import app.models  # noqa: F401

POSTER_FIXES = [
    {
        "original_title": "The Godfather",
        "poster_url": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLeMaNMKpxs.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    },
    {
        "original_title": "Schindler's List",
        "poster_url": "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg",
    },
    {
        "original_title": "Inception",
        "poster_url": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    },
    {
        "original_title": "The Shawshank Redemption",
        "poster_url": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    },
    {
        "original_title": "The Dark Knight",
        "poster_url": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsqX7An9LH.jpg",
    },
    {
        "original_title": "The Lord of the Rings: The Return of the King",
        "poster_url": "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/lXhgCODAbBXL5buk9yEmTpOoOgR.jpg",
    },
    {
        "original_title": "Interstellar",
        "poster_url": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    },
    {
        "original_title": "The Matrix",
        "poster_url": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
    },
]


async def fix_posters():
    async with AsyncSessionLocal() as db:
        for fix in POSTER_FIXES:
            await db.execute(
                update(Movie)
                .where(Movie.original_title == fix["original_title"])
                .values(
                    poster_url=fix["poster_url"],
                    backdrop_url=fix["backdrop_url"],
                )
            )
        await db.commit()
        print("Poster URLs updated for all movies.")


if __name__ == "__main__":
    asyncio.run(fix_posters())
