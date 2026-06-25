from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user

from app.models.user import User
from app.models.watchlist import Watchlist

from app.schemas.watchlist import WatchlistCreate

# Notification Service
from app.services.notification_service import send_notification

router = APIRouter(
    prefix="/watchlist",
    tags=["Watchlist"]
)


# =================================
# ADD TO WATCHLIST
# =================================
@router.post("/")
def add_watchlist(
    watchlist: WatchlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing = (
        db.query(Watchlist)
        .filter(
            Watchlist.user_id == current_user.id,
            Watchlist.movie_id == watchlist.movie_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Movie already in watchlist"
        )

    new_movie = Watchlist(
        user_id=current_user.id,
        movie_id=watchlist.movie_id,
        movie_title=watchlist.movie_title,
        genre=watchlist.genre,
        poster=watchlist.poster
    )

    db.add(new_movie)
    db.commit()
    db.refresh(new_movie)

    # Create notification
    send_notification(
        db=db,
        user_id=current_user.id,
        message=f'"{watchlist.movie_title}" was added to your watchlist.',
        notification_type="watchlist"
    )

    return {
        "success": True,
        "message": "Movie added to watchlist"
    }


# =================================
# GET WATCHLIST
# =================================
@router.get("/")
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    movies = (
        db.query(Watchlist)
        .filter(
            Watchlist.user_id == current_user.id
        )
        .all()
    )

    return {
        "success": True,
        "watchlist": movies
    }


# =================================
# DELETE WATCHLIST MOVIE
# =================================
@router.delete("/{movie_id}")
def remove_watchlist(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    movie = (
        db.query(Watchlist)
        .filter(
            Watchlist.id == movie_id,
            Watchlist.user_id == current_user.id
        )
        .first()
    )

    if not movie:
        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )

    movie_title = movie.movie_title

    db.delete(movie)
    db.commit()

    # Create notification
    send_notification(
        db=db,
        user_id=current_user.id,
        message=f'"{movie_title}" was removed from your watchlist.',
        notification_type="watchlist"
    )

    return {
        "success": True,
        "message": "Removed from watchlist"
    }