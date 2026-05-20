from fastapi import APIRouter

from app.api.v1.routes import auth, movies, reviews, users, favorites

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(movies.router, prefix="/movies", tags=["movies"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
