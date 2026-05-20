from app.crud.user import crud_user
from app.crud.movie import crud_movie, crud_genre, crud_person
from app.crud.review import crud_review
from app.crud.favorite import crud_favorite, crud_watchlist

__all__ = [
    "crud_user",
    "crud_movie",
    "crud_genre",
    "crud_person",
    "crud_review",
    "crud_favorite",
    "crud_watchlist",
]
