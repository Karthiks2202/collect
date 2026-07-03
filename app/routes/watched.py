from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.viewed_movie import ViewedMovie
from app.models.watchlist import Watchlist
from app.schemas.viewed_movie import ViewedMovieCreate

# Notification Service
from app.services.notification_service import send_notification

router = APIRouter(
    prefix="/watched",
    tags=["Watched History"]
)


# =================================
# MARK MOVIE AS WATCHED
# =================================
@router.post("/")
def mark_as_watched(
    movie_data: ViewedMovieCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Prevent duplicate watched movie records for the same user
    existing = (
        db.query(ViewedMovie)
        .filter(
            ViewedMovie.user_id == current_user.id,
            ViewedMovie.movie_id == movie_data.movie_id
        )
        .first()
    )

    if not existing:
        new_watched = ViewedMovie(
            user_id=current_user.id,
            movie_id=movie_data.movie_id,
            movie_title=movie_data.movie_title,
            genre=movie_data.genre,
            poster=movie_data.poster,
            imdb_rating=movie_data.imdb_rating
        )
        db.add(new_watched)
        db.commit()
        db.refresh(new_watched)
        
        # Create notification for watched history
        send_notification(
            db=db,
            user_id=current_user.id,
            message=f'"{movie_data.movie_title}" was added to watched history.',
            notification_type="watched"
        )
        result = new_watched
    else:
        result = existing

    # If movie is marked as watched and already exists in the user's watchlist, remove it automatically
    watchlist_item = (
        db.query(Watchlist)
        .filter(
            Watchlist.user_id == current_user.id,
            Watchlist.movie_id == movie_data.movie_id
        )
        .first()
    )
    if watchlist_item:
        movie_title = watchlist_item.movie_title
        db.delete(watchlist_item)
        db.commit()
        
        # Create notification for watchlist removal
        send_notification(
            db=db,
            user_id=current_user.id,
            message=f'"{movie_title}" was automatically removed from watchlist because you watched it.',
            notification_type="watchlist"
        )

    return {
        "success": True,
        "message": "Movie marked as watched",
        "data": {
            "id": result.id,
            "movie_id": result.movie_id,
            "movie_title": result.movie_title,
            "poster": result.poster,
            "genre": result.genre,
            "imdb_rating": result.imdb_rating,
            "watched_date": result.viewed_at.isoformat() if result.viewed_at else None,
            "user_id": result.user_id
        }
    }


# =================================
# GET WATCHED HISTORY
# =================================
@router.get("/")
def get_watched_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history = (
        db.query(ViewedMovie)
        .filter(
            ViewedMovie.user_id == current_user.id
        )
        .order_by(
            ViewedMovie.viewed_at.desc()
        )
        .all()
    )

    return {
        "success": True,
        "data": [
            {
                "id": item.id,
                "movie_id": item.movie_id,
                "movie_title": item.movie_title,
                "poster": item.poster,
                "genre": item.genre,
                "imdb_rating": item.imdb_rating,
                "watched_date": item.viewed_at.isoformat() if item.viewed_at else None,
                "user_id": item.user_id
            }
            for item in history
        ]
    }


# =================================
# DELETE WATCHED MOVIE (BY MOVIE_ID STRING)
# =================================
@router.delete("/{movieId}")
def remove_watched(
    movieId: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    movie = (
        db.query(ViewedMovie)
        .filter(
            ViewedMovie.movie_id == movieId,
            ViewedMovie.user_id == current_user.id
        )
        .first()
    )

    if not movie:
        raise HTTPException(
            status_code=404,
            detail="Movie not found in watched history"
        )

    movie_title = movie.movie_title
    db.delete(movie)
    db.commit()

    # Create notification for removal
    send_notification(
        db=db,
        user_id=current_user.id,
        message=f'"{movie_title}" was removed from watched history.',
        notification_type="watched"
    )

    return {
        "success": True,
        "message": "Removed from watched history"
    }


# =================================
# GET WATCHED STATUS (BY MOVIE_ID STRING)
# =================================
@router.get("/status/{movieId}")
def get_watched_status(
    movieId: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    watched_item = (
        db.query(ViewedMovie)
        .filter(
            ViewedMovie.movie_id == movieId,
            ViewedMovie.user_id == current_user.id
        )
        .first()
    )

    watchlist_item = (
        db.query(Watchlist)
        .filter(
            Watchlist.movie_id == movieId,
            Watchlist.user_id == current_user.id
        )
        .first()
    )

    return {
        "success": True,
        "watched": watched_item is not None,
        "watchlist": watchlist_item is not None,
        "watched_date": watched_item.viewed_at.isoformat() if (watched_item and watched_item.viewed_at) else None
    }
